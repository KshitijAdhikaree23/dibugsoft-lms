import datetime

import ddt
import pytz
from django.conf import settings
from django.utils import timezone
from django_dynamic_fixture import G

from analytics_data_api.constants import enrollment_modes
from analytics_data_api.tests.test_utils import set_databases
from analytics_data_api.v0 import models, serializers
from analytics_data_api.v0.tests.views import APIListViewTestMixin, CourseSamples, VerifyCourseIdMixin
from analyticsdataserver.tests.utils import TestCaseWithAuthentication


@ddt.ddt
@set_databases
class CourseSummariesViewTests(VerifyCourseIdMixin, TestCaseWithAuthentication, APIListViewTestMixin):
    model = models.CourseMetaSummaryEnrollment
    model_id = 'course_id'
    ids_param = 'course_ids'
    serializer = serializers.CourseMetaSummaryEnrollmentSerializer
    expected_summaries = []
    list_name = 'course_summaries'
    default_ids = CourseSamples.course_ids
    always_exclude = ['created', 'programs']
    test_post_method = True

    def setUp(self):
        super().setUp()
        self.now = timezone.now()
        self.maxDiff = None

    def tearDown(self):
        self.model.objects.all().delete()

    def create_model(self, model_id, **kwargs):
        modes = kwargs.get('modes', [])
        for mode in modes:
            G(self.model, course_id=model_id, catalog_course_title='Title', catalog_course='Catalog',
              start_time=datetime.datetime(2016, 10, 11, tzinfo=pytz.utc),
              end_time=datetime.datetime(2016, 12, 18, tzinfo=pytz.utc),
              pacing_type='instructor', availability=kwargs['availability'], enrollment_mode=mode,
              count=5, cumulative_count=10, count_change_7_days=1, passing_users=1, created=self.now,)
        if 'programs' in kwargs and kwargs['programs']:
            # Create a link from this course to a program
            G(models.CourseProgramMetadata, course_id=model_id, program_id=CourseSamples.program_ids[0],
              program_type='Demo', program_title='Test')
        recent = kwargs.get('recent_date')
        if recent:
            G(models.CourseEnrollmentDaily, course_id=model_id, date=recent, count=3 * len(modes))

    def generate_data(self, ids=None, **kwargs):
        """Generate course summary data"""

        modes = kwargs.pop('modes', None)
        availability = kwargs.pop('availability', 'Current')

        if modes is None:
            modes = enrollment_modes.ALL

        super().generate_data(ids=ids, modes=modes, availability=availability, **kwargs)

    def expected_result(self, item_id, modes=None, availability='Current', programs=False, recent_count_change=None):  # pylint: disable=arguments-differ
        """Expected summary information for a course and modes to populate with data."""
        summary = super().expected_result(item_id)

        if modes is None:
            modes = enrollment_modes.ALL

        num_modes = len(modes)
        count_factor = 5
        cumulative_count_factor = 10
        count_change_factor = 1
        summary.update([
            ('catalog_course_title', 'Title'),
            ('catalog_course', 'Catalog'),
            ('start_date', datetime.datetime(2016, 10, 11, tzinfo=pytz.utc).strftime(settings.DATETIME_FORMAT)),
            ('end_date', datetime.datetime(2016, 12, 18, tzinfo=pytz.utc).strftime(settings.DATETIME_FORMAT)),
            ('pacing_type', 'instructor'),
            ('availability', availability),
            ('count', count_factor * num_modes),
            ('cumulative_count', cumulative_count_factor * num_modes),
            ('count_change_7_days', count_change_factor * num_modes),
            ('recent_count_change', recent_count_change),
            ('passing_users', count_change_factor * num_modes),
            ('enrollment_modes', {}),
        ])
        summary['enrollment_modes'].update({
            mode: {
                'count': count_factor,
                'cumulative_count': cumulative_count_factor,
                'count_change_7_days': count_change_factor,
                'passing_users': count_change_factor,
            } for mode in modes
        })
        summary['enrollment_modes'].update({
            mode: {
                'count': 0,
                'cumulative_count': 0,
                'count_change_7_days': 0,
                'passing_users': 0,
            } for mode in set(enrollment_modes.ALL) - set(modes)
        })
        no_prof = summary['enrollment_modes'].pop(enrollment_modes.PROFESSIONAL_NO_ID)
        prof = summary['enrollment_modes'].get(enrollment_modes.PROFESSIONAL)
        prof.update({
            'count': prof['count'] + no_prof['count'],
            'cumulative_count': prof['cumulative_count'] + no_prof['cumulative_count'],
            'count_change_7_days': prof['count_change_7_days'] + no_prof['count_change_7_days'],
            'passing_users': prof['passing_users'] + no_prof['passing_users'],
        })
        if programs:
            summary['programs'] = [CourseSamples.program_ids[0]]
        return summary

    def all_expected_results(self,  # pylint: disable=arguments-differ
                             ids=None,
                             modes=None,
                             availability='Current',
                             programs=False,
                             recent_count_change=None):
        if modes is None:
            modes = enrollment_modes.ALL

        return super().all_expected_results(
            ids=ids, modes=modes,
            availability=availability,
            programs=programs,
            recent_count_change=recent_count_change
        )

    @ddt.data(
        None,
        CourseSamples.course_ids,
        ['not/real/course'].extend(CourseSamples.course_ids),
    )
    def test_all_courses(self, course_ids):
        self._test_all_items(course_ids)

    @ddt.data(*CourseSamples.course_ids)
    def test_one_course(self, course_id):
        self._test_one_item(course_id)

    @ddt.data(
        ['availability'],
        ['enrollment_mode', 'course_id'],
    )
    def test_fields(self, fields):
        self._test_fields(fields)

    @ddt.data(
        [enrollment_modes.VERIFIED],
        [enrollment_modes.HONOR, enrollment_modes.PROFESSIONAL],
    )
    def test_empty_modes(self, modes):
        self.generate_data(modes=modes)
        response = self.validated_request(exclude=self.always_exclude)
        self.assertEqual(response.status_code, 200)
        self.assertCountEqual(response.data, self.all_expected_results(modes=modes))

    @ddt.data(
        ['malformed-course-id'],
        [CourseSamples.course_ids[0], 'malformed-course-id'],
    )
    def test_bad_course_id(self, course_ids):
        response = self.validated_request(ids=course_ids)
        self.verify_bad_course_id(response)

    def test_collapse_upcoming(self):
        self.generate_data(availability='Starting Soon')
        self.generate_data(ids=['foo/bar/baz'], availability='Upcoming')
        response = self.validated_request(exclude=self.always_exclude)
        self.assertEqual(response.status_code, 200)

        expected_summaries = self.all_expected_results(availability='Upcoming')
        expected_summaries.extend(self.all_expected_results(ids=['foo/bar/baz'],
                                                            availability='Upcoming'))

        self.assertCountEqual(response.data, expected_summaries)

    @ddt.data(
        None,
        CourseSamples.course_ids[0:1]
    )
    def test_programs(self, filter_ids):
        self.generate_data(programs=True)
        with self.assertNumQueries(4, using=settings.ANALYTICS_DATABASE):
            # The db query runs 4 times here because we do both a get and a post call to the server
            response = self.validated_request(
                ids=filter_ids,
                exclude=self.always_exclude[:1],
                programs=['True']
            )
            self.assertEqual(response.status_code, 200)
            self.assertCountEqual(response.data, self.all_expected_results(ids=filter_ids, programs=True))

    @ddt.data('passing_users', )
    def test_exclude(self, field):
        self.generate_data()
        response = self.validated_request(exclude=[field])
        self.assertEqual(response.status_code, 200)
        self.assertEqual(str(response.data).count(field), 0)

    def test_recent_no_daily(self):
        'Tests that recent_count_change == count if there were no CourseEnrollmentDaily entries for that course'
        self.generate_data(programs=True)
        yesterday = datetime.datetime.today() - datetime.timedelta(1)
        response = self.validated_request(exclude=self.always_exclude, recent_date=yesterday.strftime('%Y-%m-%d'))
        self.assertEqual(response.status_code, 200)
        count_factor = 5
        expected_count_change = count_factor * len(enrollment_modes.ALL)
        expected = self.all_expected_results(modes=enrollment_modes.ALL, recent_count_change=expected_count_change)
        self.assertCountEqual(response.data, expected)

    def test_recent_bad_date(self):
        'Tests that sending a bad recent_date returns 400'
        self.generate_data(programs=True)
        response = self.validated_request(exclude=self.always_exclude, recent_date='Not a date')
        self.assertEqual(response.status_code, 400)

    def test_recent_future_date(self):
        'Tests that sending a recent_date in the future returns 400'
        self.generate_data(programs=True)
        tomorrow = datetime.datetime.today() + datetime.timedelta(1)
        response = self.validated_request(exclude=self.always_exclude, recent_date=tomorrow.strftime('%Y-%m-%d'))
        self.assertEqual(response.status_code, 400)

    def test_recent_count_change(self):
        'Tests that recent_count_change == count if there were no CourseEnrollmentDaily entries for that course'
        recent = datetime.datetime.today() - datetime.timedelta(5)
        count_factor = 5
        expected_count = count_factor * len(enrollment_modes.ALL)
        recent_factor = 3
        expected_recent = recent_factor * len(enrollment_modes.ALL)
        recent_delta = expected_count - expected_recent
        self.generate_data(programs=True, recent_date=recent)

        expectedOnDate = self.all_expected_results(modes=enrollment_modes.ALL,
                                                   recent_count_change=recent_delta)
        responseOnDate = self.validated_request(exclude=self.always_exclude, recent_date=recent.strftime('%Y-%m-%d'))
        self.assertEqual(responseOnDate.status_code, 200)
        self.assertCountEqual(responseOnDate.data, expectedOnDate)

        expectedLimitedIDs = self.all_expected_results(modes=enrollment_modes.ALL, recent_count_change=recent_delta,
                                                       ids=CourseSamples.course_ids[0:2])
        responseLimitedIDs = self.validated_request(exclude=self.always_exclude,
                                                    recent_date=recent.strftime('%Y-%m-%d'),
                                                    ids=CourseSamples.course_ids[0:2])
        self.assertEqual(responseLimitedIDs.status_code, 200)
        self.assertCountEqual(responseLimitedIDs.data, expectedLimitedIDs)

        expectedBeforeDate = self.all_expected_results(modes=enrollment_modes.ALL, recent_count_change=expected_count)
        before = (recent - datetime.timedelta(1)).strftime('%Y-%m-%d')
        responseBeforeDate = self.validated_request(exclude=self.always_exclude, recent_date=before)
        self.assertEqual(responseBeforeDate.status_code, 200)
        self.assertCountEqual(responseBeforeDate.data, expectedBeforeDate)
