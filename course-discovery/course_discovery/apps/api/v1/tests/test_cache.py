import zlib

import ddt
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework import permissions, views
from rest_framework.renderers import BrowsableAPIRenderer, JSONRenderer
from rest_framework.response import Response
from rest_framework_extensions.test import APIRequestFactory
from waffle.testutils import override_flag

from course_discovery.apps.api.cache import compressed_cache_response

factory = APIRequestFactory()


@override_settings(USE_API_CACHING=True)
@ddt.ddt
class CompressedCacheResponseTest(TestCase):
    def setUp(self):
        super().setUp()
        self.request = factory.get('')
        self.cache_response_key = 'cache_response_key'

    def test_should_handle_getting_uncompressed_response_from_cache(self):
        """ Verify that the decorator correctly returns uncompressed responses """
        def key_func(**kwargs):
            return self.cache_response_key

        class TestView(views.APIView):
            permission_classes = [permissions.AllowAny]
            renderer_classes = [JSONRenderer]

            @compressed_cache_response(key_func=key_func)
            def get(self, request, *_args, **_kwargs):
                return Response('test response')

        view_instance = TestView()
        view_instance.headers = {}  # pylint: disable=attribute-defined-outside-init
        uncompressed_cached_response = Response('cached test response')
        view_instance.finalize_response(request=self.request, response=uncompressed_cached_response)
        uncompressed_cached_response.render()

        response_triple = (
            uncompressed_cached_response.rendered_content,
            uncompressed_cached_response.status_code,
            self.get_header(uncompressed_cached_response)
        )
        cache.set(self.cache_response_key, response_triple)

        response = view_instance.dispatch(request=self.request)
        assert response.content.decode('utf-8') == '"cached test response"'

    def test_should_handle_getting_compressed_response_from_cache(self):
        """ Verify that the decorator correctly returns compressed responses """
        def key_func(**kwargs):
            return self.cache_response_key

        class TestView(views.APIView):
            permission_classes = [permissions.AllowAny]
            renderer_classes = [JSONRenderer]

            @compressed_cache_response(key_func=key_func)
            def get(self, request, *_args, **_kwargs):
                return Response('test response')

        view_instance = TestView()
        view_instance.headers = {}  # pylint: disable=attribute-defined-outside-init
        compressed_cached_response = Response('compressed cached test response')
        view_instance.finalize_response(request=self.request, response=compressed_cached_response)
        compressed_cached_response.render()

        # Rendered content is compressed before response goes into the cache
        response_triple = (
            zlib.compress(compressed_cached_response.rendered_content),
            compressed_cached_response.status_code,
            self.get_header(compressed_cached_response)
        )
        cache.set(self.cache_response_key, response_triple)

        response = view_instance.dispatch(request=self.request)
        assert response.content.decode('utf-8') == '"compressed cached test response"'

    def test_should_not_cache_for_non_json_responses(self):
        """ Verify that the decorator does not cache if the response is not json """
        def key_func(**kwargs):
            return 'non_json_cache_key'

        class TestView(views.APIView):
            permission_classes = [permissions.AllowAny]
            renderer_classes = [BrowsableAPIRenderer]  # Non-json responses

            @compressed_cache_response(key_func=key_func)
            def get(self, request, *_args, **_kwargs):
                return Response('test response')

        view_instance = TestView()
        view_instance.headers = {}  # pylint: disable=attribute-defined-outside-init
        view_instance.dispatch(request=self.request)

        # Verify nothing was cached
        assert cache.get('non_json_cache_key') is None

    @ddt.data(True, False)
    def test_should_not_cache_if_waffled(self, waffle_active):
        """ Verify that the decorator does not cache the waffle flag is turned off """
        def key_func(**kwargs):
            return self.cache_response_key

        class TestView(views.APIView):
            permission_classes = [permissions.AllowAny]
            renderer_classes = [JSONRenderer]

            @compressed_cache_response(key_func=key_func)
            def get(self, request, *_args, **_kwargs):
                return Response('test response')

        with override_flag('compressed_cache.TestView.get', active=waffle_active):

            view_instance = TestView()
            view_instance.headers = {}  # pylint: disable=attribute-defined-outside-init
            view_instance.dispatch(request=self.request)

        # Verify nothing was cached
        if waffle_active:
            assert cache.get(self.cache_response_key) is not None
        else:
            assert cache.get(self.cache_response_key) is None

    def get_header(self, cache_response):
        """
        django 3.0 has not .items() method, django 3.2 has not ._headers
        """
        if hasattr(cache_response, '_headers'):
            headers = cache_response._headers.copy()  # pylint: disable=protected-access
        else:
            headers = {k: (k, v) for k, v in cache_response.items()}

        return headers

    def test_should_return_response_without_tuple_headers(self):
        """ In django32 headers appeared as simple string."""
        def key_func(**kwargs):
            return self.cache_response_key

        class TestView(views.APIView):
            permission_classes = [permissions.AllowAny]
            renderer_classes = [JSONRenderer]

            @compressed_cache_response(key_func=key_func)
            def get(self, request, *_args, **_kwargs):
                return Response('test response')

        view_instance = TestView()
        view_instance.headers = {'Test': 'foo'}  # pylint: disable=attribute-defined-outside-init
        cached_response = Response('')
        view_instance.finalize_response(request=self.request, response=cached_response)

        cached_response.render()

        headers = {k: (k, v) for k, v in cached_response.items()}

        response_dict = (
            cached_response.rendered_content,
            cached_response.status_code,
            headers
        )

        cache.set('cache_response_key', response_dict)
        response = view_instance.dispatch(request=self.request)
        self.assertEqual(response['test'], 'foo')
