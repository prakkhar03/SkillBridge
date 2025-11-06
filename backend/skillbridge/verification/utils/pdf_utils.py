import os
import PyPDF2 
from dotenv import load_dotenv

load_dotenv()

def extract_text_from_pdf_fileobj(file_field):
    """Reads a PDF file from Django FileField and returns extracted text."""
    text = ""
    try:
        file_field.open("rb")
        reader = PyPDF2.PdfReader(file_field)
        for page in reader.pages:
            text += page.extract_text() or ""
        file_field.close()
    except Exception as e:
        text = f"Error extracting text: {str(e)}"
    return text.strip()
