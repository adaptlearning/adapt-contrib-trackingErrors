import Adapt from 'core/js/adapt';
import Data from 'core/js/data';
import Logging from 'core/js/logging';
import Notify from 'core/js/notify';
import Wait from 'core/js/wait';

const INITIALIZE_ID = 'INITIALIZE-ERROR';
const CONNECTION_ERROR_ID = 'CONNECTION-ERROR';
const CONNECTION_SUCCESS_ID = 'CONNECTION-SUCCESS';
const DATA_ID = 'DATA-ERROR';
const TERMINATION_ID = 'TERMINATION-ERROR';

export default class ErrorNotificationManager extends Backbone.Model {

  initialize() {
    this._isDisconnected = false;
    this._isNotifyOpen = false;
    this._retryCount = 0;
    this._retryCallbacks = [];
    this._currentNotifyId = null;
    this._currentNotify = null;

    this.listenTo(Adapt, {
      'tracking:initializeError': this.onInitializeError,
      'tracking:connectionError': this.onConnectionError,
      'tracking:connectionSuccess': this.onConnectionSuccess,
      'tracking:dataError': this.onDataError,
      'tracking:terminationError': this.onTerminationError,
      'tracking:retry': this.onRetry,
      'tracking:close': this.onCloseCourse,
      'notify:closed': this.onNotifyClosed
    });
  }

  async _showNotification(config, id) {
    if (!Data.isReady) await Data.whenReady();

    if (!this._isNotifyOpen) {
      this._stopAdaptLoading();
      (this._currentNotifyId === CONNECTION_SUCCESS_ID) ? Logging.debug(config.title) : Logging.error(config.title);
      const notifyConfig = this._getNotifyConfig(...arguments);
      this._currentNotify = Notify[notifyConfig._type](notifyConfig);
      this._isNotifyOpen = true;
      this._currentNotifyId = id;
      if (this._currentNotifyId === CONNECTION_ERROR_ID) this._retryCount++;
    } else if (this._currentNotifyId !== id) {
      this.listenToOnce(Adapt, 'notify:closed', this._showNotification.bind(this, ...arguments));
    }
  }

  _stopAdaptLoading() {
    // utilise waits to prevent any loading execution and to prevent notifications from being closed via Adapt.remove
    Wait.begin();
    $('.js-loading').hide();
  }

  _getNotifyConfig(config, id) {
    const notifyConfig = {
      title: config.title,
      body: config.body,
      _classes: `trackingError ${id.toLowerCase()} ${config._classes}`,
      _isTrackingError: true
    };

    let isCancellable = true;

    if (Object.prototype.hasOwnProperty.call(config, '_isCancellable')) {
      isCancellable = config._isCancellable;
      notifyConfig._isCancellable = isCancellable;
      notifyConfig._closeOnShadowClick = !isCancellable;
    }

    if (this._hasPrompts(config)) {
      const prompts = [];

      if (this._canRetry(config)) {
        prompts.push({
          promptText: config._retryPrompt?.label ?? 'Retry',
          _callbackEvent: 'tracking:retry'
        });
      }

      if (this._canCloseCourse(config)) {
        prompts.push({
          promptText: config._closeCoursePrompt?.label ?? 'Close',
          _callbackEvent: 'tracking:close'
        });
      }

      if (this._canClosePrompt(config)) {
        prompts.push({
          promptText: config._closePrompt?.label ?? 'OK'
        });
      }

      notifyConfig._prompts = prompts;
      notifyConfig._type = 'prompt';
    } else {
      notifyConfig._type = 'popup';
    }

    return notifyConfig;
  }

  _hasPrompts(config) {
    return this._canRetry(config) || this._canCloseCourse(config) || this._canClosePrompt(config);
  }

  _canRetry(config) {
    const retryConfig = config._retryPrompt;
    if (!retryConfig?._isEnabled) return false;
    const retryLimit = this._getRetryLimit(config);
    if (retryLimit === 0 || !this._hasRetryCallbacks) return false;
    return this._retryCount < retryLimit;
  }

  _getRetryLimit(config) {
    const retryConfig = config._retryPrompt;
    if (!retryConfig?._isEnabled) return 0;
    return retryConfig?._limit ?? 0;
  }

  _canCloseCourse(config) {
    const closeConfig = config._closeCoursePrompt;
    return closeConfig?._isEnabled;
  }

  _canClosePrompt(config) {
    const closeConfig = config._closePrompt;
    return closeConfig?._isEnabled;
  }

  get _hasRetryCallbacks() {
    return this._retryCallbacks.length > 0;
  }

  onInitializeError() {
    const config = this.get('_initialize');
    if (config?._isEnabled) this._showNotification(config, INITIALIZE_ID);
  }

  onConnectionError(callback = null) {
    this._isDisconnected = true;
    if (callback) this._retryCallbacks.push(callback);
    const connectionConfig = this.get('_connection');
    if (!connectionConfig?._isEnabled) return;
    let config = connectionConfig;
    const attemptsConfig = connectionConfig._attempts;

    if (attemptsConfig) {
      let attemptConfig;
      // use final message if no retries
      if (!this._canRetry(connectionConfig)) {
        attemptConfig = attemptsConfig._final;
      } else {
        attemptConfig = (this._retryCount === 0) ? attemptsConfig._first : attemptsConfig._intermediate;
      }

      config = Object.assign(connectionConfig, attemptConfig);
    };

    if (config) this._showNotification(config, CONNECTION_ERROR_ID);
  }

  onConnectionSuccess() {
    // don't display success notification if not previously disconnected
    if (!this._isDisconnected) return;
    this._isDisconnected = false;
    this._retryCount = 0;
    const connectionConfig = this.get('_connection');
    if (!connectionConfig?._isEnabled) return;

    // close connection error message early
    if (this._currentNotifyId === CONNECTION_ERROR_ID && connectionConfig._closeErrorOnSuccess) {
      this._currentNotify.closeNotify();
    }

    const attemptsConfig = connectionConfig._attempts;
    if (!attemptsConfig) return;
    const config = attemptsConfig._success;
    if (config) this._showNotification(config, CONNECTION_SUCCESS_ID);
  }

  onDataError() {
    const config = this.get('_data');
    if (config?._isEnabled) this._showNotification(config, DATA_ID);
  }

  onTerminationError() {
    const config = this.get('_termination');
    if (config?._isEnabled) this._showNotification(config, TERMINATION_ID);
  }

  onNotifyClosed(notify) {
    if (!notify.model.get('_isTrackingError')) return;
    Wait.end();
    // cancel other tracking errors if failed to initialize and user dismissed, as it won't track regardless
    if (this._currentNotifyId === INITIALIZE_ID) this.stopListening();
    this._isNotifyOpen = false;
    this._currentNotifyId = null;
  }

  onRetry() {
    if (!this._hasRetryCallbacks) return;
    this._retryCallbacks.forEach(callback => callback());
    this._retryCallbacks = [];
  }

  onCloseCourse() {
    this._retryCallbacks = [];
    window.top.close();
  }

}
