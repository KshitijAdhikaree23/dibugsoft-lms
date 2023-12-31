"""
URLs for the Agreements API
"""

from django.conf import settings
from django.urls import re_path

from .views import IntegritySignatureView, LTIPIISignatureView

urlpatterns = [
    re_path(r'^integrity_signature/{course_id}$'.format(
        course_id=settings.COURSE_ID_PATTERN
    ), IntegritySignatureView.as_view(), name='integrity_signature'),
    re_path(r'^lti_pii_signature/{course_id}$'.format(
        course_id=settings.COURSE_ID_PATTERN
    ), LTIPIISignatureView.as_view(), name='lti_pii_signature'),
]
