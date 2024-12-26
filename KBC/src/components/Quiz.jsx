import { useEffect, useState } from "react";
import socket from "../socket"; // Import socket instance
import axios from "axios"; // Import axios for API requests

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [sessionId, setsession] = useState(0);

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Listen for real-time updates
    socket.on("currentQuestionUpdated", (question, sessionId) => {
      setCurrentQuestion(question);
      setsession(sessionId);
      setSelectedOption(null); // Reset selected option when a new question arrives
      setSubmissionMessage(""); // Clear submission message
    });

    return () => socket.off("currentQuestionUpdated");
  }, []);

  const handleOptionClick = (id) => {
    console.log("Option clicked:", id); // Debugging log
    setSelectedOption(id);
    // if (submitted) return; // Disable clicks after submission
    setSubmitted(true); // Mark as submitted
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      setSubmissionMessage("Please select an answer before submitting.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateQuestion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Set the content type to JSON
          },
          body: JSON.stringify({
            question_id: currentQuestion._id,
            selected_option: selectedOption,
            sessionId: sessionId,
          }),
        }
      );
      const response = await res.json(); // Parse the response JSON

      if (response.success) {
        if (response.message === "Quiz finished.") {
          alert(response.message);
        }
        setSelectedOption(response.sessionId);
        setCurrentQuestion(null);
        setsession(null);
        setSelectedOption(null); // Reset selected option when a new question arrives
        setSubmitted(false); // Mark as submitted
        if (response.message === "Quiz finished.") {
          setSubmissionMessage(
            `Quiz Finished Your Score is ${response.score} `
          );
        }
        try {
          const res = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/getQuestions`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json", // Set the content type to JSON
              },
              body: JSON.stringify({
                question_id: response.question_id,
              }),
            }
          );
          const res1 = await res.json(); // Parse the response JSON

          if (res1.success) {
            setCurrentQuestion(res1.question);
            setsession(response.sessionId);
            setSelectedOption(null); // Reset selected option when a new question arrives
          }
        } catch (error) {
          setSubmissionMessage("Failed to get question. Please try again.");
          console.error(error);
        }
        // Handle socket event to update the current question and session
      }
      setSubmissionMessage("Your answer has been submitted successfully.");
    } catch (error) {
      setSubmissionMessage("Failed to submit your answer. Please try again.");
      console.error(error);
    }
  };

  if (!currentQuestion)
    return (
      <div className="text-3xl underline text-center py-10">
        <h1>Waiting for the next question...</h1>
      </div>
    );

  return (
    <div>
      <div className="text-3xl underline text-center py-10">
        Multiple Choice Questions
      </div>
      <div className="absolute bottom-[80px] w-[100%] ">
        <div>
          <div className="bg-blue-500 text-white mx-24 mt-28 mb-5 text-center py-5 text-3xl">
            {currentQuestion.question}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 mx-24">
          {currentQuestion.options.map((option, idx) => {
            return (
              <div
                key={idx}
                className={`py-5 px-3 cursor-pointer text-lg text-white ${
                  submitted
                    ? option.isCorrect === "true"
                      ? "bg-green-500" // Green if correct
                      : "bg-red-500" // Red if incorrect
                    : "bg-gray-300" // Default light color before submit
                }`}
                onClick={() => handleOptionClick(option.isCorrect)}
              >
                {option.text}
              </div>
            );
          })}
        </div>
        <div className="mx-24 mt-5">
          <button
            className="bg-blue-500 text-white py-2 px-4 text-lg cursor-pointer"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <div className="text-3xl underline text-center py-10">
            {submissionMessage && (
              <p className="mt-3 text-center text-lg text-blue-900">
                {submissionMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
