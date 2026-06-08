"""Outbound email notifications via Gmail SMTP.

Used to tell a salesperson when the finance department approves or reimburses
their expense. Sending is fire-and-forget (runs on a background thread) and
fully fail-safe: if SMTP isn't configured, or the send errors, the calling
request is never affected — the status change has already been committed.

Configure with MAIL_USERNAME + MAIL_PASSWORD (a Gmail address and an
App Password). See ``Config`` and ``.env.example``.
"""

import smtplib
import ssl
from email.message import EmailMessage
from threading import Thread

from flask import current_app


def mail_enabled():
    cfg = current_app.config
    return bool(cfg.get("MAIL_USERNAME") and cfg.get("MAIL_PASSWORD"))


def _deliver(host, port, username, password, sender, to, subject, body):
    recipients = [to] if isinstance(to, str) else list(to)

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg.set_content(body)

    try:
        with smtplib.SMTP(host, port, timeout=20) as server:
            server.starttls(context=ssl.create_default_context())
            server.login(username, password)
            server.send_message(msg)
        print(f"[email] sent to {to}: {subject}", flush=True)
    except Exception as exc:  # never let an email failure surface to the user
        print(f"[email] FAILED to send to {to}: {exc}", flush=True)


def send_email(to, subject, body):
    """Queue an email to ``to``. No-op (logged) when SMTP isn't configured."""
    if not to:
        return

    cfg = current_app.config
    if not mail_enabled():
        print(
            f"[email] (disabled - set MAIL_USERNAME/MAIL_PASSWORD) would send to {to}: {subject}",
            flush=True,
        )
        return

    args = (
        cfg["MAIL_SMTP_HOST"],
        cfg["MAIL_SMTP_PORT"],
        cfg["MAIL_USERNAME"],
        cfg["MAIL_PASSWORD"],
        cfg.get("MAIL_FROM") or cfg["MAIL_USERNAME"],
        to,
        subject,
        body,
    )
    # Background thread so the HTTP response isn't blocked on SMTP latency.
    Thread(target=_deliver, args=args, daemon=True).start()
