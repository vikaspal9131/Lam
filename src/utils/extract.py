import requests
from bs4 import BeautifulSoup

def extract_text_from_url(url):
    """Extracts text content from a webpage"""
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        paragraphs = soup.find_all('p')
        text = "\n".join([p.get_text() for p in paragraphs])
        return text if text else "No content found"
    except:
        return "Failed to fetch content"
