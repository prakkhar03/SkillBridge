from langchain_google_genai import GoogleGenerativeAI, ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from dotenv import load_dotenv
import os
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY is missing. Set it in your .env file.")
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",   
    api_key=API_KEY
)
def analyze_resume(resume_text: str) -> str:
    template = PromptTemplate(
        input_variables=["resume_text"],
        template="""
        You are an expert technical recruiter.
        Analyze the following resume text and provide:
        - Key strengths
        - Weaknesses
        - Suggestions for improvement
        Resume:
        {resume_text}
        """
    )
    chain = template | model | StrOutputParser()
    return chain.invoke({"resume_text": resume_text})
def analyze_github_profile(github_profile: str) -> str:
    template = PromptTemplate(
        input_variables=["github_profile"],
        template="""
        You are an expert technical recruiter.
        Analyze the following GitHub profile and provide:
        - Key strengths
        - Weaknesses
        - Suggestions for improvement
        GitHub Profile URL:
        {github_profile}
        """
    )
    chain = template | model | StrOutputParser()
    return chain.invoke({"github_profile": github_profile})
def generate_final_report(resume_analysis: str, github_analysis: str) -> str:
    template = PromptTemplate(
        input_variables=["resume_analysis", "github_analysis"],
        template="""
        You are an expert technical recruiter.
        Based on the following analyses, generate a comprehensive final report.
        Resume Analysis:
        {resume_analysis}
        GitHub Analysis:
        {github_analysis}
        Final Report:
        """
    )
    chain = template | model | StrOutputParser()
    return chain.invoke({"resume_analysis": resume_analysis, "github_analysis": github_analysis})
def generate_test(resume_analysis: str, github_analysis: str, skills=None, recommendation=None, num_questions=5, role_hint="Developer") -> str:
    parser = JsonOutputParser()
    template = PromptTemplate(
        input_variables=["resume_analysis", "github_analysis", "skills", "recommendation", "num_questions", "role_hint"],
        template="""
        Based on these analyses and provided skills:
        Resume Analysis:
        {resume_analysis}
        GitHub Analysis:
        {github_analysis}
        Skills:
        {skills}
        Recommendation:
        {recommendation}
        Generate {num_questions} technical interview questions that align with the candidate's profile.
        Provide only the questions without explanations.
        Instructions:
        - Make the questions practical, scenario-based, and relevant to the candidate's freelance role.
        - Vary difficulty: Easy, Medium, Hard.
        - Return ONLY valid JSON in this format:
        {{
            "role": "{role_hint}",
            "questions": [
                {{
                    "question": "string",
                    "options": ["A", "B", "C", "D"],
                    "type": "theory/practical/task",
                    "difficulty": "Easy/Medium/Hard",
                    "correct_answer": "B"
                }}
            ],
            "answers": ["B", "A", "D", "C", "B"]
        }}
        """
    )
    chain = template | model | parser
    r=chain.invoke({
        "resume_analysis": resume_analysis,
        "github_analysis": github_analysis,
        "skills": skills,
        "recommendation": recommendation,
        "num_questions": num_questions,
        "role_hint": role_hint
    })
    return r

from langchain.prompts import PromptTemplate
import json,re
def final_analysis(resume_analysis:str,github_analysis:str,previous_recommendation:str,test_score:float,test_result:str):
    prompt=PromptTemplate(
        input_variables=["resume_analysis","github_analysis","previous_recommendation","test_score","test_result"],
        template="""
        You are an expert technical evaluator.
        Based on the following details, provide a final structured analysis of the candidate.
        Resume Analysis:
        {resume_analysis}
        GitHub Analysis:
        {github_analysis}
        Previous Recommendation:
        {previous_recommendation}
        Test Performance:
        Score: {test_score}%
        Result: {test_result}
        Return ONLY a valid JSON object in this exact structure:
        {{
            "star_rating": float (1–5),
            "strengths": [list of strings],
            "weaknesses": [list of strings],
            "recommended_tags": ["Beginner", "Intermediate", or "Expert"]
        }}
        Do not include any explanations or extra text.
        """
    )
    parser=StrOutputParser()
    chain=prompt|model|parser
    response=chain.invoke({"resume_analysis":resume_analysis,"github_analysis":github_analysis,"previous_recommendation":previous_recommendation,"test_score":test_score,"test_result":test_result})
    return response
