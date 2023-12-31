""" Management command to add user emails data on Braze. """
import logging
import time

from braze.client import BrazeClient
from braze.exceptions import BrazeClientError
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from common.djangoapps.util.query import use_read_replica_if_available

User = get_user_model()

MARKETING_EMAIL_ATTRIBUTE_NAME = 'is_marketable'
TRACK_USER_COMPONENT_CHUNK_SIZE = 75

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Command to add user email address on Braze against a user_id.
    Example usage:
        $ ./manage.py lms populate_user_emails_on_braze
    """
    help = """
        Updates user accounts with email addresses on braze.
        """

    def add_arguments(self, parser):
        """
        Function to get command arguments
        """
        parser.add_argument(
            '--batch-delay',
            type=float,
            dest='batch_delay',
            default=0.5,
            help='Time delay in seconds between each iteration'
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            dest='batch_size',
            default=10000,
            help='Batch size'
        )
        parser.add_argument(
            '--starting-user-id',
            type=int,
            dest='starting_user_id',
            default=0,
            help='Starting user id to process a specific batch of users. '
                 'Both start and end id should be provided.',
        )
        parser.add_argument(
            '--ending-user-id',
            type=int,
            dest='ending_user_id',
            default=0,
            help='Ending user id (inclusive) to process a specific batch of users. '
                 'Both start and end id should be provided.',
        )

    def __init__(self):
        super().__init__()
        self.braze_client = BrazeClient(
            api_key=settings.EDX_BRAZE_API_KEY,
            api_url=settings.EDX_BRAZE_API_SERVER,
            app_id='',
        )

    @staticmethod
    def _chunks(users, chunk_size=TRACK_USER_COMPONENT_CHUNK_SIZE):
        """
        Yields successive chunks of users. The size of each chunk is determined by
        TRACK_USER_COMPONENT_CHUNK_SIZE which is set to 75.
        Reference: https://www.braze.com/docs/api/endpoints/user_data/post_user_track/
        """
        for index in range(0, len(users), chunk_size):
            yield users[index:index + chunk_size]

    def _get_user_batch(self, batch_start_id, batch_end_id):
        """
        This returns the batch of users.
        """
        query = User.objects.filter(
            id__gte=batch_start_id, id__lt=batch_end_id,
        ).select_related('profile').values_list(
            'id', 'email', named=True,
        ).order_by('id')

        return use_read_replica_if_available(query)

    def _update_braze_attributes(self, users):
        """
        Sends Braze API request to update user account.
        Fields sent using the API include:
            - external_id (user_id)
            - email
        """
        attributes = []
        for user in users:
            attributes.append(
                {
                    "external_id": user.id,
                    "email": user.email,
                }
            )

        try:
            self.braze_client.track_user(attributes=attributes)
        except BrazeClientError as error:
            logger.error(f'Failed to update attributes. Error: {error}')

    def handle(self, *args, **options):
        """
        Handler to run the command.
        """
        sleep_time = options['batch_delay']
        batch_size = options['batch_size']
        starting_user_id = options['starting_user_id']
        ending_user_id = options['ending_user_id']

        all_users_query = use_read_replica_if_available(User.objects)
        total_users_count = ending_user_id if ending_user_id else all_users_query.count()

        for index in range(starting_user_id, total_users_count + 1, batch_size):
            users = self._get_user_batch(index, index + batch_size)
            logger.info(f'Processing users with user ids in {index} - {(index + batch_size) - 1} range')

            # Force evaluating the query to avoid multiple hits to db
            # when we evaluate the chunks.
            evaluated_users = list(users)
            for user_chunk in self._chunks(evaluated_users):
                self._update_braze_attributes(user_chunk)

            time.sleep(sleep_time)
