define((require) => {
  'use strict';

  const SpecHelpers = require('uitk/utils/spec-helpers/spec-helpers');

  const CourseModel = require('course-list/common/models/course');
  const ProgramModel = require('course-list/common/models/program');
  const CourseList = require('course-list/common/collections/course-list');
  const ProgramsCollection = require('course-list/common/collections/programs');

  describe('CourseList', () => {
    let courseList;

    beforeEach(() => {
      const programsCollection = new ProgramsCollection([
        new ProgramModel({
          program_id: '123',
          program_title: 'Alpaca Program',
          program_type: 'Camelid',
          course_ids: ['Alpaca'],
        }),
        new ProgramModel({
          program_id: '456',
          program_title: 'Zebra Program',
          program_type: 'Horse',
          course_ids: ['zebra'],
        }),
        new ProgramModel({
          program_id: '789',
          program_title: 'Courseless Program',
          program_type: 'Courseless',
          course_ids: [],
        })]);
      const courses = [
        new CourseModel({
          catalog_course_title: 'Alpaca',
          course_id: 'Alpaca',
          count: 10,
          cumulative_count: 20,
          count_change_7_days: 30,
          verified_enrollment: 40,
          availability: 'Current',
          pacing_type: 'self_paced',
        }),
        new CourseModel({
          catalog_course_title: 'zebra',
          course_id: 'zebra',
          count: 0,
          cumulative_count: 1000,
          count_change_7_days: -10,
          verified_enrollment: 1000,
          availability: 'Upcoming',
          pacing_tpye: 'instructor_paced',
        }),
      ];
      courseList = new CourseList(courses, { programsCollection });
    });

    describe('filtering', () => {
      beforeEach(() => {
        // should be unfiltered
        expect(courseList.models.length).toBe(2);
      });

      afterEach(() => {
        // unfilter
        courseList.clearAllFilters();
        expect(courseList.models.length).toBe(2);
      });

      it('by availability', () => {
        courseList.setFilterField('availability', 'Current');
        courseList.refresh();
        expect(courseList.models.length).toBe(1);
        expect(courseList.at(0).get('course_id')).toBe('Alpaca');
      });

      it('by pacing type', () => {
        courseList.setFilterField('pacing_type', 'self_paced');
        courseList.refresh();
        expect(courseList.models.length).toBe(1);
        expect(courseList.at(0).get('course_id')).toBe('Alpaca');
      });

      it('by program', () => {
        courseList.setFilterField('program_ids', '456');
        courseList.refresh();
        expect(courseList.models.length).toBe(1);
        expect(courseList.at(0).get('course_id')).toBe('zebra');
      });

      it('by program with no courses', () => {
        courseList.setFilterField('program_ids', '789');
        courseList.refresh();
        expect(courseList.models.length).toBe(0);
      });
    });

    describe('registered sort field', () => {
      SpecHelpers.withConfiguration({
        catalog_course_title: [
          'catalog_course_title', // field name
          'Course Name', // expected display name
        ],
        start_date: [
          'start_date', // field name
          'Start Date', // expected display name
        ],
        end_date: [
          'end_date', // field name
          'End Date', // expected display name
        ],
        cumulative_count: [
          'cumulative_count', // field name
          'Total Enrollment', // expected display name
        ],
        count: [
          'count', // field name
          'Current Enrollment', // expected display name
        ],
        count_change_7_days: [
          'count_change_7_days', // field name
          'Change Last Week', // expected display name
        ],
        verified_enrollment: [
          'verified_enrollment', // field name
          'Verified Enrollment', // expected display name
        ],
      }, function (sortField, expectedResults) {
        this.sortField = sortField;
        this.expectedResults = expectedResults;
      }, () => {
        it('displays name', function () {
          courseList.setSorting(this.sortField);
          expect(courseList.sortDisplayName()).toEqual(this.expectedResults);
        });
      });
    });
  });
});
