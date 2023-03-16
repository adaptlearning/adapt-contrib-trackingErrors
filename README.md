# adapt-contrib-trackingErrors

An extension which manages and displays notifications to provide a consistent UI for tracking based errors across plugins.

Notifications are split into four main error types:
 * **initialize** - errors during launch
 * **connection** - errors when attempting data transmission
 * **data** - errors due to invalid or malformed data transmission
 * **termination** - errors when closing the session

Each notification can be configured to display appropriate messaging, and prevent learners from proceeding further through the course if required. Connection based errors have the option to retry the previously failed data transmission to a configurable attempt limit.

## Usage

Plugins which handle tracking functionality, e.g. SCORM; xAPI; cmi5; can hook into the notifications through the [event](https://github.com/adaptlearning/adapt-contrib-trackingErrors#events) driven model. Each plugin will be responsible for triggering the suitable event to match the error type, and in the case of connection based errors, the callback function for any retry attempts. This plugin only handles the UI and does not attempt to resolve any errors.

## Attributes

The attributes listed below are used in *course.json*, and are properly formatted as JSON in [*example.json*](https://github.com/adaptlearning/adapt-contrib-trackingErrors/blob/master/example.json).

**\_isEnabled** (boolean): Determines whether the notifications are enabled. The default is `true`.

**\_notifications** (object): The settings used to configure the different notification error types. Contains the following attributes:

 * **\_initialize** (object): The settings used to configure the initialization error type. Contains the following attributes:

   * **\_isEnabled** (boolean): Determines whether this notification is enabled. The default is `true`.

   * **\_classes** (string): CSS class name to be applied to the popup. The class must be predefined in one of the LESS files. Separate multiple classes with a space.

   * **title** (string): The text used as the popup title. Leave empty if no title is required.

   * **body** (string): The text used to inform/instruct users about the error.

   * **\_isCancellable** (boolean): Determines whether the notification can be cancelled/closed. A `false` value will act as a fatal error and prevent the user from progressing through the course. The default is `false`.

   * **\_closeCoursePrompt** (object): The settings used to configure the close prompt within the notification. Contains the following attributes:

     * **\_isEnabled** (boolean): Determines whether a button prompt to close the course window (only possible if the course was launched in a popup window) is included. The default is `false`.

     * **label** (string): Text that appears on the button.

 * **\_connection** (object): The settings used to configure the connection error type. Contains the following attributes:

   * **\_isEnabled** (boolean): Determines whether this notification is enabled. The default is `true`.

   * **\_closeErrorOnSuccess** (boolean): Determines whether the notification is automatically closed should the connection be resolved. The default is `false`.

   * **\_attempts** (object): The settings used to configure the different notifications based on connection attempts. Contains the following attributes:

     * **\_first** (object): The settings used to configure the first failed connection attempt notification. Contains the following attributes:

       * **\_classes** (string): CSS class name to be applied to the popup. The class must be predefined in one of the LESS files. Separate multiple classes with a space.

       * **title** (string): The text used as the popup title. Leave empty if no title is required.

       * **body** (string): The text used to inform/instruct users about the error.

       * **\_isCancellable** (boolean): Determines whether the notification can be cancelled/closed. A `false` value will act as a fatal error and prevent the user from progressing through the course. The default is `false`.

     * **\_intermediate** (object): The settings used to configure the intermediate failed connection attempt notifications. Contains the following attributes:

       * **\_classes** (string): CSS class name to be applied to the popup. The class must be predefined in one of the LESS files. Separate multiple classes with a space.

       * **title** (string): The text used as the popup title. Leave empty if no title is required.

       * **body** (string): The text used to inform/instruct users about the error.

       * **\_isCancellable** (boolean): Determines whether the notification can be cancelled/closed. A `false` value will act as a fatal error and prevent the user from progressing through the course. The default is `false`.

     * **\_final** (object): The settings used to configure intermediate (not first or final) failed connection attempt notifications. Contains the following attributes:

       * **\_classes** (string): CSS class name to be applied to the popup. The class must be predefined in one of the LESS files. Separate multiple classes with a space.

       * **title** (string): The text used as the popup title. Leave empty if no title is required.

       * **body** (string): The text used to inform/instruct users about the error.

       * **\_isCancellable** (boolean): Determines whether the notification can be cancelled/closed. A `false` value will act as a fatal error and prevent the user from progressing through the course. The default is `false`.

     * **\_success** (object): The settings used to configure the notification to indicate the connection has been restored and data successfully transmitted. Contains the following attributes:

       * **\_classes** (string): CSS class name to be applied to the popup. The class must be predefined in one of the LESS files. Separate multiple classes with a space.

       * **title** (string): The text used as the popup title. Leave empty if no title is required.

       * **body** (string): The text used to inform/instruct users about the error.

       * **\_isCancellable** (boolean): Determines whether the notification can be cancelled/closed. A `false` value will act as a fatal error and prevent the user from progressing through the course. The default is `false`.

       * **\_closePrompt** (object): The settings used to configure the close prompt within the notification. Contains the following attributes:

         * **\_isEnabled** (boolean): Determines whether a button prompt to close the notification (separate to the default notify close button) is included. The default is `true`.

         * **label** (string): Text that appears on the button.

     * **\_retryPrompt** (object): The settings used to configure the retry prompt within the notification. Contains the following attributes:

       * **\_isEnabled** (boolean): Determines whether a button prompt to retry the failed data transmission is included. The default is `true`.

       * **\_limit** (number): The limit for retry attempts. The default is `2`.

       * **label** (string): Text that appears on the button.

     * **\_closeCoursePrompt** (object): The settings used to configure the close prompt within the notification. Contains the following attributes:

       * **\_isEnabled** (boolean): Determines whether a button prompt to close the course window (only possible if the course was launched in a popup window) is included. The default is `false`.

       * **label** (string): Text that appears on the button.

 * **\_data** (object): The settings used to configure the data error type. Contains the following attributes:

   * **\_isEnabled** (boolean): Determines whether this notification is enabled. The default is `true`.

   * **\_classes** (string): CSS class name to be applied to the popup. The class must be predefined in one of the LESS files. Separate multiple classes with a space.

   * **title** (string): The text used as the popup title. Leave empty if no title is required.

   * **body** (string): The text used to inform/instruct users about the error.

   * **\_isCancellable** (boolean): Determines whether the notification can be cancelled/closed. A `false` value will act as a fatal error and prevent the user from progressing through the course. The default is `false`.

   * **\_closeCoursePrompt** (object): The settings used to configure the close prompt within the notification. Contains the following attributes:

     * **\_isEnabled** (boolean): Determines whether a button prompt to close the course window (only possible if the course was launched in a popup window) is included. The default is `false`.

     * **label** (string): Text that appears on the button.

 * **\_termination** (object): The settings used to configure the termination error type. Contains the following attributes:

   * **\_isEnabled** (boolean): Determines whether this notification is enabled. The default is `true`.

   * **\_classes** (string): CSS class name to be applied to the popup. The class must be predefined in one of the LESS files. Separate multiple classes with a space.

   * **title** (string): The text used as the popup title. Leave empty if no title is required.

   * **body** (string): The text used to inform/instruct users about the error.

   * **\_isCancellable** (boolean): Determines whether the notification can be cancelled/closed. A `false` value will act as a fatal error and prevent the user from progressing through the course. The default is `false`.

   * **\_closeCoursePrompt** (object): The settings used to configure the close prompt within the notification. Contains the following attributes:

     * **\_isEnabled** (boolean): Determines whether a button prompt to close the course window (only possible if the course was launched in a popup window) is included. The default is `false`.

     * **label** (string): Text that appears on the button.

## Events

The following events should be triggered by tracking plugins to utilise the notifications for the different error types:

**Adapt#tracking:initializeError**<br>
**Adapt#tracking:connectionError**<br>
**Adapt#tracking:connectionSuccess**<br>
**Adapt#tracking:dataError**<br>
**Adapt#tracking:terminationError**

----------------------------
**Version number:** 0.0.1 (pre-release)<br>
**Framework versions:** >= 5.3<br>
**Author / maintainer:** Adapt Core Team with [contributors](https://github.com/adaptlearning/adapt-contrib-trackingErrors/graphs/contributors)
