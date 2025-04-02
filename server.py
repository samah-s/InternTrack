from flask import Flask, request, jsonify
import pytesseract
import fitz  # PyMuPDF
from transformers import pipeline
import os
from dateutil import parser
from flask_cors import CORS  


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins




# Load LLM for text comparison
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

def normalize_date(text):
    """Extract and normalize any date format to YYYY-MM-DD"""
    words = text.split()  # Split text into words
    for word in words:
        try:
            parsed_date = parser.parse(word, dayfirst=True, fuzzy=True)
            return parsed_date.strftime("%Y-%m-%d")  # Convert to standard format
        except ValueError:
            continue  # Ignore if it's not a date
    return text  # Return original text if no date found


@app.route("/verify", methods=["POST"])
def verify_document():
    mismatches = {}  # Ensure 'mismatches' is defined

    try:
        file = request.files["bonafideLetter"]
        form_data = request.form

        # Save the uploaded file temporarily
        temp_pdf_path = "temp_uploaded.pdf"
        file.save(temp_pdf_path)

        extracted_text = ""

        # Open PDF and extract text
        pdf_doc = fitz.open(temp_pdf_path)
        for page in pdf_doc:
            text = page.get_text()  # Extract text directly
            if not text.strip():  # If no text, use OCR
                pix = page.get_pixmap()
                image = fitz.Pixmap(pix, alpha=False)  # Convert to an image
                extracted_text += pytesseract.image_to_string(image)
            else:
                extracted_text += text

        # ✅ Properly close the PDF before deleting
        pdf_doc.close()

        print("\n📜 Extracted Text from PDF:\n", extracted_text)

        # ✅ Now remove the temporary file
        os.remove(temp_pdf_path)

        # Check extracted details against form input
        fields = ["title", "company", "mobile", "startDate", "endDate", "placement", "stipend", "industry", "location"]

        for field in fields:
            if form_data.get(field):

                if field in ["startDate", "endDate"]:  # Normalize dates before comparison
                    extracted_value = normalize_date(extracted_text)
                    
                else:
                    extracted_value = extracted_text.lower()

                    confidence = classifier(form_data[field], [extracted_value.lower()])["scores"][0]
                    if confidence < 0.9:  # Threshold for mismatch
                        mismatches[field] = form_data[field]

        if mismatches:
            print({"success": False, "message": "Mismatch found", "mismatches": mismatches})
            return jsonify({"success": False, "message": "Mismatch found", "mismatches": mismatches})
        
        print({"success": True, "message": "Document verified. Proceeding with upload."})

        return jsonify({"success": True, "message": "Document verified. Proceeding with upload."})
    

    except Exception as e:
        print({"success": False, "message": "Error processing document " + str(e), "mismatches": mismatches})
        return jsonify({"success": False, "message": "Error processing document " + str(e), "mismatches": mismatches})


if __name__ == "__main__":
    app.run(debug=True, port=5001)