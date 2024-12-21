import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";
import { FaAngleDown } from "react-icons/fa6";

const EditWarehouse = () => {
  const [loader, setLoader] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const params = useParams();
  const { id } = params;
  const navigate = useNavigate();

  const initialState = {
    name: "",
    address: "",
    contact: { phone: "", email: "" },
    manager: "",
    currentInventory: [],
  };
  const [data, setData] = useState(initialState);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehouseRes, employeeRes, productRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/getWarehouse/${id}`),
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/getAllEmployeesWithoutPagination`
          ),
          fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/getAllProductsWithoutPagination`
          ),
        ]);

        const warehouseData = await warehouseRes.json();
        const employeesData = await employeeRes.json();
        const productsData = await productRes.json();

        if (warehouseData.success)
          setData({
            ...data,
            name: warehouseData?.result?.name,
            address: warehouseData?.result?.address,
            contact: {
              phone: warehouseData?.result?.contact?.phone,
              email: warehouseData?.result?.contact?.email,
            },
            manager: warehouseData?.result?.manager,
            currentInventory: warehouseData?.result?.currentInventory,
          });
        if (employeesData.success) setEmployees(employeesData.result);
        if (productsData.success) setProducts(productsData.result);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  const validateWarehouseForm = () => {
    $.validator.addMethod(
      "validPhone",
      function (value, element) {
        return this.optional(element) || /^[0-9]{10}$/.test(value); // Updated to allow only numeric values
      },
      "Please enter a valid 10-digit phone number."
    );

    $("#warehouseForm").validate({
      rules: {
        name: { required: true },
        address: { required: true },
        "contact.phone": { required: true, validPhone: true },
        "contact.email": { required: true, email: true },
        manager: { required: true },
      },
      messages: {
        name: { required: "Please enter name" },
        address: { required: "Please enter address" },
        "contact.phone": {
          required: "Please enter mobile number",
          validPhone: "Phone number must be exactly 10 digits",
        },
        "contact.email": {
          required: "Please enter email",
          email: "Please enter a valid email address",
        },
        manager: { required: "Please select manager for warehouse" },
      },
      errorElement: "div",
      errorPlacement: (error, element) =>
        error.addClass("invalid-feedback").insertAfter(element),
      highlight: (element) =>
        $(element).addClass("is-invalid").removeClass("is-valid"),
      unhighlight: (element) =>
        $(element).removeClass("is-invalid").addClass("is-valid"),
    });
    return $("#warehouseForm").valid();
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prevData) => {
      const updatedData = { ...prevData };
      if (name.includes("contact")) {
        const field = name.split(".")[1];
        updatedData.contact[field] = value;
      } else {
        updatedData[name] = value;
      }
      return updatedData;
    });
  };

  const handleCheckboxChange = (productId) => {
    setData((prevData) => {
      const isProductSelected = prevData.currentInventory.includes(productId);
      const updatedInventory = isProductSelected
        ? prevData.currentInventory.filter((id) => id !== productId)
        : [...prevData.currentInventory, productId];
      return { ...prevData, currentInventory: updatedInventory };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateWarehouseForm()) {
      //setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoader(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateWarehouse/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const response = await res.json();
      if (response.success) {
        toast.success("Warehouse is updated Successfully!", {
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
          navigate("/warehouses");
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

  const handleDropdownBlur = (event) => {
    if (!dropdownRef.current.contains(event.relatedTarget)) {
      setDropdownOpen(false);
    }
  };
  console.log(data);
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
          <div className="text-2xl font-bold mx-2 my-8 px-4">Edit Warehouse</div>
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
          <form id="warehouseForm">
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Name
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  type="text"
                  id="name"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Warehouse name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Address
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="address"
                  value={data.address}
                  onChange={handleChange}
                  type="text"
                  id="address"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Address"
                  required
                />
              </div>
              <div className="">
                <div className="flex gap-2 ">
                  <div className="w-full">
                    <label
                      htmlFor="contact.phone"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      Mobile number
                      <span className="text-red-900 text-lg ">&#x2a;</span>
                    </label>
                    <input
                      name="contact.phone"
                      value={data.contact.phone}
                      onChange={handleChange}
                      type="text"
                      id="contact.phone"
                      className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                      placeholder="Mobile number"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="contact.email"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      Email addresss
                      <span className="text-red-900 text-lg ">&#x2a;</span>
                    </label>
                    <input
                      name="contact.email"
                      value={data.contact.email}
                      onChange={handleChange}
                      type="text"
                      id="contact.email"
                      className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                      placeholder="Email"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="projects_assigned"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Current inventory &#x28;Products&#x29;
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                    }}
                    onBlur={handleDropdownBlur}
                    className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black w-full p-2.5 flex justify-between items-center"
                  >
                    Select Products
                    <FaAngleDown className="text-end" />
                  </button>
                  {dropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 bg-white border border-gray-300 rounded-sm shadow-lg w-full"
                    >
                      {products.map((item) => (
                        <div
                          key={item._id}
                          className="p-2  bg-gray-200 text-gray-900 text-sm  focus:ring-blue-500 focus:border-black block w-full"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          <input
                            type="checkbox"
                            id={`product-${item._id}`}
                            value={item._id}
                            checked={data.currentInventory.includes(item._id)}
                            onChange={() => handleCheckboxChange(item._id)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={`product-${item._id}`}
                            className="text-gray-900 text-sm"
                          >
                            {item.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="">
                <label
                  htmlFor="manager"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Manager
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <select
                  name="manager"
                  value={data?.manager}
                  onChange={handleChange}
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                >
                  <option value="">Select a Manager.</option>
                  {employees.map((option) => {
                    return (
                      <option
                        key={option._id}
                        value={option._id}
                        className=" bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                      >
                        {option.name}
                      </option>
                    );
                  })}
                </select>
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

export default EditWarehouse;
