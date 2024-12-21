import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddQuestion = () => {
  const [questionData, setQuestionData] = useState({
    question: "",
    options: ["", "", "", ""], // Start with four empty options
    correctAnswer: "",
    video: null,
    videoType: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = value;
    setQuestionData((prev) => ({ ...prev, options: updatedOptions }));
  };

  const addOption = () => {
    setQuestionData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  // const removeOption = (index) => {
  //   const updatedOptions = questionData.options.filter((_, i) => i !== index);
  //   setQuestionData((prev) => ({ ...prev, options: updatedOptions }));
  // };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size < 10 * 1024 * 1024) {
      setQuestionData((prev) => ({ ...prev, video: file }));
    } else {
      toast.error("Video file size must be less than 10MB.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("correct answer:", questionData.correctAnswer);
    if (
      !questionData.question ||
      questionData.options.includes("") ||
      !questionData.correctAnswer
    ) {
      setError("Please fill all fields and ensure options are valid.");
      return;
    }

    // Check if all options are filled
    //added
    if (questionData.options.some((option) => option.trim() === "")) {
      setError("All options must be filled.");
      return;
    }

    // Check if video type is selected
    //added
    if (!questionData.videoType) {
      setError("Video type is required.");
      return;
    }

    setError("");
    setLoading(true);
    const formattedOptions = questionData.options.map((optionText) => ({
      text: optionText,
      isCorrect: false, // Set this to true for the correct answer
    }));

    // If correctAnswer is a string (e.g., "A", "B", "C", "D"), find the index
    const correctAnswerIndex = formattedOptions.findIndex(
      (option) => option.text === questionData.correctAnswer
    );

    // If correctAnswerIndex is invalid, show an error and return
    // if (correctAnswerIndex === -1) {
    //   setError("Invalid correct answer selection");
    //   return;
    // }
    // Add logic to mark the correct answer (based on your application logic)
    // For example, you could mark the correct answer based on the 'correctAnswer' index:
    // formattedOptions[questionData.correctAnswer].isCorrect = true;

    // Check if all fields are filled
    if (
      !questionData.question ||
      formattedOptions.some(
        (option) => !option.text || option.isCorrect === undefined
      ) ||
      !questionData.correctAnswer
    ) {
      setError("Please fill all fields and ensure options are valid.");
      return;
    }

    //added
    // Update options
    console.log("Options Before:", formattedOptions);
    for (let i = 0; i < formattedOptions.length; i++) {
      if (
        (questionData.correctAnswer === "A" && i === 0) ||
        (questionData.correctAnswer === "B" && i === 1) ||
        (questionData.correctAnswer === "C" && i === 2) ||
        (questionData.correctAnswer === "D" && i === 3)
      ) {
        formattedOptions[i].isCorrect = true;
      }
    }
    console.log("Options After:", formattedOptions);

    const formData = new FormData();
    formData.append("question", questionData.question);
    formData.append("option", JSON.stringify(formattedOptions));
    formData.append("correctAnswer", questionData.correctAnswer);
    formData.append("videoType", questionData.videoType);

    if (questionData.video) {
      formData.append("video", questionData.video);
    }
    console.log(`${import.meta.env.VITE_BACKEND_URL}/api/insertQuestion`);
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
                  value={questionData.question}
                  onChange={handleInputChange}
                  type="text"
                  id="question"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  placeholder="Enter question"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Options
                </label>
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      className="flex-1 bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      required
                    />
                    {/* 
                    {questionData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="ml-2 text-red-600"
                      >
                        Remove
                      </button>
                    )}*/}
                  </div>
                ))}
                {/* <button
                  type="button"
                  onClick={addOption}
                  className="text-blue-600 text-sm mt-2"
                >
                  Add Option
                </button> */}
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
                  value={questionData.correctAnswer}
                  onChange={handleInputChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  required
                >
                  <option value="">Select Correct Answer</option>
                  {questionData.options.map((_, index) => (
                    <option key={index} value={String.fromCharCode(65 + index)}>
                      {String.fromCharCode(65 + index)}
                    </option>
                  ))}
                </select>
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
                  accept="video/*"
                  onChange={handleFileChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                />
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
                  value={questionData.videoType}
                  onChange={handleInputChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  required
                >
                  <option value="">Select video Type</option>
                  <option value="Intro video">Intro video</option>
                  <option value="Question related video">
                    question related video
                  </option>
                </select>
              </div>
            </div>
            {error && <p className="text-red-900 text-[17px] mb-5">{error}</p>}
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
