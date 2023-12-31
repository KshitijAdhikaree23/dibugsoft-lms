/**
* A wrapper view for controls.
*/
define((require) => {
  'use strict';

  const _ = require('underscore');
  const ParentView = require('components/generic-list/common/views/parent-view');

  const CheckboxFilter = require('components/filter/views/checkbox-filter');
  const DropDownFilter = require('components/filter/views/drop-down-filter');
  const LearnerSearch = require('learners/roster/views/search');
  const rosterControlsTemplate = require('learners/roster/templates/controls.underscore');

  require('components/skip-link/behaviors/skip-link-behavior');

  const RosterControlsView = ParentView.extend({
    template: _.template(rosterControlsTemplate),

    regions: {
      search: '.learners-search-container',
      skipLink: '.skip-link',
      cohortFilter: '.learners-cohort-filter-container',
      enrollmentTrackFilter: '.learners-enrollment-track-filter-container',
      activeFilter: '.learners-active-filter-container',
    },

    ui: {
      skipLink: '.skip-link',
    },

    behaviors: {
      SkipLinkBehavior: {},
    },

    templateHelpers: {
      skipToResults: gettext('Skip to results'),
    },

    initialize(options) {
      this.options = options || {};
      const { courseMetadata } = this.options;

      const defaultFilterOptions = {
        collection: this.options.collection,
        trackingModel: this.options.trackingModel,
        trackSubject: this.options.trackSubject,
        appClass: this.options.appClass,
      };

      this.childViews = [
        {
          region: 'search',
          class: LearnerSearch,
          options: {
            collection: this.options.collection,
            name: 'text_search',
            placeholder: gettext('Find a learner'),
            trackingModel: this.options.trackingModel,
          },
        },
      ];

      if (!_(courseMetadata.get('cohorts')).isEmpty()) {
        this.childViews = this.childViews.concat({
          region: 'cohortFilter',
          class: DropDownFilter,
          options: _({
            filterKey: 'cohort',
            filterValues: courseMetadata.getFilterOptions('cohorts'),
            sectionDisplayName: gettext('Cohort Groups'),
          }).defaults(defaultFilterOptions),
        });
      }

      if (!_(courseMetadata.get('enrollment_modes')).isEmpty()) {
        this.childViews = this.childViews.concat({
          region: 'enrollmentTrackFilter',
          class: DropDownFilter,
          options: _({
            filterKey: 'enrollment_mode',
            filterValues: courseMetadata.getFilterOptions('enrollment_modes'),
            sectionDisplayName: gettext('Enrollment Tracks'),
          }).defaults(defaultFilterOptions),
        });
      }

      if (!_(courseMetadata.get('segments')).isEmpty()) {
        this.childViews = this.childViews.concat({
          region: 'activeFilter',
          class: CheckboxFilter,
          options: _({
            filterKey: 'ignore_segments',
            // inactive is the only segment filter on the learner roster page
            filterValues: [{
              name: 'inactive',
              // Translators: inactive meaning that these learners have not interacted with the
              // course recently.
              displayName: gettext('Hide Inactive Learners'),
            }],
          }).defaults(defaultFilterOptions),
        });
      }
    },
  });

  return RosterControlsView;
});
