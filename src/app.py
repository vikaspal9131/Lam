from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import re
import json
from urllib.parse import urlparse

app = Flask(__name__)

# ✅ Configure Gemini API
genai.configure(api_key="AIzaSyAWEuYIPHmfaE6PlQOUyrH3qVLuT_kiSdE")  # 🔑 Replace this with your actual valid API key

# ✅ Validate URL
def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

# ✅ Extract useful text from various tags
def extract_useful_text(soup):
    elements = soup.find_all(['p', 'li', 'span', 'section', 'article'])
    return ' '.join(el.get_text(strip=True) for el in elements if el.get_text(strip=True))

# ✅ AI Summary Generator
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

# ✅ Home route
@app.route('/')
def home():
    return render_template('index.html')

# ✅ API route
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

# ✅ Run the app
if __name__ == '__main__':
    app.run(debug=True)
