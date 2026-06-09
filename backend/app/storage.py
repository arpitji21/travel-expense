"""Receipt/bill storage.

Salespeople upload bills that the finance department needs to view later. On
ephemeral hosting (e.g. Render's free tier) the local filesystem is wiped on
every redeploy/restart, so locally-stored bills disappear and finance can't see
them. To make uploads durable and shareable, this module stores bills in
**Cloudflare R2** (S3-compatible object storage) when it's configured, and falls
back to the local disk for local development.

R2 is configured through these settings (see ``Config``):
    R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET and
    R2_PUBLIC_BASE_URL (the bucket's public r2.dev URL or a custom domain).

When all of those are present, ``save_receipt`` uploads the file to R2 and
returns a full public URL that the frontend renders directly. Otherwise it
writes to ``UPLOAD_FOLDER`` and returns the existing ``/uploads/receipts/...``
path.
"""

import os
from uuid import uuid4

from flask import current_app
from werkzeug.utils import secure_filename


def r2_enabled():
    """True when every required Cloudflare R2 setting is configured."""
    cfg = current_app.config
    return all(
        cfg.get(key)
        for key in (
            "R2_ACCOUNT_ID",
            "R2_ACCESS_KEY_ID",
            "R2_SECRET_ACCESS_KEY",
            "R2_BUCKET",
            "R2_PUBLIC_BASE_URL",
        )
    )


def _r2_client():
    # Imported lazily so the dependency is only needed when R2 is actually used.
    import boto3
    from botocore.client import Config as BotoConfig

    cfg = current_app.config

    endpoint = f"https://{cfg['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com"
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=cfg["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=cfg["R2_SECRET_ACCESS_KEY"],
        config=BotoConfig(signature_version="s3v4"),
        region_name="auto",
    )


def _new_object_name(original_filename):
    """A safe, unguessable object name that preserves the file extension."""
    safe = secure_filename(original_filename)
    extension = safe.rsplit(".", 1)[1].lower() if "." in safe else "bin"
    return f"{uuid4().hex}.{extension}"


def save_upload(file_storage, folder):
    """Persist an uploaded file under ``folder`` and return a URL to open it.

    Stores in Cloudflare R2 (under ``<folder>/...``) when configured, otherwise
    on local disk at ``uploads/<folder>/`` served by the Flask ``/uploads/...``
    route. ``file_storage`` is a Werkzeug ``FileStorage`` (``request.files[...]``).
    """
    object_name = _new_object_name(file_storage.filename)

    if r2_enabled():
        cfg = current_app.config
        try:
            client = _r2_client()
            key = f"{folder}/{object_name}"
            client.upload_fileobj(
                file_storage,
                cfg["R2_BUCKET"],
                key,
                ExtraArgs={
                    "ContentType": file_storage.mimetype
                    or "application/octet-stream",
                },
            )
            base = cfg["R2_PUBLIC_BASE_URL"].rstrip("/")
            return f"{base}/{key}"
        except Exception as exc:
            print(f"[storage] R2 upload FAILED: {exc}", flush=True)
            # Fall back to local storage if R2 fails
            print("[storage] Falling back to local storage.", flush=True)

    # Local fallback: write under uploads/<folder>/ and serve via Flask.
    try:
        uploads_root = os.path.dirname(current_app.config["UPLOAD_FOLDER"])
        local_dir = os.path.join(uploads_root, folder)
        os.makedirs(local_dir, exist_ok=True)
        file_storage.save(os.path.join(local_dir, object_name))
        return f"/uploads/{folder}/{object_name}"
    except Exception as exc:
        print(f"[storage] Local save FAILED: {exc}", flush=True)
        raise


def save_receipt(file_storage):
    """Persist an uploaded bill (see :func:`save_upload`)."""
    return save_upload(file_storage, "receipts")
