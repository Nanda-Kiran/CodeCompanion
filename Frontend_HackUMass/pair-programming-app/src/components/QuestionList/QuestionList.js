import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./QuestionList.css";

function QuestionList() {
  const navigate = useNavigate();

  const initialProblems = [
    // Additional initial problems here...
  ];

  const [questions, setQuestions] = useState(initialProblems); // All questions
  const [displayedQuestions, setDisplayedQuestions] = useState(initialProblems); // Filtered questions
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  // Fetch and filter questions together
  useEffect(() => {
    const fetchAndFilterQuestions = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/questions", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          
        });

        if (!response.ok) throw new Error("Failed to fetch questions");

        const data = await response.json();
        const allQuestions = [...initialProblems, ...data];

        // Apply filtering criteria directly after fetching
        const filtered = allQuestions.filter((question) => {
          const matchesDifficulty =
            selectedDifficulty === "All" || question.difficulty === selectedDifficulty;
          const matchesSearch = question.questionName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
          return matchesDifficulty && matchesSearch;
        });

        setQuestions(allQuestions); // Save all questions to state
        setDisplayedQuestions(filtered); // Save filtered questions to display
      } catch (error) {
        setMessage("Failed to fetch questions: " + error.message);
      }
    };

    fetchAndFilterQuestions();
  }, [selectedDifficulty, searchTerm]); // Re-run whenever filters change

  const handleQuestionClick = (question) => {
    navigate(`/questions/${question.id}`, { state: { question } });
  };

  const handleDifficultyChange = (event) => {
    setSelectedDifficulty(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="question-list">
      <h2 style={{ color: "#00D1B2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Coding Questions
        <div className="sort-dropdown">
          <label style={{ fontSize: "25px" }} htmlFor="difficulty-select">Sort: </label>
          <select
            id="difficulty-select"
            value={selectedDifficulty}
            onChange={handleDifficultyChange}
          >
            <option value="All">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </h2>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search questions..."
        value={searchTerm}
        onChange={handleSearchChange}
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "16px",
          marginBottom: "20px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />

      {/* Display message if there is an error */}
      {message && <p>{message}</p>}

      <ul>
        {displayedQuestions.map((question) => (
          <li key={question.id} onClick={() => handleQuestionClick(question)}>
            <div className="question">
              <h3>{question.questionName}</h3>
              <div className="difficont">
                <p><strong>Difficulty:</strong> {question.difficulty}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default QuestionList;