import React from "react";
import { useNavigate } from "react-router-dom";
import TypingText from "./TypingText.jsx";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const goToQuestionsList = () => {
    navigate("/questions");
  };

  const openCodeEditor = () => {
    navigate("/code-editor");
  };

  return (
    <div
      className="dashboard-container"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + "/images/im3.png.webp"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding:"30px"
      }}
    >
      <header className="dashboard-header">
        <h1 className="heading" style={{ fontFamily: "Roboto Slab, serif", fontWeight: "bold", fontSize: "45px" }}>
          Code Companion
        </h1>
        <TypingText
          style={{
            fontFamily: "Roboto Slab, serif",
            fontWeight: "bolder",
            fontSize: "20px",
            backgroundColor: "#fff",
            width: "fit-content",
            borderWidth: "1px",
            padding: "10px",
            borderRadius: "8px",
          }}
          text="Welcome! This is your interactive programming workspace."
          delay={100}
        />
        <div className="btn" style={{display:"flex",justifyContent: "center",
    alignItems: "center"}}>
        <button onClick={goToQuestionsList} className="open-editor-button">
          Solve Questions
        </button>
        <button onClick={openCodeEditor} className="open-editor-button">
          Open Code Editor
        </button>
        </div>
      </header>
    </div>
  );
}

export default Dashboard;
