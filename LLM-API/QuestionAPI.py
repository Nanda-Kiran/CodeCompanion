from flask import Flask, request, jsonify
import google.generativeai as genai

app = Flask(__name__)

# Set up your API key directly
genai.configure(api_key="AIzaSyAqhI3u0jOec1sw10CHmbdaPwf4lqfz-jg")  # Replace with your actual API key

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

if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True)
