import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import { useNavigate, useParams } from "react-router-dom";

const AddQuestion = () => {
  const [questionData, setQuestionData] = useState({
    question: "",
    options: ["", "", "", ""], // Start with four empty options
    correctAnswer: "",
    video: null,
    videoType: "",
  });
  const [optionErrors, setOptionErrors] = useState([]); // Array for option-specific errors
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({ ...prev, [name]: value }));

    // Remove error border on input change
    $(`#${name}`).removeClass("border-red-500").addClass("border-gray-300");
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = value;
    setQuestionData((prev) => ({ ...prev, options: updatedOptions }));

    // Clear error for the current option
    const updatedErrors = [...optionErrors];
    updatedErrors[index] = "";
    setOptionErrors(updatedErrors);

    $(`#option-${index}`)
      .removeClass("border-red-500")
      .addClass("border-gray-300");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 10 * 1024 * 1024) {
      setQuestionData((prev) => ({ ...prev, video: file }));
      $("#video").removeClass("border-red-500").addClass("border-gray-300");
    } else {
      toast.error("Video file size must be less than 10MB.");
    }
  };

  const validateQuestionForm = () => {
    let valid = true;
    $(".error-message").text(""); // Clear previous error messages

    // Validate question
    if (!questionData.question.trim()) {
      $(".question-error").text("Please enter a question.");
      $("#question").removeClass("border-gray-300").addClass("border-red-500");
      valid = false;
    } else {
      $("#question").removeClass("border-red-500").addClass("border-green-500");
    }

    // Validate correct answer
    if (!questionData.correctAnswer) {
      $(".correct-answer-error").text("Please select the correct answer.");
      $("#correctAnswer")
        .removeClass("border-gray-300")
        .addClass("border-red-500");
      valid = false;
    } else {
      $("#correctAnswer")
        .removeClass("border-red-500")
        .addClass("border-green-500");
    }

    // Validate options
    const updatedErrors = [];
    questionData.options.forEach((option, index) => {
      if (!option.trim()) {
        $(`#option-${index}`)
          .removeClass("border-gray-300")
          .addClass("border-red-500");
        updatedErrors[index] = `Option ${index + 1} cannot be empty.`;
        valid = false;
      } else {
        $(`#option-${index}`)
          .removeClass("border-red-500")
          .addClass("border-green-500");
        updatedErrors[index] = "";
      }
    });
    setOptionErrors(updatedErrors);

    // Validate video type
    // if (!questionData.videoType) {
    //   $(".video-type-error").text("Please select a video type.");
    //   $("#videoType").removeClass("border-gray-300").addClass("border-red-500");
    //   valid = false;
    // } else {
    //   $("#videoType")
    //     .removeClass("border-red-500")
    //     .addClass("border-green-500");
    // }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateQuestionForm()) return;

    setLoading(true);

    const formattedOptions = questionData.options.map((optionText) => ({
      text: optionText,
      isCorrect: false, // Set this to true for the correct answer
    }));

    // Mark the correct answer
    const correctAnswerIndex = ["A", "B", "C", "D"].indexOf(
      questionData.correctAnswer
    );
    if (correctAnswerIndex !== -1) {
      formattedOptions[correctAnswerIndex].isCorrect = true;
    }

    const formData = new FormData();
    formData.append("question", questionData.question);
    formData.append("option", JSON.stringify(formattedOptions));
    formData.append("correctAnswer", questionData.correctAnswer);
    formData.append("videoType", questionData.videoType);
    formData.append("timer", questionData.timer);

    if (questionData.video) {
      formData.append("video", questionData.video);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/insertQuestion`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Question added successfully!");
        setTimeout(() => {
          navigate("/question");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to add question.");
      }
    } catch (err) {
      toast.error("An error occurred while adding the question.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center">
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <div className="text-2xl font-bold mx-2 my-8 px-4">Add Question</div>
      </div>
      {loading ? (
        <div className="absolute w-[80%] h-[40%] flex justify-center items-center">
          <div className="flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]">
            <span className="absolute inset-0 w-full h-full"></span>
          </div>
        </div>
      ) : (
        <div className="w-[70%] m-auto my-10">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
                <label
                  htmlFor="question"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Question<span className="text-red-900 text-lg">*</span>
                </label>
                <input
                  name="question"
                  id="question"
                  value={questionData.question}
                  onChange={handleInputChange}
                  type="text"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  placeholder="Enter question"
                />
                <p className="error-message question-error text-red-600 text-sm"></p>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Options<span className="text-red-900 text-lg">*</span>
                </label>
                {questionData.options.map((option, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      id={`option-${index}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="flex-1 bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 w-full"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    />
                    {optionErrors[index] && (
                      <p className="text-red-600 text-sm mt-1">
                        {optionErrors[index]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label
                  htmlFor="correctAnswer"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Correct Answer<span className="text-red-900 text-lg">*</span>
                </label>
                <select
                  name="correctAnswer"
                  id="correctAnswer"
                  value={questionData.correctAnswer}
                  onChange={handleInputChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                >
                  <option value="">Select Correct Answer</option>
                  {questionData.options.map((_, index) => (
                    <option key={index} value={String.fromCharCode(65 + index)}>
                      {String.fromCharCode(65 + index)}
                    </option>
                  ))}
                </select>
                <p className="error-message correct-answer-error text-red-600 text-sm"></p>
              </div>
              <div>
                <label
                  htmlFor="video"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Upload Video
                </label>
                <input
                  type="file"
                  id="video"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                />
                <p className="error-message video-error text-red-600 text-sm"></p>
              </div>
              <div>
                <label
                  htmlFor="videoType"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Video Type
                </label>
                <select
                  name="videoType"
                  id="videoType"
                  value={questionData.videoType}
                  onChange={handleInputChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                >
                  <option value="">Select video Type</option>
                  <option value="Intro video">Intro video</option>
                  <option value="Question related video">
                    Question related video
                  </option>
                </select>
                <p className="error-message video-type-error text-red-600 text-sm"></p>
              </div>
              <div>
                <label
                  htmlFor="timer"
                  className="block mb-2 text-sm font-medium"
                >
                  Timer
                </label>
                <select
                  name="timer"
                  id="timer"
                  value={questionData.timer}
                  onChange={handleInputChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                >
                  <option value="">Select Timer</option>
                  <option value="30">30 Seconds</option>
                  <option value="60">60 Seconds</option>
                  <option value="90">90 Seconds</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="text-white bg-[#16144b] hover:bg-[#16144bea] focus:ring-4 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            >
              Add Question
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AddQuestion;
