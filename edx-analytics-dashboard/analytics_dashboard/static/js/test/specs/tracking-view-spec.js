define(
  ['jquery', 'models/course-model', 'models/tracking-model', 'models/user-model', 'views/tracking-view'],
  ($, CourseModel, TrackingModel, UserModel, TrackingView) => {
    'use strict';

    describe('Tracking View', () => {
      const USER_DETAILS = {
        userTrackingID: 12345,
        name: 'Ed Xavier',
        username: 'edxavier',
        email: 'edx@example.com',
        ignoreInReporting: true,
      };

      it('should call segment with application key', () => {
        const view = new TrackingView({
          model: new TrackingModel(),
        });
        view.applicationIdSet();

        // mock segment
        view.segment = {
          load: jasmine.createSpy('load'),
        };
        view.initSegment('myKey');

        expect(view.segment.load).toHaveBeenCalledWith('myKey');
      });

      it('should call segment with user information', () => {
        const view = new TrackingView({
          model: new TrackingModel(),
          userModel: new UserModel(USER_DETAILS),
        });
        view.applicationIdSet();

        // mock segment
        view.segment = {
          identify: jasmine.createSpy('identify'),
        };

        view.logUser();

        expect(view.segment.identify).toHaveBeenCalledWith(USER_DETAILS.userTrackingID, {
          name: USER_DETAILS.name,
          username: USER_DETAILS.username,
          email: USER_DETAILS.email,
          ignoreInReporting: true,
        });
      });

      it('should call applicationIdSet() when segmentApplicationId is set', () => {
        const courseModel = new CourseModel();
        const trackingModel = new TrackingModel();
        const userModel = new TrackingModel();

        const view = new TrackingView({
          model: trackingModel,
          courseModel,
          userModel,
        });
        view.applicationIdSet();

        // mock segment
        view.segment = {
          load: jasmine.createSpy('load'),
          page: jasmine.createSpy('page'),
          identify: jasmine.createSpy('identify'),
        };

        // segment view should call segment methods when data is set
        courseModel.set({
          courseId: 'this/is/a/course',
          org: 'org',
        });
        trackingModel.set({
          segmentApplicationId: 'applicationId',
          page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
        });
        userModel.set(USER_DETAILS);

        // check to see if the methods were called
        expect(view.segment.identify).toHaveBeenCalled();
        expect(view.segment.page).toHaveBeenCalledWith({
          courseId: 'this/is/a/course',
          org: 'org',
          label: 'course_mylens_myreport',
          current_page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
        });
        expect(view.segment.load).toHaveBeenCalled();
      });

      it('should only attach listeners if application ID set', () => {
        const courseModel = new CourseModel();
        const trackingModel = new TrackingModel();
        const userModel = new TrackingModel();

        const view = new TrackingView({
          model: trackingModel,
          courseModel,
          userModel,
        });
        view.applicationIdSet();

        // mock segment
        view.segment = {
          track: jasmine.createSpy('track'),
          load: jasmine.createSpy('load'),
          page: jasmine.createSpy('page'),
          identify: jasmine.createSpy('identify'),
        };

        trackingModel.set('segmentApplicationId', null);

        // check to make sure nothing on segment was called
        expect(view.segment.identify).not.toHaveBeenCalled();
        expect(view.segment.page).not.toHaveBeenCalled();
        expect(view.segment.load).not.toHaveBeenCalled();
        expect(view.segment.track).not.toHaveBeenCalled();
      });

      it('should call segment::track() when segment events are triggers', () => {
        const courseModel = new CourseModel({
          courseId: 'my/course/id',
          org: 'org',
        });
        const trackingModel = new TrackingModel({
          page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
        });
        const userModel = new TrackingModel();

        const view = new TrackingView({
          model: trackingModel,
          courseModel,
          userModel,
        });
        view.applicationIdSet();

        // mock segment
        view.segment = {
          track: jasmine.createSpy('track'),
          load: jasmine.createSpy('load'),
          page: jasmine.createSpy('page'),
          identify: jasmine.createSpy('identify'),
        };

        // trigger a segment event
        trackingModel.trigger('segment:track', 'trackingEvent', { param: 'my-param' });

        // we don't track events until segment has been loaded
        expect(view.segment.track).not.toHaveBeenCalled();

        trackingModel.set('segmentApplicationId', 'some ID');

        // trigger an event and make sure that track is called
        trackingModel.trigger('segment:track', 'trackingEvent', { param: 'my-param' });
        expect(view.segment.track).toHaveBeenCalledWith('trackingEvent', {
          label: 'course_mylens_myreport',
          courseId: 'my/course/id',
          org: 'org',
          param: 'my-param',
          current_page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
        });
      });

      it('should call segment::page()', () => {
        const courseModel = new CourseModel({
          courseId: 'my/course/id',
          org: 'org',
        });
        const trackingModel = new TrackingModel({
          page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
        });
        const userModel = new TrackingModel();

        const view = new TrackingView({
          model: trackingModel,
          courseModel,
          userModel,
        });
        view.applicationIdSet();

        // mock segment
        view.segment = {
          track: jasmine.createSpy('track'),
          load: jasmine.createSpy('load'),
          page: jasmine.createSpy('page'),
          identify: jasmine.createSpy('identify'),
        };

        // trigger a segment event
        trackingModel.trigger('segment:page', 'pageName', { param: 'my-param' });

        // we don't track events until segment has been loaded
        expect(view.segment.page).not.toHaveBeenCalled();

        trackingModel.set('segmentApplicationId', 'some ID');

        // trigger an event and make sure that page is called
        trackingModel.trigger('segment:page', 'pageName', { param: 'my-param' });
        expect(view.segment.page).toHaveBeenCalledWith('pageName', {
          label: 'course_mylens_myreport',
          courseId: 'my/course/id',
          org: 'org',
          param: 'my-param',
          current_page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
        });
      });
    });

    describe('Tracking element events', () => {
      beforeEach(() => {
        $('<div id="sandbox"></div>').appendTo('body');
      });

      afterEach(() => {
        $('#sandbox').remove();
      });

      function setupTest() {
        const courseModel = new CourseModel({
          courseId: 'my/course/id',
          org: 'org',
        });
        const trackingModel = new TrackingModel({
          page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
          segmentApplicationId: 'some ID',
        });
        const userModel = new TrackingModel();
        const $sandbox = $('#sandbox');

        const view = new TrackingView({
          el: document,
          model: trackingModel,
          courseModel,
          userModel,
        });
        view.applicationIdSet();

        // mock segment
        view.segment = {
          track: jasmine.createSpy('track'),
          load: jasmine.createSpy('load'),
          page: jasmine.createSpy('page'),
          identify: jasmine.createSpy('identify'),
        };

        $sandbox.attr('data-track-event', 'trackingEvent');
        $sandbox.attr('data-track-param', 'my-param');
        $sandbox.attr('data-track-foo', 'bar');

        return {
          trackingModel,
          view,
          sandbox: $sandbox,
          showTooltip() {
            $sandbox.trigger('shown.bs.tooltip');
          },
          triggerClick() {
            $sandbox.trigger('clicked.tracking');
          },
          expectNoEventToHaveBeenEmitted() {
            expect(view.segment.track).not.toHaveBeenCalled();
          },
          expectEventEmitted(eventType, properties) {
            expect(view.segment.track).toHaveBeenCalledWith(eventType, properties);
          },
          expectedProperties: {
            label: 'course_mylens_myreport',
            courseId: 'my/course/id',
            org: 'org',
            param: 'my-param',
            foo: 'bar',
            current_page: {
              scope: 'course',
              lens: 'mylens',
              report: 'myreport',
              depth: '',
              name: 'course_mylens_myreport',
            },
          },
        };
      }

      it('should emit an event when tooltips are shown', () => {
        const test = setupTest();

        test.showTooltip();

        test.expectEventEmitted('trackingEvent', test.expectedProperties);
      });

      it('should emit an event when tracked element is clicked', () => {
        const test = setupTest();

        test.triggerClick();

        test.expectEventEmitted('trackingEvent', test.expectedProperties);
      });

      it('should not emit an event when tracking is not enabled', () => {
        const test = setupTest();

        test.trackingModel.unset('segmentApplicationId');

        test.showTooltip();
        test.expectNoEventToHaveBeenEmitted();

        test.triggerClick();
        test.expectNoEventToHaveBeenEmitted();
      });

      it('should not emit an event when event type is empty', () => {
        const test = setupTest();

        test.sandbox.attr('data-track-event', '');
        test.showTooltip();
        test.expectNoEventToHaveBeenEmitted();

        test.triggerClick();
        test.expectNoEventToHaveBeenEmitted();
      });

      it('should not emit an event when event type is undefined', () => {
        const test = setupTest();

        test.sandbox.removeAttr('data-track-event');
        test.showTooltip();
        test.expectNoEventToHaveBeenEmitted();

        test.triggerClick();
        test.expectNoEventToHaveBeenEmitted();
      });

      it('should transform target HTML data attributes', () => {
        const test = setupTest();

        test.sandbox.attr('data-track-target-scope', 'course');
        test.sandbox.attr('data-track-target-lens', 'mylens');
        test.sandbox.attr('data-track-target-report', 'myreport');
        test.sandbox.attr('data-track-target-depth', 'mydepth');
        test.showTooltip();

        test.expectEventEmitted('trackingEvent', {
          label: 'course_mylens_myreport',
          courseId: 'my/course/id',
          org: 'org',
          param: 'my-param',
          foo: 'bar',
          current_page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
          target_page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: 'mydepth',
            name: 'course_mylens_myreport_mydepth',
          },
        });
      });

      it('should transform target HTML data attributes (with name parts missing)', () => {
        const test = setupTest();

        test.sandbox.attr('data-track-target-scope', 'course');
        test.sandbox.attr('data-track-target-lens', 'mylens');
        test.showTooltip();

        test.expectEventEmitted('trackingEvent', {
          label: 'course_mylens_myreport',
          courseId: 'my/course/id',
          org: 'org',
          param: 'my-param',
          foo: 'bar',
          current_page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
          target_page: {
            scope: 'course',
            lens: 'mylens',
            report: '',
            depth: '',
            name: 'course_mylens',
          },
        });
      });

      it('should transform link-name and menu-depth HTML data attributes', () => {
        const test = setupTest();

        test.sandbox.attr('data-track-menu-depth', 'lens');
        test.sandbox.attr('data-track-link-name', 'mylens');
        test.showTooltip();

        test.expectEventEmitted('trackingEvent', {
          label: 'course_mylens_myreport',
          courseId: 'my/course/id',
          org: 'org',
          param: 'my-param',
          foo: 'bar',
          current_page: {
            scope: 'course',
            lens: 'mylens',
            report: 'myreport',
            depth: '',
            name: 'course_mylens_myreport',
          },
          menu_depth: 'lens',
          link_name: 'mylens',
          category: 'lens+mylens',
        });
      });
    });
  },
);
