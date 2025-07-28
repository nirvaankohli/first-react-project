
from flask import Flask, jsonify, request, g
from flask_cors import CORS
import random, string
import os, json, uuid, sqlite3
from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


DB = "quizzes.db"

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB)
        g.db.execute("create table if not exists quizzes(id text primary key, field text, topic text, data text)")
    return g.db

app = Flask(__name__)
CORS(app)

@app.teardown_appcontext

def close_db(e):
    if "db" in g:
        g.db.close()

@app.route('/')

def index():

    return "Flask server is running!"

@app.route('/api/message')

def get_message():

    return jsonify(message='Hello from Flask!')

@app.route("/api/random")

def random_data():

    payload = {

        "msg": "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    }

    return jsonify(payload)

@app.route("/api/quiz", methods=["POST"])
def create_quiz():

    body = request.get_json()

    field = body.get("field", "General")
    topic = body.get("topic", "Knowledge")
    
    if not os.getenv("OPENAI_API_KEY"):

        return jsonify({"error": "OpenAI API key not configured"}), 500
    
    prompt = f"Generate a 5-question multiple-choice quiz about {topic} in the field of {field}. Return pure JSON array with keys q, choices (4), answer (index)."
    
    try:

        print(f"Making OpenAI API call with prompt: {prompt[:100]}...")
       
        response = client.chat.completions.create(

            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        
        )
        
        print(f"OpenAI response received: {response.choices[0].message.content[:100]}...")
        

        content = response.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        try:
            quiz = json.loads(content)
        except json.JSONDecodeError as json_err:
            print(f"JSON parsing error: {json_err}")
            print(f"Raw content: {content}")
            # Create a fallback quiz
            quiz = [
                {
                    "q": "What is the primary purpose of Python?",
                    "choices": ["Web development", "Data analysis", "General-purpose programming", "Mobile development"],
                    "answer": 2
                },
                {
                    "q": "Which of the following is a Python data structure?",
                    "choices": ["Array", "List", "Vector", "Matrix"],
                    "answer": 1
                },
                {
                    "q": "What does 'pip' stand for in Python?",
                    "choices": ["Python Installer Package", "Package Installer for Python", "Python Index Package", "Python Integration Platform"],
                    "answer": 1
                },
                {
                    "q": "Which symbol is used for comments in Python?",
                    "choices": ["//", "#", "/*", "<!--"],
                    "answer": 1
                },
                {
                    "q": "What is the correct way to create a function in Python?",
                    "choices": ["function myFunc():", "def myFunc():", "create myFunc():", "func myFunc():"],
                    "answer": 1
                }
            ]
            
    except Exception as e:
        print(f"OpenAI API error: {e}")
        print(f"Error type: {type(e)}")
        quiz = [{"q": f"Failed to generate quiz: {str(e)}", "choices": ["API error occurred"], "answer": 0}]
    
    qid = str(uuid.uuid4())
    db = get_db()
    db.execute("insert into quizzes values(?,?,?,?)", (qid, field, topic, json.dumps(quiz)))
    db.commit()

    print(f"Quiz saved with ID: {qid}")
    print(quiz)
    
    return jsonify({"id": qid, "quiz": quiz})

@app.route("/api/quiz/<qid>", methods=["GET"])
def fetch_quiz(qid):
    db = get_db()
    row = db.execute("select data from quizzes where id=?", (qid,)).fetchone()
    if not row:
        return jsonify({"error": "not found"}), 404
    return jsonify(json.loads(row[0]))

if __name__ == '__main__':
    app.run(debug=True)
