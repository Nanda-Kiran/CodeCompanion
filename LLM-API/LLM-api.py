from flask import Flask, request, jsonify
import google.generativeai as genai
import os

app = Flask(__name__)

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
        f"Hint Level {hint_level}:\n{user_code if user_code else 'No code provided'}"
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

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True)
