from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import re
import json
from urllib.parse import urlparse

app = Flask(__name__)


genai.configure(api_key="AIzaSyAWEuYIPHmfaE6PlQOUyrH3qVLuT_kiSdE")  


def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False


def extract_useful_text(soup):
    elements = soup.find_all(['p', 'li', 'span', 'section', 'article'])
    return ' '.join(el.get_text(strip=True) for el in elements if el.get_text(strip=True))

def generate_ai_summary(text, code):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
You are an intelligent technical summarizer.

Here's the documentation content:

📄 Text:
{text}

💻 Code:
{code}

✍️ Your Task:
Return the result in the following JSON format ONLY:
{{
  "summary": "Short summary of the page...",
  "key_points": ["point 1", "point 2", "..."],
  "code_explanation": [
    {{
      "code": "code snippet 1",
      "explanation": "what it does"
    }},
    {{
      "code": "code snippet 2",
      "explanation": "what it does"
    }}
  ]
}}

IMPORTANT: Return only valid JSON. Do not include any extra text or formatting.
"""
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        json_str = re.search(r'{.*}', raw_text, re.DOTALL)
        if json_str:
            return json.loads(json_str.group())

        return {"error": "Gemini did not return valid JSON."}

    except Exception as e:
        return {'error': f"Error generating summary: {str(e)}"}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')


@app.route('/api/summary', methods=['POST'])
def generate_summary():
    url = request.form.get('url')

    if not url or not is_valid_url(url):
        return jsonify({'error': 'Valid URL is required'}), 400

    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')

        text = extract_useful_text(soup)
        code_snippets = '\n\n'.join(code.get_text() for code in soup.find_all(['code', 'pre']))

        if not text.strip():
            return jsonify({'error': 'No useful text found on the page'}), 404

        result = generate_ai_summary(text, code_snippets)

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)