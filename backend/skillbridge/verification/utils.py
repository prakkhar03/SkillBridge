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


def extract_and_analyze_resume(file_field):
    """
    Extracts text from a PDF resume and sends it to Gemini for analysis.
    """

    resume_text = extract_text_from_pdf_fileobj(file_field)

    if not resume_text.strip():
        return "Could not extract text from the resume."

    
    prompt = f"""
    You are an expert technical recruiter.
    Analyze the following resume text and provide:
    - Key strengths
    - Weaknesses
    - Suggestions for improvement

    Resume:
    {resume_text}
    """

   
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error from Gemini: {str(e)}"


def analyze_github_with_gemini(github_url):
    """Analyzes GitHub profile with Gemini."""
    if not github_url:
        return "No GitHub URL provided."

    prompt = f"""
    You are an expert software mentor.
    Analyze the GitHub profile at {github_url} and provide:
    - Coding strengths
    - Areas for improvement
    - Technology focus
    Assume typical public repo signals if data not accessible.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error from Gemini: {str(e)}"
import json
import re

def generate_gemini_recommendation(resume_analysis, github_analysis, skills=None):
    """Generates JSON recommendation based on resume, GitHub analysis & skills."""
    prompt = f"""
    Based on these analyses and provided skills:

    Resume Analysis:
    {resume_analysis}

    GitHub Analysis:
    {github_analysis}

    Skills:
    {skills or "Not provided"}

    Return ONLY a valid JSON object with:
    {{
        "star_rating": float (1–5),
        "strengths": [list of strings],
        "weaknesses": [list of strings],
        "recommended_tags": ["Beginner", "Intermediate", or "Expert"]
    }}
    No extra text, no explanation — only JSON.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        raw_text = response.text.strip()

        # Extract JSON block if there's extra formatting
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if match:
            raw_text = match.group(0)

        return json.loads(raw_text)

    except Exception as e:
        return {"error": str(e)}
    

#------------test generation logic------------------    
def generate_tests_based_on_profile(resume_analysis, github_analysis, skills=None, recommendation=None, num_questions=5):
    """
    Generates personalized test questions for ANY freelance role based on:
    - Resume analysis
    - GitHub analysis
    - Skills list
    - Gemini recommendation JSON (optional)
    
    Output: A structured JSON with questions, type, and difficulty.
    """

    role_hint = "freelance professional"  # default generic
    if skills:
        role_hint = f"freelancer specializing in {', '.join(skills)}"
    if recommendation and isinstance(recommendation, dict):
        if "recommended_tags" in recommendation:
            role_hint = f"{', '.join(recommendation['recommended_tags'])} professional"

    prompt = f"""
    You are an expert interviewer creating evaluation tasks for freelancers.
    Based on the following candidate data, generate {num_questions} role-specific questions or tasks:

    Resume Analysis:
    {resume_analysis}

    GitHub Analysis:
    {github_analysis}

    Skills:
    {skills or "Not provided"}

    Recommended Role:
    {role_hint}

    Instructions:
    - Make the questions practical, scenario-based, and relevant to the candidate's freelance role.
    - Cover a mix of theoretical and hands-on tasks.
    - Vary difficulty: Easy, Medium, Hard.
    - Examples of possible roles: Graphic Designer, Content Writer, Web Developer, Digital Marketer, Data Analyst, etc.
    - Use creative, real-world scenarios to test practical skills.
    - Return ONLY valid JSON in this format:
    {{
        "role": "{role_hint}",
        "questions": [
            {{
                "question": "string",
                "type": "theory/practical/task",
                "difficulty": "Easy/Medium/Hard"
            }}
        ]
    }}
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        import re, json
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if match:
            raw_text = match.group(0)

        return json.loads(raw_text)

    except Exception as e:
        return {"error": f"Error generating tests: {str(e)}"}
