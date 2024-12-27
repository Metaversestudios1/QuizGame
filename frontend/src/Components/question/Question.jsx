import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Question = () => {
  const [questions, setQuestions] = useState([]);
  const [noData, setNoData] = useState(false);
  const [loader, setLoader] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoader(true);
    const res = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/getAllQuestion?page=${page}&limit=${pageSize}&search=${search}`
    );
    const response = await res.json();
    console.log("question data", response);
    if (response.success) {
      setNoData(response.result.length === 0);
      setQuestions(response.result);
      setCount(response.count);
    }
    setLoader(false);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );
    if (confirmDelete) {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/deleteQuestion/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      const response = await res.json();
      if (response.success) {
        toast.success("Question deleted successfully!", {
          position: "top-right",
          autoClose: 1000,
        });
        fetchData();
      }
    }
  };

  const handleStart = async (e, id) => {
    e.preventDefault();
    const confirmDelete = window.confirm(
      "Are you sure you want to Start this question?"
    );
    if (confirmDelete) {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/StartQuestion/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const response = await res.json();
      if (response.success) {
        toast.success("Question started successfully!", {
          position: "top-right",
          autoClose: 1000,
        });
        fetchData();
      }
    }
  };
  const handleChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const startIndex = (page - 1) * pageSize;

  return (
    <div className="relative">
      <ToastContainer />
      <div className="flex items-center">
        <div className="text-2xl font-bold mx-2 my-8 px-4">Questions List</div>
      </div>
      <div className="flex justify-between">
        <NavLink to="/question/addquestion">
          <button className="bg-[#16144b] text-white p-3 m-5 text-sm rounded-lg">
            Add New
          </button>
        </NavLink>
        <input
          placeholder="Search"
          type="text"
          value={search}
          onChange={handleChange}
          className="text-black border-[1px] rounded-lg bg-white p-2 m-5"
        />
      </div>

      {loader && (
        <div className="absolute h-full w-full top-64 flex justify-center items-center">
          <div className="animate-spin h-8 w-8 border-4 border-solid border-current rounded-full"></div>
        </div>
      )}

      <div className="relative overflow-x-auto m-5 mb-0">
        {questions.length > 0 ? (
          <table className="w-full text-sm text-left border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th className="px-6 py-3 border-2 border-gray-300">Sr No.</th>
                <th className="px-6 py-3 border-2 border-gray-300">Question</th>
                <th className="px-6 py-3 border-2 border-gray-300">Options</th>
                <th className="px-6 py-3 border-2 border-gray-300">
                  Correct Answer
                </th>
                <th className="px-6 py-3 border-2 border-gray-300">Video</th>
                <th className="px-6 py-3 border-2 border-gray-300">Timer</th>
                <th className="px-6 py-3 border-2 border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((item, index) => (
                <tr key={item._id} className="bg-white">
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item.question}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item.options.length > 0
                      ? item.options.map((opt, idx) => (
                          <span key={idx}>
                            {opt.text}
                            {/* {opt.isCorrect ? " (Correct)" : ""} */}
                            {idx < item.options.length - 1 && ", "}
                          </span>
                        ))
                      : "No options"}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item.correctAnswer}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item.videoUrl ? (
                      <a
                        href={item.videoUrl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Video
                      </a>
                    ) : (
                      "No video"
                    )}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item.timer ? item.timer : "No Timer Set"}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    <div className="flex items-center">
                      <NavLink to={`/questions/editquestion/${item._id}`}>
                        <CiEdit className="text-2xl cursor-pointer text-green-900 mx-2" />
                      </NavLink>
                      {/* <MdDelete
                        onClick={(e) => handleDelete(e, item._id)}
                        className="text-2xl cursor-pointer text-red-900"
                      /> */}

                      {item.currentQuestion === 1 ? (
                        <span className="text-green-600 font-semibold">
                          Running
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleStart(e, item._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loader && (
            <div className="text-center text-xl">No questions available.</div>
          )
        )}
      </div>

      {questions.length > 0 && (
        <div className="flex flex-col items-center my-10">
          <span className="text-sm">
            Showing <span className="font-semibold">{startIndex + 1}</span> to{" "}
            <span className="font-semibold">
              {Math.min(startIndex + pageSize, count)}
            </span>{" "}
            of <span className="font-semibold">{count}</span> entries
          </span>
          <div className="inline-flex mt-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={questions.length < pageSize}
              className="px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-r hover:bg-gray-900"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Question;
