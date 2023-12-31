define((require) => {
  'use strict';

  const Backbone = require('backbone');

  const ListUtils = require('components/utils/utils');

  const EngagementTimelineModel = Backbone.Model.extend({
    /* Days is an array of objects, with each object containing the
         * following keys:
         *      - date (string) ISO 8601 date
         *      - discussion_contributions (int) number of discussions
         *        contributed to on the specified date.
         *      - problems_attempted (int) number of problems
         *        attempted on the specified date.
         *      - problems_completed (int) number of problems
         *        completed on the specified date.
         *      - videos_viewed (int) number of videos
         *        viewed on the specified date.
         */
    defaults: {
      days: [],
    },

    initialize(attributes, options) {
      Backbone.Model.prototype.initialize.call(this, attributes, options);
      this.options = options || {};
    },

    url() {
      return `${this.options.url}?course_id=${encodeURIComponent(this.options.courseId)}`;
    },

    fetch() {
      return Backbone.Model.prototype.fetch.apply(this, arguments)
        .fail(ListUtils.handleAjaxFailure.bind(this));
    },

    hasData() {
      return this.get('days').length > 0;
    },
  });

  return EngagementTimelineModel;
});
