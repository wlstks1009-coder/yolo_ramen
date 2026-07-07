import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
FASTAPI_URL = "http://localhost:8000/predict"


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload_capture', methods=['POST'])
def upload_capture():
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No image"})

    file = request.files['image']
    try:
        files = {'file': (file.filename, file.read(), file.content_type)}
        response = requests.post(FASTAPI_URL, files=files)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)