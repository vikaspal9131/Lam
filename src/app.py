from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
import google.generativeai as genai
import re
import json

app = Flask(__name__)


# ✅ Configure Gemini API
genai.configure(api_key="AIzaSyAWEuYIPHmfaE6PlQOUyrH3qVLuT_kiSdE")  # 🔐 Replace with your real API key

def generate_ai_summary(text, code):
    """Uses Gemini to generate structured summary JSON"""
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

        # ✅ Extract only the JSON part using regex
        json_str = re.search(r'{.*}', raw_text, re.DOTALL)
        if json_str:
            return json.loads(json_str.group())

        return {"error": "Gemini did not return valid JSON."}

    except Exception as e:
        return {'error': f"Error generating summary: {str(e)}"}
     
@app.route('/api/summary', methods=['POST'])
def generate_summary():
    url = request.form.get('url')  # 👈 Accept URL from form input (not JSON)

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        # 📄 Extract all <p> content
        text = ' '.join(p.get_text() for p in soup.find_all('p'))

        # 💻 Extract all <code> and <pre> content
        code_snippets = '\n\n'.join(code.get_text() for code in soup.find_all(['code', 'pre']))

        if not text.strip():
            return jsonify({'error': 'No useful text found on the page'}), 404

        # 🤖 Generate AI Summary
        result = generate_ai_summary(text, code_snippets)

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
