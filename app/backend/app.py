
from flask import Flask, jsonify
from flask_cors import CORS
import random, string
import os, json
from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)

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

@app.route("/api/quiz")

def get_quiz():


    if not os.getenv("OPENAI_API_KEY"):

        return jsonify([{"q": "OpenAI API key not configured", "choices": ["Please set OPENAI_API_KEY in .env file"], "answer": 0}]), 500
    
    prompt = (
        
        "Generate a 5-question multiple-choice quiz on general knowledge. "
        "Return pure JSON array (no markdown) with keys q, choices (4), answer (index)."
    
    )

    try:

        response = client.chat.completions.create(

            model="gpt-4o-mini",

            messages=[{"role": "user", "content": prompt}],
            
            temperature=0.7,
        
        )

        quiz = json.loads(response.choices[0].message.content)
        
        print(quiz)

        return jsonify(quiz)
        
    except Exception as e:

        print(f"OpenAI API error: {e}")
        
        return jsonify([{"q": "Failed to generate quiz", "choices": ["API error occurred"], "answer": 0}]), 500

if __name__ == '__main__':
    
    app.run(debug=True)
