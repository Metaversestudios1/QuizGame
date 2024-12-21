import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";
import { FaAngleDown } from "react-icons/fa6";

const EditEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loader, setLoader] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [mobileValid, setMobileValid] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  const initialState = {
    name: "",
    email: "",
    employeeType: "",
    contactNumber: "",
    licenseNumber: "",
    experienceYears: "",
  };
  const [data, setData] = useState(initialState);
  useEffect(() => {
    fetchOldData();
    fetchCategory();
  }, []);
  const fetchCategory = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/getAllCategoryWithoutPagination`
    );
    const response = await res.json();
    if (response.success) {
      setCategories(response.result);
    }
  };
  const fetchOldData = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/getSingleEmployee`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }
    );
    const response = await res.json();
    if (response.success) {
      setData((prevState) => ({
        ...prevState,
        name: response.result.name,
        email: response.result.email,
        employeeType: response.result.employeeType,
        contactNumber: response.result.contactNumber,
        licenseNumber: response.result.licenseNumber,
        experienceYears: response.result.experienceYears,
      }));
    }
  };
  const validateEmployeeForm = () => {
    $.validator.addMethod(
      "validPhone",
      function (value, element) {
        return this.optional(element) || /^\d{10}$/.test(value);
      },
      "Please enter a valid 10-digit phone number."
    );

    // Add custom validation method for experience
    $.validator.addMethod(
      "validExperience",
      function (value, element) {
        return this.optional(element) || /^\d+(\.\d{1,2})?$/.test(value);
      },
      "Please enter a valid experience in years (e.g., 1, 2, 1.2, 1.11)."
    );

    // Initialize jQuery validation
    $("#employeeform").validate({
      rules: {
        name: {
          required: true,
        },
        email: {
          required: true,
          email: true,
        },
        password: {
          required: true,
        },
        contactNumber: {
          required: true,
          validPhone: true,
        },
        employeeType: {
          required: true,
        },
        licenseNumber: {
          required: true,
        },
        experienceYears: {
          required: true,
          validExperience: true,
        },
      },
      messages: {
        name: {
          required: "Please enter name",
        },
        email: {
          required: "Please enter email",
          email: "Please enter a valid email address",
        },
        password: {
          required: "Please enter password",
        },
        employeeType: {
          required: "Please select employee type",
        },
        contactNumbe: {
          required: "Please enter contact details",
          validPhone: "Phone number must be exactly 10 digits",
        },
        licenseNumber: {
          required: "Please enter license number",
        },
        experienceYears: {
          required: "Please enter experience",
          validExperience:
            "Please enter a valid experience in years (e.g., 1, 2, 1.2, 1.11).",
        },
      },
      errorElement: "div",
      errorPlacement: function (error, element) {
        error.addClass("invalid-feedback");
        error.insertAfter(element);
      },
      highlight: function (element, errorClass, validClass) {
        $(element).addClass("is-invalid").removeClass("is-valid");
      },
      unhighlight: function (element, errorClass, validClass) {
        $(element).removeClass("is-invalid").addClass("is-valid");
      },
    });

    // Return validation status
    return $("#employeeform").valid();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmployeeForm()) {
      return;
    }
    try {
      setLoader(true);
      const updateData = { id, data };
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateEmployee`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );
      const response = await res.json();
      if (response.success) {
        toast.success("Employee is updated Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setTimeout(() => {
          navigate("/employees");
        }, 1500);
      } else {
        setLoader(false);
        setError(response.message);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <>
      <div className="flex items-center ">
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
        <div className="flex items-center">
          <IoIosArrowRoundBack
            onClick={handleGoBack}
            className="bg-[#16144b] text-white rounded-sm text-[40px] cursor-pointer shadow-xl ml-5"
          />
        </div>
        <div className="flex items-center">
          <div className="text-2xl font-bold mx-2 my-8 px-4">Edit Employee</div>
        </div>
      </div>
      {loader ? (
        <div className="absolute w-[80%] h-[40%] flex justify-center items-center">
          <div
            className=" flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      ) : (
        <div className="w-[70%] m-auto my-10">
          <form id="employeeform">
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Full Name<span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  type="text"
                  id="name"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="contactNumber"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Contact number
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="contactNumber"
                  value={data.contactNumber}
                  onChange={handleChange}
                  type="text"
                  id="contact"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="123-45-678"
                  required
                />
              </div>
              <div className="">
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Email address
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  type="email"
                  id="email"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="john.doe@company.com"
                  required
                />
              </div>
              <div className="">
                <label
                  htmlFor="employeeType"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Employee Type{" "}
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <select
                  name="employeeType"
                  value={data?.employeeType}
                  onChange={handleChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                >
                  <option value="">Select an Employee Type.</option>
                  {categories.map((option) => {
                    return (
                      <option
                        key={option._id}
                        value={option._id}
                        className=" bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                      >
                        {option.role}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="">
                <label
                  htmlFor="licenseNumber"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  License Number{" "}
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="licenseNumber"
                  value={data.licenseNumber}
                  onChange={handleChange}
                  type="text"
                  id="licenseNumber"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Enter license number"
                  required
                />
              </div>
              <div className="">
                <label
                  htmlFor="experienceYears"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Experience in Years
                </label>
                <input
                  name="experienceYears"
                  value={data.experienceYears}
                  onChange={handleChange}
                  type="text"
                  id="experienceYears"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Enter experience"
                />
              </div>
            </div>

            {error && <p className="text-red-900  text-[17px] mb-5">{error}</p>}
            <button
              type="submit"
              onClick={handleSubmit}
              className="text-white bg-[#16144b] hover:bg-[#16144bea] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
            >
              UPDATE
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default EditEmployee;
