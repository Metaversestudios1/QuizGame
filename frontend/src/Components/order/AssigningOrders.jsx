import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";
import { FaAngleDown } from "react-icons/fa6";

const AssigningOrders = () => {
  const [loader, setLoader] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const initialState = {
    products: [],
    assignedTo: "",
    warehouse: "",
    dealer: "",
    pickupDate: "",
    deliveryDate: "",
    deliveryAddress: "",
  };
  const [data, setData] = useState(initialState);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeeRes, productRes, warehouseRes, dealerRes] =
          await Promise.all([
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
            fetch(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/api/getAllWarehouseWithoutPagination`
            ),
            fetch(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/api/getAllDealersWithoutPagination`
            ),
          ]);

        const employeesData = await employeeRes.json();
        const productsData = await productRes.json();
        const dealersData = await dealerRes.json();
        const warehousesData = await warehouseRes.json();

        if (employeesData.success) setEmployees(employeesData.result);
        if (productsData.success) setProducts(productsData.result);
        if (warehousesData.success) setWarehouses(warehousesData.result);
        if (dealersData.success) setDealers(dealersData.result);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  const validateOrdersForm = () => {
    $.validator.addMethod(
      "validPhone",
      function (value, element) {
        return this.optional(element) || /^[0-9]{10}$/.test(value); // Updated to allow only numeric values
      },
      "Please enter a valid 10-digit phone number."
    );

    $("#ordersForm").validate({
      rules: {
        name: { required: true },
        deliveryAddress: { required: true },
        "contact.phone": { required: true, validPhone: true },
        "contact.email": { required: true, email: true },
        manager: { required: true },
      },
      messages: {
        name: { required: "Please enter name" },
        deliveryAddress: { required: "Please enter address" },
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
    return $("#ordersForm").valid();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateOrdersForm()) {
      return;
    }

    try {
      setLoader(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/assignOrderToEmployee`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const response = await res.json();
      if (response.success) {
        toast.success(
          "New Order is Generated! You can track the status from Order history",
          {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
        setTimeout(() => {
          navigate(0);
        }, 1500);
      } else {
        setLoader(false);
        setError(response.message);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleCheckboxChange = (productId) => {
    setData((prevData) => {
      // Check if the product is already in the array
      const isProductSelected = prevData.products.some(
        (product) => product.productId === productId
      );

      let updatedProducts;
      if (isProductSelected) {
        // Remove the product if it's already selected (uncheck action)
        updatedProducts = prevData.products.filter(
          (product) => product.productId !== productId
        );
      } else {
        // Add the new product to the list, only if it has a valid ID
        updatedProducts = [
          ...prevData.products,
          { productId, quantity: 1 }, // Default quantity can be set here
        ];
      }

      return {
        ...prevData,
        products: updatedProducts.filter((product) => product.productId), // Ensure no empty entries
      };
    });
  };

  const handleQuantityChange = (index, value) => {
    if(data.products[0].productId){

      setData((prevData) => {
        const updatedProducts = [...prevData.products];
        updatedProducts[index].quantity = value;
        return { ...prevData, products: updatedProducts };
      });
    }else {
      toast.error(
          "Please select product first",
          {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
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
          <div className="text-2xl font-bold mx-2 my-8 px-4">
            Assigning Order
          </div>
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
        <div className=" mx-14 my-10">
          <form id="ordersForm">
            <div className="grid gap-6  mb-6 md:grid-cols-3 ">
              <div className="col-span-1 ">
              <h2 className="font-bold text-xl my-8">Products:</h2>
              <div className="grid grid-cols-2 gap-3 items-start">
                {data.products.map((product, index) => (
                  <div key={product.productId}>
                    <div className="text-xl font-medium my-3">
                      {
                        products.find((item) => item._id === product.productId)
                          ?.name
                      }
                    </div>
                    <div>
                      <label
                        htmlFor={`quantity-${index}`}
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        value={product.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
              </div>
              <div className="col-span-2 ">
                <div className="grid gap-6 mb-6 md:grid-cols-2 items-center ">
                  <div>
                    <label
                      htmlFor="projects_assigned"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      Products
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
                                checked={data.products.some(
                                  (product) => product.productId === item._id
                                )}
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
                      htmlFor="warehouse"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      Warehouse
                      <span className="text-red-900 text-lg ">&#x2a;</span>
                    </label>
                    <select
                      name="warehouse"
                      value={data?.warehouse}
                      onChange={handleChange}
                      className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    >
                      <option value="">Select a Warehouse.</option>
                      {warehouses.map((option) => {
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
                  <div className="">
                    <label
                      htmlFor="dealer"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      Dealer
                      <span className="text-red-900 text-lg ">&#x2a;</span>
                    </label>
                    <select
                      name="dealer"
                      value={data?.dealer}
                      onChange={handleChange}
                      className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    >
                      <option value="">Select a Dealer.</option>
                      {dealers.map((option) => {
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
                  <div className="">
                    <label
                      htmlFor="assignedTo"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      Assigned To
                      <span className="text-red-900 text-lg ">&#x2a;</span>
                    </label>
                    <select
                      name="assignedTo"
                      value={data?.assignedTo}
                      onChange={handleChange}
                      className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    >
                      <option value="">Select an Employee.</option>
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

                  <div className="w-full">
                    <label
                      htmlFor="pickupDate"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      Pickup Date
                      <span className="text-red-900 text-lg ">&#x2a;</span>
                    </label>
                    <input
                      name="pickupDate"
                      value={data.pickupDate}
                      onChange={handleChange}
                      type="date"
                      id="pickupDate"
                      className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                      placeholder="Pickup Date"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor="deliveryDate"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                    >
                      Delivery Date
                      <span className="text-red-900 text-lg ">&#x2a;</span>
                    </label>
                    <input
                      name="deliveryDate"
                      value={data.deliveryDate}
                      onChange={handleChange}
                      type="date"
                      id="deliveryDate"
                      className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                      placeholder="Delivery Date"
                      required
                    />
                  </div>
                </div>
                <div className="w-full my-6">
                  <label
                    htmlFor="deliveryAddress"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                  >
                    Delivery address
                    <span className="text-red-900 text-lg ">&#x2a;</span>
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={data.deliveryAddress}
                    onChange={handleChange}
                    type="text"
                    id="deliveryAddress"
                    className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    placeholder="Delivery Address"
                    required
                  />
                </div>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="text-white bg-[#16144b] hover:bg-[#16144bea] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full  px-5 py-2.5 text-center"
                >
                  ADD
                </button>
              </div>
            </div>
            {error && <p className="text-red-900  text-[17px] mb-5">{error}</p>}
          </form>
        </div>
      )}
    </>
  );
};

export default AssigningOrders;
