from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="*", supports_credentials=True)


# Set up your Gemini API key as an environment variable
genai.configure(api_key="AIzaSyAqhI3u0jOec1sw10CHmbdaPwf4lqfz-jg")

@app.route('/api/generate-hint', methods=['POST'])
def generate_hint():
    # Get JSON data from the request
    data = request.get_json()
    question_text = data.get("question_text") 
    user_code = data.get("user_code")
    language = data.get("language")
    hint_level = data.get("hint_level", 1)  # Default hint level to 1 if not provided

    # Validate the required fields
    if not question_text or not language:
        return jsonify({"error": "Missing required fields"}), 400

    # Supported languages check
    supported_languages = ["Python", "Java", "C++", "JavaScript"]
    if language not in supported_languages:
        return jsonify({"error": "Invalid programming language specified"}), 400

    # Set up the LLM prompt
    prompt = (
        f"The question is: {question_text}\n\n"
        f"Analyze the following {language} code and provide a hint to guide the user towards a solution.\n"
        f"Do not give away the full answer, just a hint based on what is written.\n"
        f"Hint Level 1: Offer a gentle nudge to get the user thinking in the right direction, focusing on general concepts or methods.\n"
        f"Hint Level 2: Give more specific guidance, mentioning a potential approach or function to consider without revealing exact implementation details.\n"
        f"Hint Level 3: Provide guidance that is close to a solution, giving enough detail for the user to easily write the code with minimal guesswork.\n\n"
        f"User's current Hint Level {hint_level}:\n{user_code if user_code else 'No code provided'}"
    )

    try:
        # # Initialize the Gemini model
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Generate the hint using Gemini API
        response = model.generate_content(prompt)
        hint_text = response.text.strip()

        # Determine the next hint level and if it's the final hint
        next_hint_level = hint_level + 1
        is_final_hint = next_hint_level > 3  # Assume level 3 is the final hint

        # Construct response
        return jsonify({
            "hint": hint_text,
            "next_hint_level": next_hint_level,
            "is_final_hint": is_final_hint
        })

    except Exception as e:
        # Return an error response if something goes wrong
        return jsonify({"error": str(e)}), 500

@app.route('/api/answer-question', methods=['POST'])
def answer_question():
    # Get JSON data from the request
    data = request.get_json()
    user_question = data.get("user_question")
    coding_question = data.get("coding_question")
    user_code = data.get("user_code", "")  # Optional: Defaults to empty if not provided

    # Validate required fields
    if not user_question or not coding_question:
        return jsonify({"error": "Missing required fields"}), 400

    # Set up the LLM prompt, including user question, coding question, and user code if available
    prompt = (
        f"The coding question is: {coding_question}\n"
        f"The user's code is: {user_code if user_code else 'No code provided'}\n\n"
        f"Answer the following question about the code or concept or ingeneral question:\n{user_question}"
    )

    try:
        # Generate the answer using the Gemini API
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        answer_text = response.text.strip()

        # Construct response
        return jsonify({
            "answer": answer_text
        })

    except Exception as e:
        # Return an error response if something goes wrong
        return jsonify({"error": str(e)}), 500

@app.route('/api/validate-code', methods=['POST'])
def validate_code():
    # Get JSON data from the request
    data = request.get_json()
    coding_question = data.get("coding_question")
    user_code = data.get("user_code")

    # Validate required fields
    if not coding_question or not user_code:
        return jsonify({"error": "Missing required fields"}), 400

    # Construct the prompt for the LLM to validate the code
    prompt = (
        f"The coding question is: {coding_question}\n\n"
        f"Here is the user's code:\n{user_code}\n\n"
        f"Check if the user's code correctly solves the question. "
        f"Return 'accepted' if the code is correct, otherwise return 'failed' and explain the reason for failure."
    )

    try:
        # Generate the validation response using the Gemini API
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        validation_result = response.text.strip()

        # Extract "accepted" or "failed" status and reason from the model's response
        if "accepted" in validation_result.lower():
            status = "accepted"
            reason = "The code is correct and meets the requirements of the question."
        else:
            status = "failed"
            reason = validation_result  # Detailed explanation provided by the model

        # Construct response
        return jsonify({
            "status": status,
            "reason": reason
        })

    except Exception as e:
        # Return an error response if something goes wrong
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app
    app.run(host="0.0.0.0", port=8080)
