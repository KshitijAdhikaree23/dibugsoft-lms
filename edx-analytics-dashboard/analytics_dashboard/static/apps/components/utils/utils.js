// eslint-disable-next-line no-unused-vars
define((require) => {
  'use strict';

  const utils = {
    /**
         * Handle an AJAX request which has failed due to either a
         * network error or a server error.  For use within the
         * jqXHR.fail() promise method.
         *
         * When using this function, bind it to an object which
         * extends Backbone.Events.
         *
         * @param jqXHR a jQuery XHR object.
         * @param textStatus
         */
    handleAjaxFailure(jqXHR, textStatus) {
      if (jqXHR.readyState === 4) {
        // Request completed; server error
        this.trigger('serverError', jqXHR.status, jqXHR.responseJSON);
      } else {
        // Request incomplete; network error
        this.trigger('networkError', textStatus);
      }
    },

    /**
         * Transforms events coming from one object to new events on another
         * object.
         *
         * @param originator (object) An object extending Backbone.Events.
         * @param transformFunctions (object) An object hashing event names to
         * event transformation functions.  The event transformation functions
         * take an event name and its arguments and return a new event arguments
         * array.  See 'EventTransformers' for examples.
         * @param forwarder (object) A Marionette object which should trigger
         * the transformed events via 'triggerMethod'.
         */
    mapEvents(originator, transformFunctions, forwarder) {
      Object.keys(transformFunctions).forEach((eventName) => {
        forwarder.listenTo(originator, eventName, function () {
          const transformFunc = transformFunctions[eventName];
          const newEventArguments = transformFunc.apply(forwarder, arguments);
          // eslint-disable-next-line prefer-spread
          forwarder.triggerMethod.apply(forwarder, newEventArguments);
        });
      });
    },

    /**
         * Encapsulates a few common event transformer functions for translating
         * model/collection events to view events.
         */
    EventTransformers: {
      /**
             * Transforms an AJAX server error (as defined in handleAjaxFailure)
             * to an application error.
             */
      serverErrorToAppError(status) {
        if (status === 504) {
          return ['appError', {
            // Translators: "504" is a number representing a server error, so please leave it as "504".
            title: gettext('504: Server error'),
            // eslint-disable-next-line max-len
            description: gettext('Processing your request took too long to complete. Reload the page to try again.'),
          }];
        }
        return ['appError', {
          title: gettext('Server error'),
          description: gettext('Your request could not be processed. Reload the page to try again.'),
        }];
      },

      /**
             * Transforms an AJAX network error (as defined in
             * handleAjaxFailure) to an application error.
             */
      networkErrorToAppError() {
        return ['appError', {
          title: gettext('Network error'),
          description: gettext('Your request could not be processed. Reload the page to try again.'),
        }];
      },

      /**
             * Translates a model/collection 'sync' event to an application
             * 'clearError' event.
             */
      syncToClearError() {
        return ['clearError'];
      },
    },
  };

  return utils;
});
