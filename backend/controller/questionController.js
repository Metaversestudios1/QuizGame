const Question = require("../model/questionTable");
const User = require("../model/User");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const path = require("path");

const uploadImage = (buffer, originalname, mimetype) => {
  return new Promise((resolve, reject) => {
    if (!mimetype || typeof mimetype !== "string") {
      return reject(new Error("MIME type is required and must be a string"));
    }

    let resourceType = "raw"; // Default to 'raw' for non-image/video files

    if (mimetype.startsWith("image")) {
      resourceType = "image";
    } else if (mimetype.startsWith("video")) {
      resourceType = "video";
    } else if (mimetype === "application/pdf") {
      resourceType = "raw"; // Explicitly set PDFs as raw
    }
    const fileExtension = path.extname(originalname);
    const fileNameWithoutExtension = path.basename(originalname, fileExtension);
    const publicId = `${fileNameWithoutExtension}${fileExtension}`; // Include extension in public_id

    const options = {
      resource_type: resourceType,
      public_id: publicId, // Set the public_id with extension
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    const uploadStream = cloudinary.uploader.upload(
      `data:${mimetype};base64,${buffer.toString("base64")}`,
      options,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(new Error("Cloudinary upload failed"));
        }
        console.log("Cloudinary upload result:", result);
        resolve(result);
      }
    );

    // uploadStream.end(buffer); // Upload the file from the buffer
  });
};
const insertQuestion = async (req, res) => {
  try {
    let { question, option, correctAnswer, videoUrl, videoType } = req.body;
    // Check the type of 'options'
    console.log("Insert Question Data:", req.body);

    if (typeof option == "string") {
      option = JSON.parse(option); // Convert string to an array
      console.log(option);
    }

    // Validate that required fields are present
    if (!question || !option || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate that options are in correct format
    if (!Array.isArray(option) || option.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Options should be a non-empty array",
      });
    }

    // Ensure that each option has the required structure (text, isCorrect)
    // for (const options of option) {
    //   if (!options.text || typeof options.isCorrect !== "boolean") {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Each option must have text and isCorrect fields",
    //     });
    //   }
    //   // if (options.text === correctAnswer) {
    //   //   //change
    //   //   options.isCorrect = true;
    //   // }

    // Update options
    //console.log("Options Before:", option);
    for (let i = 0; i < option.length; i++) {
      option[i].isCorrect = false; // Reset all to false

      if (
        (correctAnswer === "A" && i === 0) ||
        (correctAnswer === "B" && i === 1) ||
        (correctAnswer === "C" && i === 2) ||
        (correctAnswer === "D" && i === 3)
      ) {
        option[i].isCorrect = true;
      }
    }
    //console.log("Options After:", option);

    let videoData = null;
    if (req.file) {
      const { originalname, buffer, mimetype } = req.file;
      if (!mimetype || typeof mimetype !== "string") {
        console.error("Invalid MIME type:", mimetype);
        return res
          .status(400)
          .json({ success: false, message: "Invalid MIME type" });
      }

      const uploadResult = await uploadImage(buffer, originalname, mimetype);
      if (!uploadResult) {
        return res
          .status(500)
          .json({ success: false, message: "File upload error" });
      }
      videoData = {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
        originalname,
        mimetype,
      };
    }

    const newQuestion = new Question({
      question,
      options: option,
      correctAnswer: correctAnswer, // Store as a number
      videoUrl: videoData,
      videoType: videoType,
      // videoUrl can be optional
    });

    // Save the new question to the database
    const result = await newQuestion.save();
    if (result) {
      res.status(201).json({
        success: true,
        message: "Question created successfully",
        data: result,
      });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Failed to create question" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error inserting question data" });
  }
};

const updateQuestion = async (req, res) => {
  const { sessionId, question_id, selected_option } = req.body;
  
  // Fetch the user from the database based on sessionId
  const user = await User.findOne({ sessionId });
  
  if (!user) {
    return res.status(404).json({ message: 'Session not found.' });
  }

  // Find the current question from the database
  const question = await Question.findById(question_id);
  if (!question) {
    return res.status(404).json({ message: 'Question not found.' });
  }

  // Check if the selected option is correct
  const isCorrect = selected_option === 'true' ? true : false;

  // Ensure answeredQuestions is initialized (if not already)
  if (!user.answeredQuestions) {
    user.answeredQuestions = [];
  }

  // Update the user's answered questions and score
  user.answeredQuestions.push({
    questionId: question_id,
    selectedOption: selected_option,
    isCorrect,
  });

  if (isCorrect) {
    user.score += 1; // Increase score if the answer is correct
  }

  user.currentQuestionIndex += 1; // Move to the next question
console.log('user.totalQuestions',user.totalQuestions)
  // Check if all questions are answered
  if (user.currentQuestionIndex >= user.totalQuestions) {
    // End the quiz and send the results
    const endTime = Date.now();
    const duration = (endTime - user.startTime) / 1000; // Duration in seconds

    // Optionally save the result in the database (e.g., UserResults model)

    // Clear the user's session data after the quiz ends
    await User.deleteOne({ sessionId }); // Delete user session from the database
    res.status(200).json({
      success: true,
      message: 'Quiz finished.',
      score: user.score,
      duration,
    });
   
  }

  await user.save(); // Delete user session from the database
    // Send the response back with next question and current score
  
  res.status(200).json({
    success: true,
    message: 'Answer submitted.',
    question_id,
    sessionId,
    score: user.score,
  });


};

const getQuestions = async (req, res) => {
  try {
    const { question_id } = req.body;

    // Find the current question
    const currentQuestion = await Question.findById(question_id);
    if (!currentQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "Question Not Found" });
    }

    // Find the next question based on a sorting field (e.g., _id)
    let nextQuestion = await Question.findOne({ _id: { $gt: question_id } })
      .sort({ _id: 1 }) // Sort by _id in ascending order
      .exec();

    if (!nextQuestion) {
      // If no next question is found, fetch the first question
      nextQuestion = await Question.findOne().sort({ _id: 1 }).exec();
    }

    if (!nextQuestion) {
      return res
        .status(404)
        .json({ success: false, message: "No Questions Found" });
    }

    // Update the question with currentQuestion = 1
    const updatedQuestion = await Question.findByIdAndUpdate(
      nextQuestion._id,
      { currentQuestion: 1 },
      { new: true }
    );

    res.status(200).json({ success: true, question: updatedQuestion });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error Getting Next Question Data" });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    console.log(req.body);
    const id = req.params.id;
    const result = await Question.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Question record not found" });
    }
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error Deleting Question Data" });
  }
};

// const StartQuestion = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const currentQuestion = 1;

//     const question = await Question.findByIdAndUpdate(
//       id,
//       { currentQuestion },
//       { new: true }
//     );

//     if (!question) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Question not found." });
//     }

//     res
//       .status(200)
//       .json({ success: true, message: "Question status updated.", question });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server error." });
//   }
// };


let userSessions = {};

// Function to generate a unique session ID (this could be a random string or token)
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 15); // Simple random string generator
};
const StartQuestion = async (req, res) => {
 const { id } = req.params;
  const io = req.app.get("socketio");

  try {
    // Reset previous currentQuestion
    await Question.updateMany({ currentQuestion: 1 }, { currentQuestion: 0 });

    // Set the new currentQuestion
    const question = await Question.findByIdAndUpdate(
      id,
      { currentQuestion: 1 },
      { new: true }
    );

    if (question) {

      const sessionId = generateSessionId();

  // Fetch 5-10 random questions from the Question model
  const randomQuestions = await Question.aggregate([{ $sample: { size: 10 } }]);

  // Create a session for the user
  const newUser = new User({
    sessionId,
    score: 0,
    answeredQuestions: [],
    currentQuestionIndex: 0,
    totalQuestions: randomQuestions.length,
    questions: randomQuestions,
    startTime: Date.now(),
  });


  await newUser.save();
      // Emit to all connected clients
      io.emit("currentQuestionUpdated", question,sessionId);
     res
        .status(200)
        .json({ success: true, message: "Question started", question ,sessionId,
          question: randomQuestions[0],  // Sending the first question
         });
    } else {
      res.status(404).json({ success: false, message: "Question not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



const getAllQuestion = async (req, res) => {
  try {
    // console.log("called");
    const query = {
      deleted_at: null,
    };

    const result = await Question.find(query).sort({ createdAt: -1 });

    const count = await Question.find(query).countDocuments();
    res.status(200).json({ success: true, result, count });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error Geting All Question Data" });
  }
};

const getSingleQuestion = async (req, res) => {
  try {
    console.log("called");
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question Not Found" });
    }
    console.log(question);
    res.status(200).json({ success: true, question });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error Geting All Question Data" });
  }
};

module.exports = {
  insertQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestion,
  getSingleQuestion,
  StartQuestion,
  getQuestions,
};
