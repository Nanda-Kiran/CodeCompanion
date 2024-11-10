import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import "./CodeEditorPage.css";

function CodeEditorPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("// Write your code here...");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("python");

  const goBack = () => {
    navigate("/dashboard");
  };

  // Load Pyodide for Python execution
  useEffect(() => {
    const loadPyodide = async () => {
      if (!window.pyodide) {
        window.pyodide = await window.loadPyodide();
      }
    };
    if (language === "python") {
      loadPyodide();
    }
  }, [language]);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    setCode(event.target.value === "python" ? "# Write your Python code here..." : "// Write your JavaScript code here...");
    setOutput(""); // Clear output when language changes
  };

  const runCode = async () => {
    if (language === "javascript") {
      try {
        // Use Function constructor for safer evaluation
        const result = new Function(code)();
        setOutput(result !== undefined ? String(result) : "No output");
      } catch (error) {
        setOutput("Error: " + error.message);
      }
    } else if (language === "python") {
      try {
        const pyodide = window.pyodide;
        if (!pyodide) {
          setOutput("Python environment is still loading. Please wait...");
          return;
        }

        // Redirect stdout to capture print statements
        pyodide.runPython(`
          import sys
          from io import StringIO
          sys.stdout = output = StringIO()
        `);

        // Execute the Python code
        pyodide.runPython(code);

        // Capture the output from stdout
        const result = pyodide.runPython("output.getvalue()");
        setOutput(result || "No output");

        // Reset stdout
        pyodide.runPython("sys.stdout = sys.__stdout__");
      } catch (error) {
        setOutput("Error: " + error.message);
      }
    }
  };

  return (
    <div className="code-editor-page">
      <header className="editor-header">
        
        <h2>Interactive Code Editor</h2>
        <button onClick={goBack} className="back-button">Back to Dashboard</button>
      </header>
      
      <div className="editor-header">
        <div className="cont">
        <label htmlFor="language-select">Select Language: </label>
        <select id="language-select" value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        </div>
        <button onClick={runCode} className="back-button">Run Code</button>
      </div>

      <MonacoEditor
        height="50vh"
        width="90vw"
        
        language={language === "python" ? "python" : "javascript"}
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />

      <div className="output-section">
        <h4>Output:</h4>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default CodeEditorPage;