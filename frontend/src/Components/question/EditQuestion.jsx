import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import { useNavigate, useParams } from "react-router-dom";

const UpdateQuestion = () => {
  const [questionData, setQuestionData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    video: null,
    videoType: "",
  });
  const [optionErrors, setOptionErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  //console.log(id);

  useEffect(() => {
    // Fetch the existing question data
    const fetchQuestionData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/singleQuestion/${id}`
        );
        const data = await response.json();
        //console.log("question data", data.question);
        if (data.success) {
          setQuestionData({
            question: data.question.question,
            options: data.question.options.map((opt) => opt.text),
            correctAnswer: ["A", "B", "C", "D"][
              data.question.options.findIndex((opt) => opt.isCorrect)
            ],
            video: null, // Videos are not preloaded, only allow new uploads
            videoType: data.question.videoType,
          });
        } else {
          toast.error(data.message || "Failed to load question data.");
        }
      } catch (err) {
        toast.error("Error loading question data.");
      }
    };

    fetchQuestionData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({ ...prev, [name]: value }));
    $(`#${name}`).removeClass("border-red-500").addClass("border-gray-300");
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index] = value;
    setQuestionData((prev) => ({ ...prev, options: updatedOptions }));
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
    $(".error-message").text("");

    if (!questionData.question.trim()) {
      $(".question-error").text("Please enter a question.");
      $("#question").removeClass("border-gray-300").addClass("border-red-500");
      valid = false;
    }

    if (!questionData.correctAnswer) {
      $(".correct-answer-error").text("Please select the correct answer.");
      $("#correctAnswer")
        .removeClass("border-gray-300")
        .addClass("border-red-500");
      valid = false;
    }

    const updatedErrors = questionData.options.map((option, index) => {
      if (!option.trim()) {
        $(`#option-${index}`)
          .removeClass("border-gray-300")
          .addClass("border-red-500");
        valid = false;
        return `Option ${index + 1} cannot be empty.`;
      }
      return "";
    });

    setOptionErrors(updatedErrors);

    if (!questionData.videoType) {
      $(".video-type-error").text("Please select a video type.");
      $("#videoType").removeClass("border-gray-300").addClass("border-red-500");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateQuestionForm()) return;

    setLoading(true);

    const formattedOptions = questionData.options.map((optionText) => ({
      text: optionText,
      isCorrect: false,
    }));

    const correctAnswerIndex = ["A", "B", "C", "D"].indexOf(
      questionData.correctAnswer
    );
    if (correctAnswerIndex !== -1) {
      formattedOptions[correctAnswerIndex].isCorrect = true;
    }

    const formData = new FormData();
    console.log(id);
    formData.append("id", id); // Include the question ID
    formData.append("question", questionData.question);
    formData.append("option", JSON.stringify(formattedOptions));
    formData.append("correctAnswer", questionData.correctAnswer);
    formData.append("videoType", questionData.videoType);

    if (questionData.video) {
      formData.append("video", questionData.video);
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateQuestions/${id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("Question updated successfully!");
        // Add a delay before navigating
        setTimeout(() => {
          navigate("/question");
        }, 2000); // 2 seconds delay
      } else {
        toast.error(result.message || "Failed to update question.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("An error occurred while updating the question.");
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
        <div className="text-2xl font-bold mx-2 my-8 px-4">Update Question</div>
      </div>
      {loading ? (
        <div className="absolute w-[80%] h-[40%] flex justify-center items-center">
          <div className="animate-spin h-8 w-8 border-4 border-current border-e-transparent text-surface rounded-full"></div>
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
                  Video Type<span className="text-red-900 text-lg">*</span>
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
            </div>
            <button
              type="submit"
              className="text-white bg-[#16144b] hover:bg-[#16144bea] focus:ring-4 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            >
              Edit Question
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default UpdateQuestion;
