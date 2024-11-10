import React, { useEffect, useState } from "react";

function TypingText({ text, delay = 100, style }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [index, text, delay]);

  return (
    <div
      style={{
        ...style,
        display: "inline-block",
        padding: "10px 15px",
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        transition: "width 0.2s ease, padding 0.2s ease",
        backgroundColor: "#fff",
        whiteSpace: "nowrap", // Keeps the text in a single line
      }}
    >
      <span>{displayedText}</span>
    </div>
  );
}

export default TypingText;
