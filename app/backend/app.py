
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
        # Updated table schema with new columns
        g.db.execute("""
            create table if not exists quizzes(
                id text primary key, 
                field text, 
                topic text, 
                data text,
                numQuestions integer default 5,
                showGrade integer default 0,
                correctAnswers text,
                submissions text default '[]'
            )
        """)
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
    numQuestions = body.get("numQuestions", 5)
    showGrade = body.get("showGrade", False)

    if not isinstance(numQuestions, int) or numQuestions < 1 or numQuestions > 30:
        return jsonify({"error": "numQuestions must be between 1 and 30"}), 400
    
    if not os.getenv("OPENAI_API_KEY"):

        return jsonify({"error": "OpenAI API key not configured"}), 500
    
    prompt = f"""Generate a {numQuestions}-question multiple-choice quiz about {topic} in the field of {field}. 

Requirements:
- Return ONLY a valid JSON array (no markdown, no explanations)
- Each question object must have: "q" (question text), "choices" (array of 4 options), "answer" (index 0-3)
- Make questions challenging but appropriate for the topic
- Ensure all answer indices are valid (0-3)

Example format:
[
  {{"q": "What is the primary purpose of Python?", "choices": ["Web development", "Data analysis", "General-purpose programming", "Mobile development"], "answer": 2}},
  {{"q": "Which symbol is used for comments in Python?", "choices": ["//", "#", "/*", "<!--"], "answer": 1}}
]"""
    
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

            if not isinstance(quiz, list):

                raise ValueError("Quiz must be an array")
            
            for i, question in enumerate(quiz):

                if not isinstance(question, dict):

                    raise ValueError(f"Question {i} must be an object")

                if "q" not in question or "choices" not in question or "answer" not in question:
                    
                    raise ValueError(f"Question {i} missing required fields")
                
                if not isinstance(question["choices"], list) or len(question["choices"]) != 4:
                
                    raise ValueError(f"Question {i} must have exactly 4 choices")
                
                if not isinstance(question["answer"], int) or question["answer"] < 0 or question["answer"] > 3:
                
                    raise ValueError(f"Question {i} answer must be 0-3")
            
            if len(quiz) != numQuestions:

                print(f"Warning: Expected {numQuestions} questions, got {len(quiz)}")
                
        except (json.JSONDecodeError, ValueError) as parse_err:

            print(f"JSON parsing/validation error: {parse_err}")
            print(f"Raw content: {content}")
            

            retry_prompt = f"Generate exactly {numQuestions} multiple-choice questions about {topic} in {field}. Return only JSON array with q, choices (4 options), answer (0-3)."
            
            try:

                retry_response = client.chat.completions.create(

                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": retry_prompt}],
                    temperature=0.5,

                )
                
                retry_content = retry_response.choices[0].message.content.strip()

                if retry_content.startswith("```json"):

                    retry_content = retry_content[7:]

                if retry_content.endswith("```"):

                    retry_content = retry_content[:-3]

                retry_content = retry_content.strip()
                
                quiz = json.loads(retry_content)
                
                if not isinstance(quiz, list) or len(quiz) == 0:

                    raise ValueError("Invalid quiz structure")
                    
            except Exception as retry_err:

                print(f"Retry also failed: {retry_err}")

                quiz = [{"q": f"Failed to generate quiz: {str(parse_err)}", "choices": ["API error occurred"], "answer": 0}]
            
    except Exception as e:

        print(f"OpenAI API error: {e}")
        print(f"Error type: {type(e)}")

        quiz = [{"q": f"Failed to generate quiz: {str(e)}", "choices": ["API error occurred"], "answer": 0}]
    

    correctAnswers = [q["answer"] for q in quiz]
    
    qid = str(uuid.uuid4())
    db = get_db()

    db.execute(

        "insert into quizzes values(?,?,?,?,?,?,?,?)", 

        (qid, field, topic, json.dumps(quiz), numQuestions, 1 if showGrade else 0, json.dumps(correctAnswers), "[]")
    
    )

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

@app.route("/api/quiz/<qid>/answers", methods=["POST"])
def submit_answers(qid):
    body = request.get_json()
    answers = body.get("answers", [])
    
    if not isinstance(answers, list):
        return jsonify({"error": "answers must be an array"}), 400
    
    db = get_db()
    row = db.execute("select data, numQuestions, showGrade, correctAnswers, submissions from quizzes where id=?", (qid,)).fetchone()
    
    if not row:
        return jsonify({"error": "quiz not found"}), 404
    
    quiz_data, numQuestions, showGrade, correctAnswers_json, submissions_json = row
    
    # Validate answer count
    if len(answers) != numQuestions:
        return jsonify({"error": f"Expected {numQuestions} answers, got {len(answers)}"}), 400
    
    # Calculate score
    correctAnswers = json.loads(correctAnswers_json)
    score = sum(1 for i, answer in enumerate(answers) if answer == correctAnswers[i])
    percentage = (score / numQuestions) * 100
    
    # Create submission record
    import datetime
    submission = {
        "timestamp": datetime.datetime.now().isoformat(),
        "answers": answers,
        "score": score,
        "percentage": percentage
    }
    
    # Update submissions
    submissions = json.loads(submissions_json)
    submissions.append(submission)
    
    db.execute("update quizzes set submissions = ? where id = ?", (json.dumps(submissions), qid))
    db.commit()
    
    if showGrade:
        # Create corrections array
        quiz = json.loads(quiz_data)
        corrections = []
        for i, (question, userAnswer, correctAnswer) in enumerate(zip(quiz, answers, correctAnswers)):
            corrections.append({
                "question": question["q"],
                "userAnswer": userAnswer,
                "correctAnswer": correctAnswer,
                "isCorrect": userAnswer == correctAnswer,
                "choices": question["choices"]
            })
        
        return jsonify({
            "score": score,
            "total": numQuestions,
            "percentage": percentage,
            "corrections": corrections
        })
    else:
        return jsonify({"status": "submitted"})

if __name__ == '__main__':
    app.run(debug=True)
