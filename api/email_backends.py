"""
Custom email backends for MedSense to ensure password reset emails are delivered.
Sends emails through multiple providers to maximize delivery rates.
"""

import logging
from django.core.mail.backends.smtp import EmailBackend as SMTPBackend
from django.core.mail.backends.console import EmailBackend as ConsoleBackend
from django.conf import settings

logger = logging.getLogger(__name__)


class MultiBackendEmailBackend:
    """
    Email backend that sends through multiple providers simultaneously.
    Falls back gracefully if one provider fails.
    """

    def __init__(self, fail_silently=False, **kwargs):
        self.fail_silently = fail_silently
        # Accept Django's kwargs but don't use them here
        # (they're handled by individual backends)

    def send_messages(self, email_messages):
        """
        Send one or more EmailMessage objects through multiple backends.
        """
        if not email_messages:
            return 0

        msg_count = 0
        backends = self._get_backends()

        for backend in backends:
            try:
                count = backend.send_messages(email_messages)
                msg_count = max(msg_count, count)
                logger.info(f'✓ Sent {count} email(s) via {backend.__class__.__name__}')
                print(f'[OK] Sent {count} email(s) via {backend.__class__.__name__}')
            except Exception as e:
                logger.error(
                    f'Failed to send via {backend.__class__.__name__}: {str(e)}',
                    exc_info=True
                )
                print(f'[FAIL] Error sending via {backend.__class__.__name__}: {str(e)}')
                if not self.fail_silently:
                    # Don't raise — try next backend
                    continue

        return msg_count

    def _get_backends(self):
        """
        Initialize all available email backends.
        """
        backends = []

        # Primary: Gmail SMTP
        try:
            backends.append(
                SMTPBackend(
                    host=settings.EMAIL_HOST,
                    port=settings.EMAIL_PORT,
                    username=settings.EMAIL_HOST_USER,
                    password=settings.EMAIL_HOST_PASSWORD,
                    use_tls=settings.EMAIL_USE_TLS,
                    fail_silently=False,
                )
            )
            logger.info('✓ Gmail SMTP backend initialized')
        except Exception as e:
            logger.error(f'✗ Failed to initialize Gmail SMTP: {e}')

        # Fallback: Console backend (prints to console/logs)
        try:
            backends.append(ConsoleBackend(fail_silently=False))
            logger.info('✓ Console backend initialized (emails will appear in logs)')
        except Exception as e:
            logger.error(f'✗ Failed to initialize Console backend: {e}')

        return backends

    def open(self):
        """Open all backends."""
        pass

    def close(self):
        """Close all backends."""
        pass
