import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import "jquery-validation";
import { FaAngleDown } from "react-icons/fa6";

const EditQuestion = () => {
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const initialState = {
    name: "",
    description: "",
    weight: "",
    quantity: "",
    dimensions: {
      typeOfProduct: "",
      length: "",
      width: "",
      height: "",
      unit: "",
    },
  };
  const [data, setData] = useState(initialState);
  useEffect(() => {
    fetchOldData();
  }, []);
  const fetchOldData = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/getProduct/${id}`
    );
    const response = await res.json();
    if (response.success) {
      setData((prevState) => ({
        ...prevState,
        name: response?.product?.name,
        description: response?.product?.description,
        weight: response?.product?.weight,
        quantity: response?.product?.quantity,
        dimensions: {
          typeOfProduct: response?.product?.dimensions.typeOfProduct,
          length: response?.product?.dimensions.length,
          width: response?.product?.dimensions.width,
          height: response?.product?.dimensions.height,
          unit: response?.product?.dimensions.unit,
        },
      }));
    }
  };
  const validateProductForm = () => {
    $("#productForm").validate({
      rules: {
        name: {
          required: true,
        },
        description: {
          required: true,
        },
        quantity: {
          required: true,
        },
      },
      messages: {
        name: {
          required: "Please enter name",
        },
        description: {
          required: "Please enter description",
        },
        quantity: {
          required: "Please select quantity",
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
    return $("#productForm").valid();
  };
  const handleChange = (e) => {
    const { name, value } = e.target;

    setData((prevState) => {
      // Handle nested fields in dimensions object
      if (name.startsWith("dimensions.")) {
        const field = name.split(".")[1]; // Get the sub-field name after "dimensions."

        // Only allow numeric values for length, width, and height
        if (["length", "width", "height"].includes(field)) {
          if (value === "" || /^[0-9]*$/.test(value)) {
            return {
              ...prevState,
              dimensions: {
                ...prevState.dimensions,
                [field]: value,
              },
            };
          } else {
            return prevState; // Ignore non-numeric input for these fields
          }
        }

        // Update non-numeric fields in dimensions (e.g., type, unit)
        return {
          ...prevState,
          dimensions: {
            ...prevState.dimensions,
            [field]: value,
          },
        };
      }

      // Handle other fields outside of dimensions
      if (["weight", "quantity"].includes(name)) {
        // Only allow numeric input for weight and quantity
        if (value === "" || /^[0-9]*$/.test(value)) {
          return {
            ...prevState,
            [name]: value,
          };
        }
        return prevState; // Ignore non-numeric input for these fields
      }

      // Default case for fields that accept any input
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateProductForm()) {
      //setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoader(true);

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/updateProduct/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const response = await res.json();
      if (response.success) {
        toast.success("Product is updated Successfully!", {
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
          navigate("/products");
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
          <div className="text-2xl font-bold mx-2 my-8 px-4">Edit Product</div>
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
          <form id="productForm">
            <div className="grid gap-6 mb-6 md:grid-cols-2 items-center">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Name of the Product
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  type="text"
                  id="name"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Product name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Description
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  type="text"
                  id="description"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Description"
                  required
                />
              </div>
              <div className="">
                <label
                  htmlFor="quantity"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Quantity
                  <span className="text-red-900 text-lg ">&#x2a;</span>
                </label>
                <input
                  name="quantity"
                  value={data.quantity}
                  onChange={handleChange}
                  type="text"
                  id="quantity"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Quantity in KG's"
                  required
                />
              </div>
              <div className="">
                <label
                  htmlFor="weight"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Weight &#x28;KG&#x29;
                </label>
                <input
                  name="weight"
                  value={data.weight}
                  onChange={handleChange}
                  type="text"
                  id="weight"
                  className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                  placeholder="Wieght"
                />
              </div>

              <div className="">
                <label
                  htmlFor="dimensions"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
                >
                  Dimensions
                </label>
                <div className="flex gap-1">
                  <input
                    name="dimensions.typeOfProduct"
                    value={data.dimensions.typeOfProduct}
                    onChange={handleChange}
                    type="text"
                    id="typeOfProduct"
                    className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    placeholder="Type of product"
                  />
                  <input
                    name="dimensions.unit"
                    value={data.dimensions.unit}
                    onChange={handleChange}
                    type="text"
                    id="dimensions"
                    className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    placeholder="Unit"
                  />

                  <input
                    name="dimensions.length"
                    value={data.dimensions.length}
                    onChange={handleChange}
                    type="number"
                    id="dimensions"
                    className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    placeholder="Lenght "
                  />
                  <input
                    name="dimensions.width"
                    value={data.dimensions.width}
                    onChange={handleChange}
                    type="number"
                    id="dimensions"
                    className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    placeholder="Width "
                  />
                  <input
                    name="dimensions.height"
                    value={data.dimensions.height}
                    onChange={handleChange}
                    type="number"
                    id="dimensions"
                    className="bg-gray-200 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-black block w-full p-2.5 "
                    placeholder="Height "
                  />
                </div>
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

export default EditQuestion;
