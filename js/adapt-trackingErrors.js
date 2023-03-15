import Adapt from 'core/js/adapt';
import ErrorNotificationManager from './errorNotificationManager';

class TrackingErrors extends Backbone.Controller {

  initialize() {
    this._config = null;
    this._errorNotificationManager = null;

    this.listenTo(Adapt, {
      'app:dataLoaded': this.onAppDataLoaded
    });
  }

  _initializeErrors() {
    const config = this._config._notifications;
    this._errorNotificationManager = new ErrorNotificationManager(config);
  }

  onAppDataLoaded() {
    if (this._errorNotificationManager) this._errorNotificationManager.destroy();
    this._config = Adapt.course.get('_trackingErrors');
    if (this._config?._isEnabled) this._initializeErrors();
  }

}

export default (Adapt.trackingErrors = new TrackingErrors());
