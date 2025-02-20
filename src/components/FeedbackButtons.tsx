import React, { useState } from "react";

interface FeedbackButtonsProps {
  messageIndex: number;              // which message are we rating
  onThumbsUp?: (index: number) => void;
  onThumbsDown?: (index: number) => void;
}

export function FeedbackButtons({
  messageIndex,
  onThumbsUp,
  onThumbsDown
}: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<"none" | "up" | "down">("none");

  const handleThumbsUp = () => {
    setFeedback("up");
    if (onThumbsUp) {
      onThumbsUp(messageIndex);
    }
  };

  const handleThumbsDown = () => {
    setFeedback("down");
    if (onThumbsDown) {
      onThumbsDown(messageIndex);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
      <button
        onClick={handleThumbsDown}
        disabled={feedback === "down"}
        style={{ cursor: "pointer" }}
      >
        👎
      </button>
      <button
        onClick={handleThumbsUp}
        disabled={feedback === "up"}
        style={{ cursor: "pointer" }}
      >
        👍
      </button>
    </div>
  );
}
