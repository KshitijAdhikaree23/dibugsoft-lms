define((require) => {
  'use strict';

  const $ = require('jquery');
  const _ = require('underscore');
  const axe = require('axe-core');
  const moment = require('moment');
  const SpecHelpers = require('uitk/utils/spec-helpers/spec-helpers');

  const Utils = require('utils/utils');

  const CourseList = require('course-list/common/collections/course-list');
  const ProgramsCollection = require('course-list/common/collections/programs');
  const CourseListView = require('course-list/list/views/course-list');
  const CourseModel = require('course-list/common/models/course');
  const ProgramModel = require('course-list/common/models/program');
  const TrackingModel = require('models/tracking-model');

  describe('CourseListView', () => {
    const fixtureClass = 'course-list-view-fixture';

    const getCourseListView = (options, pageSize) => {
      const defaultOptions = _.defaults({}, options, { filteringEnabled: true });

      const programsCollection = defaultOptions.programsCollection || new ProgramsCollection(
        [
          new ProgramModel({
            program_id: '123',
            program_title: 'Alpaca Program',
            program_type: 'Camelid',
            course_ids: ['this/course/id'],
          }),
          new ProgramModel({
            program_id: '456',
            program_title: 'Zebra Program',
            program_type: 'Horse',
            course_ids: ['another-course-id'],
          }),
          new ProgramModel({
            program_id: '789',
            program_title: 'Courseless Program',
            program_type: 'Courseless',
            course_ids: [],
          })],
        defaultOptions.programCollectionOptions,
      );
      if (defaultOptions.collectionOptions === undefined) {
        defaultOptions.collectionOptions = {
          passingUsersEnabled: true,
        };
      }
      defaultOptions.collectionOptions.programsCollection = programsCollection;

      const collection = defaultOptions.collection || new CourseList(
        [
        // default course data
          new CourseModel({
            catalog_course_title: 'Alpaca',
            course_id: 'this/course/id',
            count: 10,
            cumulative_count: 20,
            count_change_7_days: 30,
            verified_enrollment: 40,
            passing_users: 50,
            start_date: '2015-02-17T050000',
            end_date: '2015-03-31T000000',
          }),
          new CourseModel({
            catalog_course_title: 'zebra',
            course_id: 'another-course-id',
            count: 0,
            cumulative_count: 1000,
            count_change_7_days: -10,
            verified_enrollment: 1000,
            passing_users: 2000,
            start_date: '2016-11-17T050000',
            end_date: '2016-12-01T000000',
          })],
        defaultOptions.collectionOptions,
      );

      if (pageSize) {
        collection.setPageSize(pageSize);
      }

      const view = new CourseListView({
        collection,
        el: `.${fixtureClass}`,
        trackSubject: 'course_list',
        hasData: true,
        trackingModel: new TrackingModel(),
        tableName: 'Course List',
        appClass: 'course-list',
        filteringEnabled: defaultOptions.filteringEnabled,
      }).render();
      view.onBeforeShow();
      return view;
    };

    const clickPagingControl = titleSelector => $(`a[title="${titleSelector}"]`).click();

    beforeEach(() => {
      setFixtures(`<div class="${fixtureClass}"></div>`);
    });

    it('renders a list of courses with number and date formatted', () => {
      const view = getCourseListView();

      moment.locale(Utils.getMomentLocale());

      _.chain(_.zip(view.collection.models, view.$('tbody tr'))).each((courseAndTr) => {
        const course = courseAndTr[0];
        const tr = courseAndTr[1];
        expect($(tr).find('th.course-name-cell .course-name')).toContainText(
          course.get('catalog_course_title'),
        );
        expect($(tr).find('th.course-name-cell .course-id')).toContainText(course.get('course_id'));
        expect($(tr).find('td.start_date')).toContainText(
          moment.utc(course.get('start_date').split('T')[0]).format('L'),
        );
        expect($(tr).find('td.end_date')).toContainText(
          moment.utc(course.get('end_date').split('T')[0]).format('L'),
        );
        expect($(tr).find('td.cumulative_count')).toContainText(
          Utils.localizeNumber(course.get('cumulative_count')),
        );
        expect($(tr).find('td.count')).toContainText(Utils.localizeNumber(course.get('count')));
        expect($(tr).find('td.count_change_7_days')).toContainText(
          Utils.localizeNumber(course.get('count_change_7_days')),
        );
        expect($(tr).find('td.verified_enrollment')).toContainText(
          Utils.localizeNumber(course.get('verified_enrollment')),
        );
        expect($(tr).find('td.passing_users')).toContainText(
          Utils.localizeNumber(course.get('passing_users')),
        );
      });
    });

    it('renders concise and a11y text when no date is provided', () => {
      const collection = new CourseList(
        [
          new CourseModel({
            catalog_course_title: 'Alpaca',
            course_id: 'this/course/id',
            count: 10,
            cumulative_count: 20,
            count_change_7_days: 30,
            verified_enrollment: 40,
          })],
        { programsCollection: new ProgramsCollection([]) },
      );
      const view = getCourseListView({ collection });

      _(['td.start_date', 'td.end_date']).each((selector) => {
        const $date = view.$el.find(selector);
        expect($date).toContainText('--');
        expect($date.find('.sr-only')).toContainText('Date not available');
      });
    });

    describe('filteringEnabled', () => {
      const filterSelectors = [
        '.course-list-availability-filter-container',
        '.course-list-pacing-type-filter-container',
        '.course-list-programs-filter-container',
      ];

      it('shows filters', () => {
        const view = getCourseListView({
          collectionOptions: {
            filterNameToDisplay: {
              pacing_type: {
                instructor_paced: 'Instructor-Paced',
                self_paced: 'Self-Paced',
              },
              availability: {
                Upcoming: 'Upcoming',
                Current: 'Current',
                Archived: 'Archived',
                unknown: 'Unknown',
              },
            },
          },
        });

        _(filterSelectors).each((selector) => {
          expect(view.$el.find(selector).children().length).not.toBe(0);
        });

        _(['Archived', 'Current', 'Upcoming', 'Unknown']).each((expectedText) => {
          expect(view.$el.find('#filter-availability')).toContainText(expectedText);
        });

        _(['Instructor-Paced', 'Self-Paced']).each((expectedText) => {
          expect(view.$el.find('#filter-pacing_type')).toContainText(expectedText);
        });

        _(['Alpaca Program', 'Zebra Program']).each((expectedText) => {
          expect(view.$el.find('#filter-program_ids')).toContainText(expectedText);
        });
      });

      it('hides filters', () => {
        const view = getCourseListView({ filteringEnabled: false });
        _(filterSelectors).each((selector) => {
          expect(view.$el.find(selector).children().length).toBe(0);
        });
      });
    });

    describe('passingUsersEnabled setting', () => {
      it('shows column', () => {
        const view = getCourseListView({
          collectionOptions: { passingUsersEnabled: true },
        });
        expect(view.$('.passing_users')).toContainText('Passing Learners');
      });

      it('hides column', () => {
        const view = getCourseListView({
          collectionOptions: { passingUsersEnabled: false },
        });
        expect(view.$('.passing_users')).not.toBeInDOM();
      });
    });

    describe('sorting', () => {
      let expectSortCalled;

      const getSortingHeaderLink = headerClass => $(`th.${headerClass} button`);

      const clickSortingHeader = headerClass => getSortingHeaderLink(headerClass).click();

      const executeSortTest = (field, isInitial) => {
        expect(getSortingHeaderLink(field).find('span.fa')).toHaveClass(isInitial ? 'fa-sort-asc' : 'fa-sort');
        clickSortingHeader(field);
        expectSortCalled(field, isInitial ? 'desc' : 'asc');
        clickSortingHeader(field);
        expectSortCalled(field, isInitial ? 'asc' : 'desc');
      };

      expectSortCalled = (sortField, sortValue) => expect(
        getSortingHeaderLink(sortField).find('span'),
      ).toHaveClass(`fa-sort-${sortValue}`);

      beforeEach(function () {
        this.view = getCourseListView();
      });

      SpecHelpers.withConfiguration({
        catalog_course_title: ['catalog_course_title', true],
        start_date: ['start_date'],
        end_date: ['end_date'],
        cumulative_count: ['cumulative_count'],
        count: ['count'],
        count_change_7_days: ['count_change_7_days'],
        verified_enrollment: ['verified_enrollment'],
      }, function (sortField, isInitial) {
        this.sortField = sortField;
        this.isInitial = isInitial;
      }, () => {
        it('by headers', function () {
          executeSortTest(this.sortField, this.isInitial);
        });
      });

      it('goes to the first page after applying a sort', () => {
        this.view = getCourseListView({}, 1);
        clickPagingControl('Page 2');
        expect(this.view.$('a[title="Page 2"]').parent('li')).toHaveClass('active');
        clickSortingHeader('catalog_course_title');
        expect(this.view.$('a[title="Page 1"]').parent('li')).toHaveClass('active');
      });

      SpecHelpers.withConfiguration({
        catalog_course_title: ['catalog_course_title', true],
        start_date: ['start_date'],
        end_date: ['end_date'],
        cumulative_count: ['cumulative_count'],
        count: ['count'],
        count_change_7_days: ['count_change_7_days'],
        verified_enrollment: ['verified_enrollment'],
        passing_users: ['passing_users'],
      }, function (column, isInitial) {
        this.column = column;
        this.isInitial = isInitial;
      }, () => {
        it('triggers a tracking event', function () {
          const directions = ['_asc', '_desc'];
          const triggerSpy = spyOn(this.view.options.trackingModel, 'trigger');
          const { column } = this;
          if (this.isInitial) {
            directions.reverse();
          }
          executeSortTest(column, this.isInitial);
          _.each(directions, (direction) => {
            expect(triggerSpy).toHaveBeenCalledWith('segment:track', 'edx.bi.course_list.sorted', {
              category: column + direction,
            });
          });
        });
      });
    });

    describe('paging', () => {
      const createTwoPageView = () => {
        const view = getCourseListView({}, 1);
        return view;
      };

      const expectLinkStates = (view, activeLinkTitle, disabledLinkTitles) => {
        view.$('li > a').each((_index, link) => {
          const $link = $(link);
          const $parentLi = $link.parent('li');
          if ($link.attr('title') === activeLinkTitle) {
            expect($parentLi).toHaveClass('active');
            expect($parentLi).not.toHaveClass('disabled');
          } else if (_.contains(disabledLinkTitles, $link.attr('title'))) {
            expect($parentLi).not.toHaveClass('active');
            expect($parentLi).toHaveClass('disabled');
          } else {
            expect($parentLi).not.toHaveClass('active');
            expect($parentLi).not.toHaveClass('disabled');
          }
        });
      };

      it('triggers a tracking event', () => {
        const view = createTwoPageView();
        const triggerSpy = spyOn(view.options.trackingModel, 'trigger');
        // navigate to page 2
        clickPagingControl('Next');
        expect(triggerSpy).toHaveBeenCalledWith('segment:track', 'edx.bi.course_list.paged', {
          category: 2,
        });
      });

      it('can jump to a particular page', () => {
        const view = createTwoPageView();
        clickPagingControl('Page 2');
        expectLinkStates(view, 'Page 2', ['Next', 'Last']);
      });

      it('can navigate to the next/previous page', () => {
        const view = createTwoPageView();

        clickPagingControl('Next');
        expectLinkStates(view, 'Page 2', ['Next', 'Last']);

        clickPagingControl('Previous');
        expectLinkStates(view, 'Page 1', ['First', 'Previous']);
      });

      it('does not enable pagination controls for unreachable pages', () => {
        const view = createTwoPageView();
        // Verify no request, no view change
        clickPagingControl('Previous');
        expectLinkStates(view, 'Page 1', ['First', 'Previous']);
      });
    });

    describe('no results', () => {
      it('renders a "no results" view when there is no course data in the initial collection', () => {
        const view = getCourseListView({
          collection: new CourseList([]),
        });
        expect(view.$('.alert-information'))
          .toContainText('No course data is currently available for your course.');
      });
    });

    describe('accessibility', () => {
      it('the table has a <caption> element', () => {
        const view = getCourseListView();
        expect(view.$('table > caption')).toBeInDOM();
      });

      it('all <th> elements have scope attributes', () => {
        const view = getCourseListView();
        view.$('thead th').each((_index, $th) => {
          expect($th).toHaveAttr('scope', 'col');
        });

        view.$('tbody th').each((_index, $th) => {
          expect($th).toHaveAttr('scope', 'row');
        });
      });

      it('all icons should be aria-hidden', () => {
        const view = getCourseListView();
        view.$('i').each((_index, el) => {
          expect($(el)).toHaveAttr('aria-hidden', 'true');
        });
      });

      it('sets focus to the top of the table after taking a paging action', () => {
        const view = getCourseListView({}, 1);
        const firstPageLink = view.$('.backgrid-paginator li a[title="Page 1"]');
        const secondPageLink = view.$('.backgrid-paginator li a[title="Page 2"]');
        // It would be ideal to use jasmine-jquery's
        // expect(...).toBeFocused(), but that doesn't seem to
        // be working with jQuery's focus method.  A spy is
        // the next-best option.
        spyOn($.fn, 'focus');
        firstPageLink.click();
        // The first page link is disabled, and since we
        // haven't changed pages, it should receive focus.
        expect(firstPageLink.focus).toHaveBeenCalled();
        secondPageLink.click();
        // The second page link is not disabled, and after
        // clicking it, we should set focus to the top of the
        // table.
        expect($('#course-list-focusable').focus).toHaveBeenCalled();
      });

      it('sets focus to result after skip link is clicked', () => {
        const view = getCourseListView({}, 1);
        spyOn($.fn, 'focus');
        $('.skip-link').click();
        expect(view.ui.skipTarget.focus).toHaveBeenCalled();
      });

      it('does not violate the axe-core ruleset', (done) => {
        getCourseListView();
        axe.a11yCheck($('.course-list-view-fixture')[0], (result) => {
          expect(result.violations.length).toBe(0);
          done();
        });
      });

      it('paging component is a nav tag with aria label', () => {
        const view = getCourseListView();
        const $paginator = view.$el.find('nav.backgrid-paginator');
        expect($paginator.attr('aria-label')).toEqual('Pagination');
      });
    });
  });
});
