
from flask import Flask, jsonify
from flask_cors import CORS
import random, string

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

if __name__ == '__main__':
    
    app.run(debug=True)
