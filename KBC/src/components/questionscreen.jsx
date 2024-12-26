import { useEffect, useState } from "react";
import socket from "../socket"; // Import socket instance
import axios from "axios"; // Import axios for API requests

const QuestionScreen = () => {
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

  const handleOptionClick = async (id, isCorrect) => {
    // Debugging log
    setSelectedOption(id);
    setSubmitted(true); // Mark as submitted
    const correctBackground =
      isCorrect === "true" ? "ansBig_Base.png" : "incorrectAns_Base.png";
    const incorrectBackground =
      isCorrect === "true" ? "" : "incorrectAns_Base.png";

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
            selected_option: id, // Corrected to use 'id' instead of 'optionId'
            sessionId: sessionId,
          }),
        }
      );
      const response = await res.json(); // Parse the response JSON

      if (response.success) {
        //setSubmissionMessage("Your answer has been submitted successfully.");
        setTimeout(() => {
          fetchNextQuestion(response);
        }, 5000); // Fetch next question after 5 seconds delay
      }
    } catch (error) {
      setSubmissionMessage("Failed to submit your answer. Please try again.");
      console.error(error);
    }
  };

  const fetchNextQuestion = async (response) => {
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
      const nextQuestionResponse = await res.json();

      if (nextQuestionResponse.success) {
        setCurrentQuestion(nextQuestionResponse.question);
        setsession(response.sessionId); // Keep the session ID
        setSelectedOption(null); // Reset selected option
        setSubmitted(false); // Reset submitted state
        // Reset the background images if necessary
      }
    } catch (error) {
      setSubmissionMessage("Failed to get next question. Please try again.");
      console.error(error);
    }
  };

  // const handleSubmit = async () => {
  //   if (!selectedOption) {
  //     setSubmissionMessage("Please select an answer before submitting.");
  //     return;
  //   }

  //   try {
  //     const res = await fetch(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/updateQuestion`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json", // Set the content type to JSON
  //         },
  //         body: JSON.stringify({
  //           question_id: currentQuestion._id,
  //           selected_option: selectedOption,
  //           sessionId: sessionId,
  //         }),
  //       }
  //     );
  //     const response = await res.json(); // Parse the response JSON

  //     if (response.success) {
  //       if (response.message === "Quiz finished.") {
  //         alert(response.message);
  //       }
  //       setSelectedOption(response.sessionId);
  //       setCurrentQuestion(null);
  //       setsession(null);
  //       setSelectedOption(null); // Reset selected option when a new question arrives
  //       setSubmitted(false); // Mark as submitted
  //       if (response.message === "Quiz finished.") {
  //         setSubmissionMessage(
  //           `Quiz Finished Your Score is ${response.score} `
  //         );
  //       }
  //       try {
  //         const res = await fetch(
  //           `${import.meta.env.VITE_BACKEND_URL}/api/getQuestions`,
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json", // Set the content type to JSON
  //             },
  //             body: JSON.stringify({
  //               question_id: response.question_id,
  //             }),
  //           }
  //         );
  //         const res1 = await res.json(); // Parse the response JSON

  //         if (res1.success) {
  //           setCurrentQuestion(res1.question);
  //           setsession(response.sessionId);
  //           setSelectedOption(null); // Reset selected option when a new question arrives
  //         }
  //       } catch (error) {
  //         setSubmissionMessage("Failed to get question. Please try again.");
  //         console.error(error);
  //       }
  //       // Handle socket event to update the current question and session
  //     }
  //     setSubmissionMessage("Your answer has been submitted successfully.");
  //   } catch (error) {
  //     setSubmissionMessage("Failed to submit your answer. Please try again.");
  //     console.error(error);
  //   }
  // };

  if (!currentQuestion)
    return (
      <div className="text-3xl underline text-center py-10">
        {/* <h1>Waiting for the next question... okk</h1> */}
        <img src="/KBC/Big_Screen.png" alt="Image description" />
      </div>
    );

  return (
    <div
      className="bg-cover bg-center w-full min-h-screen flex flex-col items-center justify-center" // Ensure the div takes full height and width
      style={{ backgroundImage: "url('/KBC/QuizGame_BG.jpg')" }}
    >
      <div className="text-3xl underline text-center py-10">
        <img
          src="/KBC/small_Screen.png"
          style={{
            height: "405px",
            objectFit: "cover", // This ensures the image covers the element without stretching
            objectPosition: "center center", // Centers the image within the element
            marginBottom: "60px", // Add space below the first image to separate it from the timer
    
          }}
          alt="Image description"
        />
      </div>
      <div className="w-full relative">
      <div
      className="absolute top-0 left-1/2 transform -translate-x-1/2"
      style={{
        width: "174px", // Adjust the size of the timer
        height: "86px", // Half-circle height
        backgroundImage: "url('/KBC/timer_Base.png')", // Your half-circle timer image
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "absolute",
        Index: "10", // Ensure it appears above other content
        top:"-86px",

      }}
    ></div>
      <img
      src="/KBC/Metallic_Line.png"
      alt="Metallic Line"
      className=" left-0 right-0 top-1/2 transform -translate-y-1/2"
      style={{
           "height": "auto",
    "z-index": "0",
     "position": "absolute",
    /* left: 21px; */
    "top": "35px", // Ensures the metallic line is above the background image
      }}
    />
        <div
          className="text-white mx-24  mb-5 text-center py-5 text-3xl relative"
          style={{
            backgroundImage: "url('/KBC/questionBig_Base.png')", // Set your background image here
            backgroundSize: "cover", // Ensures the image covers the div
            backgroundPosition: "center center", // Centers the background image
            backgroundRepeat: "no-repeat", // Prevents the image from repeating
          }}
        >
          {currentQuestion.question}
         
        </div>

        <div className="grid grid-cols-2 gap-5 mx-24">
          {currentQuestion.options.map((option, idx) => {
            return (
              <div
                key={idx}
                className={`py-5 px-3  cursor-pointer text-lg text-white ${
                  submitted
                
                }`}
                style={{
                  backgroundImage: `url('/KBC/${
                    submitted
                      ? option.isCorrect === "true"
                        ? "CorrectAns_Base.png"
                        : "incorrectAns_Base.png"
                      : "ansBig_Base.png"
                  }')`,
                  backgroundSize: "cover", // Ensures the image covers the div
                  backgroundPosition: "center center", // Centers the background image
                  backgroundRepeat: "no-repeat", // Prevents repeating the background image
                  //marginLeft: "50px"
                }}
                onClick={() => handleOptionClick(option.isCorrect)}
              >
                <div className="ml-12">
                  {" "}
                  {/* This div adds left margin to shift the text to the right */}
                  {option.text}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mx-24 mt-5">
          {/* <button
        className="bg-blue-500 text-white py-2 px-4 text-lg cursor-pointer"
        onClick={handleSubmit}
      >
        Submit
      </button> */}
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

export default QuestionScreen;
