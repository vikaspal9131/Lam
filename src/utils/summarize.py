import google.generativeai as genai

# Gemini API Key
genai.configure(api_key="AIzaSyAWEuYIPHmfaE6PlQOUyrH3qVLuT_kiSdE")  # Replace with your key

def generate_summary(text):
    """Summarizes the extracted text using Gemini Flash AI"""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")  # Use the correct model
        response = model.generate_content(f"Summarize the following documentation:\n{text}")
        return response.text
    except Exception as e:
        return f"Error generating summary: {str(e)}"
