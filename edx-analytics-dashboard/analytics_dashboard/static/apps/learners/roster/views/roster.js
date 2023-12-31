/**
 * Renders a sortable, filterable, and searchable paginated table of
 * learners for the Learner Analytics app.
 *
 * Requires the following values in the options hash:
 * - options.collection - an instance of LearnerCollection
 */
define((require) => {
  'use strict';

  const _ = require('underscore');

  const ListUtils = require('components/utils/utils');
  const ListView = require('components/generic-list/list/views/list');
  const ActiveDateRangeView = require('learners/roster/views/activity-date-range');
  const ActiveFiltersView = require('learners/roster/views/active-filters');
  const DownloadDataView = require('components/download/views/download-data');
  const LearnerResultsView = require('learners/roster/views/results');
  const RosterControlsView = require('learners/roster/views/controls');
  const NumResultsView = require('components/generic-list/list/views/num-results');
  const rosterTemplate = require('learners/roster/templates/roster.underscore');

  const LearnerRosterView = ListView.extend({
    className: 'learner-roster',

    template: _.template(rosterTemplate),

    regions: {
      activeFilters: '.learners-active-filters',
      activityDateRange: '.activity-date-range',
      downloadData: '.learners-download-data',
      controls: '.learners-table-controls',
      results: '.learners-results',
      numResults: '.learners-num-results',
    },

    initialize(options) {
      ListView.prototype.initialize.call(this, options);

      const eventTransformers = {
        serverError: ListUtils.EventTransformers.serverErrorToAppError,
        networkError: ListUtils.EventTransformers.networkErrorToAppError,
        sync: ListUtils.EventTransformers.syncToClearError,
      };
      ListUtils.mapEvents(this.options.courseMetadata, eventTransformers, this);

      this.childViews = [
        {
          region: 'activeFilters',
          class: ActiveFiltersView,
          options: {
            collection: this.options.collection,
            showChildrenOnRender: true,
          },
        },
        {
          region: 'activityDateRange',
          class: ActiveDateRangeView,
          options: {
            model: this.options.courseMetadata,
          },
        },
        {
          region: 'downloadData',
          class: DownloadDataView,
          options: {
            collection: this.options.collection,
            trackingModel: this.options.trackingModel,
            trackCategory: 'learner_roster',
          },
        },
        {
          region: 'controls',
          class: RosterControlsView,
          options: {
            collection: this.options.collection,
            courseMetadata: this.options.courseMetadata,
            trackingModel: this.options.trackingModel,
            trackSubject: this.options.trackSubject,
            appClass: this.options.appClass,
          },
        },
        {
          region: 'results',
          class: LearnerResultsView,
          options: {
            collection: this.options.collection,
            courseMetadata: this.options.courseMetadata,
            hasData: this.options.hasData,
            trackingModel: this.options.trackingModel,
            tableName: this.options.tableName,
            trackSubject: this.options.trackSubject,
            appClass: this.options.appClass,
          },
        },
        {
          region: 'numResults',
          class: NumResultsView,
          options: {
            collection: this.options.collection,
            appClass: this.options.appClass,
          },
        },
      ];

      this.controlsLabel = gettext('Learner roster controls');
    },
  });

  return LearnerRosterView;
});
