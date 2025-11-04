import os
import PyPDF2 # pyright: ignore[reportMissingImports]
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env in manage.py directory
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY is missing. Set it in .env or environment variables.")

genai.configure(api_key=API_KEY)


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
