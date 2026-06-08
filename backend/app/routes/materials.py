from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.models import Material
from app.routes.helpers import (
    require_current_user,
    require_finance_user,
    validation_error,
)
from app.storage import save_upload

materials_bp = Blueprint("materials", __name__)


def allowed_material_file(filename):
    if "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()
    return extension in current_app.config["ALLOWED_MATERIAL_EXTENSIONS"]


@materials_bp.get("")
@jwt_required()
def list_materials():
    # Marketing/sales materials are visible to every logged-in user.
    user, error = require_current_user()

    if error:
        return error

    materials = Material.query.order_by(Material.created_at.desc()).all()
    return jsonify({"materials": [material.to_dict() for material in materials]})


@materials_bp.post("")
@jwt_required()
def create_material():
    # Only the management (finance) team uploads materials.
    user, error = require_finance_user()

    if error:
        return error

    # Accept multipart form (so a file can be attached) or plain JSON for links.
    data = request.form if request.form else (request.get_json(silent=True) or {})

    title = (data.get("title") or "").strip()
    description = (data.get("description") or "").strip() or None
    category = (data.get("category") or "").strip() or None
    link_url = (data.get("linkUrl") or "").strip() or None

    if not title:
        return validation_error("title is required.")

    upload = request.files.get("file")
    file_url = None
    file_name = None

    if upload and upload.filename:
        if not allowed_material_file(upload.filename):
            return validation_error(
                "That file type isn't supported. Upload a document or image, or "
                "share a link (e.g. Google Drive / YouTube) for videos."
            )
        file_url = save_upload(upload, "materials")
        file_name = upload.filename
    elif not link_url:
        return validation_error("Attach a file or provide a link (linkUrl).")

    material = Material(
        title=title,
        description=description,
        category=category,
        file_url=file_url,
        file_name=file_name,
        link_url=link_url,
        uploaded_by=user.id,
    )

    db.session.add(material)
    db.session.commit()

    return jsonify({"material": material.to_dict()}), 201


@materials_bp.delete("/<int:material_id>")
@jwt_required()
def delete_material(material_id):
    _, error = require_finance_user()

    if error:
        return error

    material = Material.query.get(material_id)

    if not material:
        return jsonify({"message": "Material not found."}), 404

    db.session.delete(material)
    db.session.commit()

    return jsonify({"message": "Material deleted."})
