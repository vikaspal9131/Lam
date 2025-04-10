from flask import Blueprint, request, render_template
from utils.extract import extract_text_from_url
from utils.summarize import generate_summary

main_bp = Blueprint("main", __name__)

@main_bp.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        url = request.form["url"]
        extracted_text = extract_text_from_url(url)
        if extracted_text in ["Failed to fetch content", "No content found"]:
            return render_template("index.html", error="Invalid URL or unable to fetch data.")

        summary = generate_summary(extracted_text)
        return render_template("index.html", summary=summary)

    return render_template("index.html")
