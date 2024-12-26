const Question = require("../model/questionTable");
const User = require("../model/User");

const getAllUser = async (req, res) => {
  try {
    // console.log("called");
    const query = {
      deleted_at: null,
    };

    const result = await User.find(query).sort({ createdAt: -1 });

    const count = await User.find(query).countDocuments();
    res.status(200).json({ success: true, result, count });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Error Geting All User Data" });
  }
};

module.exports = {
  getAllUser,
};
