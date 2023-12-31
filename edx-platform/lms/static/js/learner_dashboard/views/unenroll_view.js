/* globals gettext */

import Backbone from 'backbone';

class UnenrollView extends Backbone.View {
    constructor(options) {
        const defaults = {
            el: '.unenroll-modal',
        };
        // eslint-disable-next-line prefer-object-spread
        super(Object.assign({}, defaults, options));
    }

    handleTrigger(triggerElement) {
        this.$previouslyFocusedElement = triggerElement;
    }

    switchToSlideOne() {
    // Randomize survey option order
        const survey = document.querySelector('.options');
        for (let i = survey.children.length - 1; i >= 0; i -= 1) {
            survey.appendChild(survey.children[Math.trunc(Math.random() * i)]);
        }
        this.$('.inner-wrapper header').hide();
        this.$('#unenroll_form').hide();
        this.$('.slide1').removeClass('hidden');

        if (window.trapFocusForAccessibleModal) {
            window.trapFocusForAccessibleModal(
                this.$previouslyFocusedElement,
                window.focusableElementsString,
                this.closeButtonSelector,
                this.modalId,
                this.mainPageSelector,
            );
        }
    }

    switchToSlideTwo() {
        let reason = this.$(".reasons_survey input[name='reason']:checked").attr('val');
        // eslint-disable-next-line no-undef
        const courserunKey = $('#unenroll_course_id').val() + $('#unenroll_course_number').val();
        if (reason === 'Other') {
            reason = this.$('.other_text').val();
        }
        if (reason) {
            window.analytics.track('unenrollment_reason.selected', {
                category: 'user-engagement',
                label: reason,
                displayName: 'v1',
                course_id: courserunKey,
            });
        }
        this.$('.slide1').addClass('hidden');
        this.$('.survey_course_name').text(this.$('#unenroll_course_name').text());
        this.$('.slide2').removeClass('hidden');
        this.$('.reasons_survey .return_to_dashboard').attr('href', this.urls.dashboard);
        this.$('.reasons_survey .browse_courses').attr('href', this.urls.browseCourses);

        if (window.trapFocusForAccessibleModal) {
            window.trapFocusForAccessibleModal(
                this.$previouslyFocusedElement,
                window.focusableElementsString,
                this.closeButtonSelector,
                this.modalId,
                this.mainPageSelector,
            );
        }
    }

    unenrollComplete(event, xhr) {
        if (xhr.status === 200) {
            if (!this.isEdx) {
                // eslint-disable-next-line no-restricted-globals
                location.href = this.urls.dashboard;
            } else {
                this.switchToSlideOne();
                this.$('.reasons_survey:first .submit_reasons').click(this.switchToSlideTwo.bind(this));
            }
        } else if (xhr.status === 400) {
            // eslint-disable-next-line no-undef
            $('#unenroll_error').text(
                xhr.responseText,
            ).stop()
                .css('display', 'block');
        } else if (xhr.status === 403) {
            // eslint-disable-next-line no-restricted-globals
            location.href = `${this.urls.signInUser}?course_id=${
                // eslint-disable-next-line no-undef
                encodeURIComponent($('#unenroll_course_id').val())}&enrollment_action=unenroll`;
        } else {
            // eslint-disable-next-line no-undef
            $('#unenroll_error').text(
                gettext('Unable to determine whether we should give you a refund because'
                + ' of System Error. Please try again later.'),
            ).stop()
                .css('display', 'block');
        }
    }

    startSubmit() {
        this.$('.submit').prop('disabled', true);
    }

    initialize(options) {
        const view = this;
        this.urls = options.urls;
        this.isEdx = options.isEdx;

        this.closeButtonSelector = '.unenroll-modal .close-modal';
        // eslint-disable-next-line no-undef
        this.$closeButton = $(this.closeButtonSelector);
        this.modalId = `#${this.$el.attr('id')}`;
        this.mainPageSelector = '#dashboard-main';

        this.triggerSelector = '.action-unenroll';
        // eslint-disable-next-line no-undef
        $(this.triggerSelector).each((index, element) => {
            // eslint-disable-next-line no-undef
            $(element).on('click', view.handleTrigger.bind($(element)));
        });

        this.$('.submit .submit-button').on('click', this.startSubmit.bind(this));
        // eslint-disable-next-line no-undef
        $('#unenroll_form').on('ajax:complete', this.unenrollComplete.bind(this));
    }
}

export default UnenrollView;
