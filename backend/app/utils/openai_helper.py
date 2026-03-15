from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

TOPIC_PROMPTS = {
    "frontend":   "React, JavaScript, CSS, HTML, web performance, and browser APIs",
    "backend":    "Python, FastAPI, REST APIs, databases, SQL, authentication, and system design",
    "behavioral": "teamwork, leadership, conflict resolution, problem solving, and communication",
    "dsa":        "data structures, algorithms, Big O notation, arrays, trees, graphs, and sorting"
}

DIFFICULTY_PROMPTS = {
    "easy":   "basic and beginner-friendly",
    "medium": "intermediate level requiring some experience",
    "hard":   "advanced and challenging, suitable for senior developers"
}

def generate_question(topic: str, difficulty: str = "medium", previous_questions: list = []) -> str:
    topic_desc = TOPIC_PROMPTS.get(topic, topic)
    difficulty_desc = DIFFICULTY_PROMPTS.get(difficulty, "intermediate level")
    prev = "\n".join(previous_questions) if previous_questions else "None"

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": f"""You are a senior software engineer conducting a technical interview.
Generate a single {difficulty_desc} interview question about {topic_desc}.
The question should be clear and specific.
Do NOT include the answer. Do NOT number the question. Just ask the question directly.
Previous questions asked (avoid repeating): {prev}"""
            },
            {"role": "user", "content": "Generate one interview question."}
        ],
        max_tokens=200,
        temperature=0.8
    )
    return response.choices[0].message.content.strip()


def evaluate_answer(question: str, answer: str, topic: str) -> dict:
    if not answer.strip():
        return {
            "score": 0,
            "feedback": "No answer provided.",
            "strengths": [],
            "improvements": ["Please provide an answer to the question."],
            "resources": []
        }

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": """You are a senior software engineer evaluating an interview answer.
Evaluate the answer and respond ONLY with a JSON object in this exact format:
{
  "score": <number from 0 to 10>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "resources": [
    {"title": "<resource name>", "url": "<https://...>", "type": "<article/video/docs>"},
    {"title": "<resource name>", "url": "<https://...>", "type": "<article/video/docs>"}
  ]
}
For resources, suggest 2 real, specific learning resources relevant to the question topic.
Be honest but constructive. Score 0-4 for poor, 5-7 for good, 8-10 for excellent."""
            },
            {
                "role": "user",
                "content": f"Topic: {topic}\nQuestion: {question}\nAnswer: {answer}"
            }
        ],
        max_tokens=600,
        temperature=0.3
    )

    import json
    text = response.choices[0].message.content.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(text)
    except:
        return {
            "score": 5,
            "feedback": text,
            "strengths": [],
            "improvements": [],
            "resources": []
        }
