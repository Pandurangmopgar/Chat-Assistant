import requests

url = "https://nxp9w8geak.execute-api.us-east-1.amazonaws.com/Prod"

# Open the image file in binary mode
files = {'image': ('mg_4950.jpg', open(r'C:\Users\admin\Downloads\mg_4950.jpg', 'rb'), 'image/jpeg')}

# Send the POST request
response = requests.post(url, files=files)

# Check the response
print(response.status_code)
print(response.json())
import json
import base64
import os
from dotenv import load_dotenv
from PIL import Image
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
import io

# Load environment variables
load_dotenv()

# Configure generative AI model
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel(model_name='gemini-1.5-flash')

app = Flask(__name__)
CORS(app)

def get_gemini_response(input_prompt, image):
    response = model.generate_content([input_prompt, image])
    return response.text

@app.route('/process_image', methods=['POST'])
def process_image():
    if request.is_json:
        data = request.json
    else:
        # For Lambda, parse the event body
        data = json.loads(request.get_data())
    
    image_data = base64.b64decode(data['image'].split(',')[1])
    image = Image.open(io.BytesIO(image_data))
    
    prompt = data['prompt']
    
    response = get_gemini_response(prompt, image)
    return jsonify({'response': response})

def lambda_handler(event, context):
    # Simulate a Flask request for Lambda
    with app.test_request_context(
        path='/process_image',
        method='POST',
        data=json.dumps(json.loads(event['body'])),
        headers={'Content-Type': 'application/json'}
    ):
        response = app.full_dispatch_request()
    
    return {
        'statusCode': response.status_code,
        'body': response.get_data(as_text=True),
        'headers': dict(response.headers)
    }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)