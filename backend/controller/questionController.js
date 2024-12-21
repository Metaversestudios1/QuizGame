const Question = require("../model/questionTable");
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
  try {
    console.log(req.body);

    // const id = req.params.id;
    try {
      const updatedQuestion = await Question.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedQuestion) {
        return res
          .status(404)
          .json({ success: false, message: "Question not found" });
      }

      res.status(200).json({
        success: true,
        message: "Question updated successfully",
        updatedQuestion,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "error in updating question ",
        error: err.message,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error Updating  Question Data" });
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

const StartQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const currentQuestion = 1;

    const question = await Question.findByIdAndUpdate(
      id,
      { currentQuestion },
      { new: true }
    );

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Question status updated.", question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error." });
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
};
