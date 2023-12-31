/**
 * A wrapper view for controls.
 */
define((require) => {
  'use strict';

  const _ = require('underscore');
  const ParentView = require('components/generic-list/common/views/parent-view');

  const CheckboxFilter = require('components/filter/views/checkbox-filter');
  const CourseListSearch = require('course-list/list/views/search');
  const courseListControlsTemplate = require('course-list/list/templates/controls.underscore');

  require('components/skip-link/behaviors/skip-link-behavior');

  const CourseListControlsView = ParentView.extend({
    template: _.template(courseListControlsTemplate),

    regions: {
      search: '.course-list-search-container',
      skipLink: '.skip-link',
      availabilityFilter: '.course-list-availability-filter-container',
      pacingTypeFilter: '.course-list-pacing-type-filter-container',
      programsFilter: '.course-list-programs-filter-container',
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

      const defaultFilterOptions = {
        collection: this.options.collection,
        trackingModel: this.options.trackingModel,
        trackSubject: this.options.trackSubject,
        appClass: this.options.appClass,
      };

      this.childViews = [{
        region: 'search',
        class: CourseListSearch,
        options: {
          collection: this.options.collection,
          name: 'text_search',
          placeholder: gettext('Find a course'),
          trackingModel: this.options.trackingModel,
        },
      }];

      if (this.options.filteringEnabled) {
        this.childViews = this.childViews.concat([{
          region: 'availabilityFilter',
          class: CheckboxFilter,
          options: _({
            filterKey: 'availability',
            filterValues: this.options.collection.getFilterValues('availability'),
            sectionDisplayName: this.options.collection.filterDisplayName('availability'),
          }).defaults(defaultFilterOptions),
        }, {
          region: 'pacingTypeFilter',
          class: CheckboxFilter,
          options: _({
            filterKey: 'pacing_type',
            filterValues: this.options.collection.getFilterValues('pacing_type'),
            sectionDisplayName: this.options.collection.filterDisplayName('pacing_type'),
          }).defaults(defaultFilterOptions),
        }, {
          region: 'programsFilter',
          class: CheckboxFilter,
          options: _({
            filterKey: 'program_ids',
            filterValues: this.options.collection.getFilterValues('program_ids'),
            sectionDisplayName: this.options.collection.filterDisplayName('program_ids'),
          }).defaults(defaultFilterOptions),
        }]);
      }
    },
  });

  return CourseListControlsView;
});
