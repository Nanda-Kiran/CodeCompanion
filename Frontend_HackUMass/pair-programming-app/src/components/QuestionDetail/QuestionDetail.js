import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import "./QuestionDetail.css";

function QuestionDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const question = location.state?.question;

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("Python");
  const [hint, setHint] = useState("");
  const [showHintBox, setShowHintBox] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [runApiResponse, setRunApiResponse] = useState("");

  const languages = ["Python", "C++", "Java"];

  useEffect(() => {
    const loadPyodide = async () => {
      if (window.pyodide === undefined) {
        window.pyodide = await window.loadPyodide();
      }
    };
    loadPyodide();
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    const languageTemplates = {
      "Python": "",
      "C++": "",
      "Java": "",
    };
    setCode(languageTemplates[event.target.value]);
  };

  const runCode = async () => {
    if (language === "javascript") {
      try {
        const result = new Function(`return (${code})`)();
        setOutput(result !== undefined ? String(result) : "No output");
      } catch (error) {
        setOutput(error.message);
      }
    } else if (language === "Python") {
      try {
        const pyodide = window.pyodide;
        if (!pyodide) {
          setOutput("Pyodide is still loading. Please wait...");
          return;
        }
        await pyodide.loadPackagesFromImports(code);
        pyodide.runPython(
          `import sys\nfrom io import StringIO\nsys.stdout = output = StringIO()`
        );
        pyodide.runPython(code);
        const result = pyodide.runPython("output.getvalue()");
        setOutput(result || "No output");
        pyodide.runPython("sys.stdout = sys.__stdout__");
      } catch (error) {
        setOutput(error.message);
      }
    } else if (language === "C++" || language === "Java") {
      setOutput(`${language} execution is currently unsupported in-browser.`);
    }

    try {
      const response = await fetch("https://flask-api-slzx7zzbqa-uc.a.run.app/api/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "coding_question": String(question?.question || "Default question text"),
          "user_code": String(code)
        }),
      });
      const result = await response.json();
      let plainText = "";

    // Iterate through the result.reason string and build a new string without **
    let i = 0;
    while (i < result.reason.length) {
      // Check if "**" sequence is found
      if (result.reason[i] === "*" && result.reason[i + 1] === "*") {
        i += 2; // Skip the "**" symbols
      } else {
        plainText += result.reason[i]; // Append current character
        i++;
      }
    }

    setRunApiResponse(plainText || "No response from analysis API.");
  } catch (error) {
    setRunApiResponse("Error contacting the analysis API.");
  }
  };

  const showHint = async () => {
    try {
      const response = await fetch("https://flask-api-slzx7zzbqa-uc.a.run.app/api/generate-hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "question_text": String(question?.question || "Default question text"),
          "user_code": String(code),
          "language": String(language),
          "hint_level": 1
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setHint(result.hint || "No hint available from the API.");
      } else {
        
        setHint(language ||"Failed to fetch hint from the server.");
      }
    } catch (error) {
      setHint("Network error while fetching hint.");
    }

    setShowHintBox(true);
  };

  const closeHintBox = () => {
    setShowHintBox(false);
  };

  const scrollToTextarea = () => {
    const target = document.getElementById("solveissue");
    target && target.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendInput = async () => {
    try {
      const response = await fetch("https://flask-api-slzx7zzbqa-uc.a.run.app/api/answer-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "user_question": String(userInput),
          "coding_question": String(question?.question || "Default question text"),
          "user_code": String(code)
        }),
      });
      const result = await response.json();
      let plainText = "";

    // Iterate through the result.reason string and build a new string without **
    let i = 0;
    while (i < result.answer.length) {
      // Check if "**" sequence is found
      if (result.answer[i] === "*" && result.answer[i + 1] === "*") {
        i += 2; // Skip the "**" symbols
      } else {
        plainText += result.answer[i]; // Append current character
        i++;
      }
    }

    setApiResponse(plainText || "No response from analysis API.");
  } catch (error) {
    setApiResponse("Error contacting the analysis API.");
  }
  };

  if (!question) {
    navigate("/questions");
    return null;
  }

  return (
    <div className="question-detail" style={{ marginRight: showHintBox ? "20vw" : "0" }}>
      <aside className="question-info">
        <h2>{question.questionName}</h2>
        <hr />
        <div className="container">
          <p><strong>Accuracy:</strong> {(question.accuracy * 100).toFixed(2)}%</p>
          <p><strong>Difficulty:</strong> {question.difficulty}</p>
        </div>
        <p className="Para">{question.question}</p>
        <p><strong>Example:</strong></p>
        {question.example_1 && question.example_1.split('.').map((sentence, index) => (
          sentence.trim() && <p key={index}>• {sentence.trim()}</p>
        ))}
        <p><strong>Company Tags:</strong> {question.companyTags}</p>
      </aside>
      <main className="coding-space">
        <h3>Let us Code Here</h3>
        <div className="Hint">
          <div className="language-select">
            <label htmlFor="language-select">Select Language: </label>
            <select id="language-select" value={language} onChange={handleLanguageChange}>
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className="btns">
            <button onClick={showHint} className="HintBtn">Hint</button> 
            <a href="#solveissue" onClick={(e) => { e.preventDefault(); scrollToTextarea(); }} className="button-style">
              Ask Companion
            </a>
          </div>
        </div>
        <MonacoEditor
          height="60vh"
          width="70vw"
          language={language === "Python" ? "Python" : "javascript"}
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            automaticLayout: true,
          }}
        />
        <button onClick={runCode} className="run-code-button">Run Code</button>

        <div className="output">
          <h4>Output:</h4>
          <pre>{output}</pre>
        </div>

       {runApiResponse && (
  <div className="api-response-container">
    <h4>Analysis Response:</h4>
    <pre>{runApiResponse}</pre>
  </div>
)}

        <div id="solveissue" className="companion-section">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask your companion..."
            style={{ width: "100%", height: "80px", marginTop: "20px" }}
          ></textarea>
          <button onClick={handleSendInput} className="send-button">Send</button>
          {apiResponse && (
            <div className="response-box">
              <strong>Companion Response:</strong>
              <pre>{apiResponse}</pre>
            </div>
          )}
        </div>

        {showHintBox && (
          <aside className="hint-aside">
            <div className="hint-header">
              <h4>Hint</h4>
              <button onClick={closeHintBox} className="close-btn">&times;</button>
            </div>
            <p>{hint}</p>
          </aside>
        )}
      </main>
    </div>
  );
}

export default QuestionDetail;