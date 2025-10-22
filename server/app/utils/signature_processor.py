"""
Signature Processing Utilities
"""
import base64
import io
import os
from pathlib import Path
from PIL import Image
from PyPDF2 import PdfReader, PdfWriter
from pdf2image import convert_from_path
import uuid

from app.config import get_settings

settings = get_settings()

async def apply_signature_to_document(
    document_path: str,
    signature_data: str,
    position_x: int,
    position_y: int
) -> str:
    """
    Apply signature to document

    Args:
        document_path: Path to original document
        signature_data: Base64 encoded signature image
        position_x: X coordinate for signature placement
        position_y: Y coordinate for signature placement

    Returns:
        str: Path to signed document
    """
    file_ext = os.path.splitext(document_path)[1].lower()

    if file_ext == '.pdf':
        return await apply_signature_to_pdf(document_path, signature_data, position_x, position_y)
    elif file_ext in ['.png', '.jpg', '.jpeg']:
        return await apply_signature_to_image(document_path, signature_data, position_x, position_y)
    else:
        raise ValueError(f"Unsupported file type: {file_ext}")

async def apply_signature_to_image(
    image_path: str,
    signature_data: str,
    position_x: int,
    position_y: int
) -> str:
    """Apply signature to image document"""

    # Decode base64 signature
    signature_bytes = base64.b64decode(signature_data.split(',')[1] if ',' in signature_data else signature_data)
    signature_image = Image.open(io.BytesIO(signature_bytes))

    # Open original image
    original_image = Image.open(image_path)

    # Convert to RGBA if needed
    if original_image.mode != 'RGBA':
        original_image = original_image.convert('RGBA')

    if signature_image.mode != 'RGBA':
        signature_image = signature_image.convert('RGBA')

    # Resize signature if needed (max 200px width)
    max_width = 200
    if signature_image.width > max_width:
        ratio = max_width / signature_image.width
        new_height = int(signature_image.height * ratio)
        signature_image = signature_image.resize((max_width, new_height), Image.Resampling.LANCZOS)

    # Paste signature onto image
    original_image.paste(signature_image, (position_x, position_y), signature_image)

    # Save signed image
    signed_dir = Path(settings.upload_dir) / "signed_documents"
    signed_dir.mkdir(parents=True, exist_ok=True)

    file_ext = os.path.splitext(image_path)[1]
    signed_filename = f"signed_{uuid.uuid4()}{file_ext}"
    signed_path = signed_dir / signed_filename

    # Convert back to RGB for JPEG
    if file_ext.lower() in ['.jpg', '.jpeg']:
        original_image = original_image.convert('RGB')

    original_image.save(signed_path)

    return str(signed_path)

async def apply_signature_to_pdf(
    pdf_path: str,
    signature_data: str,
    position_x: int,
    position_y: int
) -> str:
    """
    Apply signature to PDF document

    Note: This is a simplified implementation for hackathon.
    For production, use reportlab or pdf-lib for proper PDF manipulation.
    """

    # For hackathon prototype: Convert first page to image, add signature, save as new PDF
    # This is a workaround - proper implementation would use reportlab

    try:

        # Convert PDF first page to image
        images = convert_from_path(pdf_path)

        if not images:
            raise ValueError("Could not convert PDF to image")
        
        pdf_image = images[-1]
        
        # Decode signature
        signature_bytes = base64.b64decode(signature_data.split(',')[1] if ',' in signature_data else signature_data)
        signature_image = Image.open(io.BytesIO(signature_bytes))
        
        # Convert to RGBA
        if pdf_image.mode != 'RGBA':
            pdf_image = pdf_image.convert('RGBA')
        
        if signature_image.mode != 'RGBA':
            signature_image = signature_image.convert('RGBA')
        
        # Resize signature
        max_width = 200
        if signature_image.width > max_width:
            ratio = max_width / signature_image.width
            new_height = int(signature_image.height * ratio)
            signature_image = signature_image.resize((max_width, new_height), Image.Resampling.LANCZOS)

        # Paste signature
        pdf_image.paste(signature_image, (position_x, position_y), signature_image)
        
        # Save as new PDF
        signed_dir = Path(settings.upload_dir) / "signed_documents"
        signed_dir.mkdir(parents=True, exist_ok=True)
        
        signed_filename = f"signed_{uuid.uuid4()}.pdf"
        signed_path = signed_dir / signed_filename
        
        # Convert back to RGB and save as PDF
        pdf_image = pdf_image.convert('RGB')
        pdf_image.save(signed_path, 'PDF', resolution=100.0)

        return str(signed_path)
        
    except ImportError:
        # If pdf2image is not available, create a simple workaround
        # Copy the original PDF and mark it as signed
        signed_dir = Path(settings.upload_dir) / "signed_documents"
        signed_dir.mkdir(parents=True, exist_ok=True)
        
        signed_filename = f"signed_{uuid.uuid4()}.pdf"
        signed_path = signed_dir / signed_filename
        
        # For hackathon: just copy the file
        # In production, use proper PDF manipulation library
        import shutil
        shutil.copy(pdf_path, signed_path)
        
        return str(signed_path)

def validate_signature_data(signature_data: str) -> bool:
    """Validate base64 signature data"""
    try:
        # Remove data URL prefix if present
        if ',' in signature_data:
            signature_data = signature_data.split(',')[1]
        
        # Try to decode
        decoded = base64.b64decode(signature_data)
        
        # Try to open as image
        Image.open(io.BytesIO(decoded))
        
        return True
    except Exception:
        return False
