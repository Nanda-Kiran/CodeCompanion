import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import QuestionList from "./components/QuestionList/QuestionList";
import QuestionDetail from "./components/QuestionDetail/QuestionDetail";
import CodeEditorPage from "./components/CodeEditorPage/CodeEditorPage"; // Adjust path if necessary

// Add this to the top of your main entry file (e.g., index.js or App.js)
const resizeObserverError = (e) => {
  if (e.message === "ResizeObserver loop completed with undelivered notifications.") {
    e.stopImmediatePropagation();
  }
};
window.addEventListener("error", resizeObserverError);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/code-editor" element={<CodeEditorPage />} />
        <Route path="/questions" element={<QuestionList />} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
