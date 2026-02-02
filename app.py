from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
from object_detection import detect_obstacles
from scene_description import describe_scene

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

@app.route('/describe-scene', methods=['POST'])
def scene_description():
    image = request.files['image']
    description = describe_scene(image)
    return jsonify({'description': description})

@app.route('/detect-obstacles', methods=['POST'])
def obstacle_detection():
    image = request.files['image']
    obstacles = detect_obstacles(image)
    return jsonify({'obstacles': obstacles})

if __name__ == '__main__':
    app.run(debug=True)
