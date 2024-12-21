import React, { useEffect, useState } from "react";
import { MdDelete } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ImCross } from "react-icons/im";
import { IoMdEye } from "react-icons/io";
const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
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
  try {
    const res = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/getAllWarehouses?page=${page}&limit=${pageSize}&search=${search}`
    );
    const response = await res.json();
    
    if (response.success) {
      const warehousesWithDetails = await Promise.all(
        response.result.map(async (warehouse) => {
          // Fetch manager name
          const managerRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/getSingleEmployee`,{
              method: "POST",
              headers: {"Content-Type":"application/json"},
              body: JSON.stringify({id:warehouse.manager})
            }
          );
          const managerData = await managerRes.json();
          const manager = managerData.success ? managerData.result.name : 'Unknown';

          // Fetch product names for currentInventory
          const currentInventory = await Promise.all(
            warehouse.currentInventory.map(async (productId) => {
              let id = productId
              const productRes = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/getProduct/${id}`
              );
              const productData = await productRes.json();
              console.log(productData)
              return productData.success ? productData.result.name : 'Unknown Product';
            })
          );

          // Return the warehouse with added manager name and product names
          return {
            ...warehouse,
            manager,
            currentInventory,
          };
        })
      );

      setNoData(warehousesWithDetails.length === 0);
      setWarehouses(warehousesWithDetails);
      setCount(response.count);
    } else {
      setNoData(true);
      setWarehouses([]);
    }
  } catch (error) {
    console.error("Error fetching warehouse data:", error);
    setNoData(true);
  } finally {
    setLoader(false);
  }
};


  const handleDelete = async (e, id) => {
    e.preventDefault();
    const permissionOfDelete = window.confirm(
      "Are you sure, you want to delete the product"
    );
    if (permissionOfDelete) {
      let warehouseOne = warehouses.length === 1;
      if (count === 1) {
        warehouseOne = false;
      }
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/deleteWarehouse/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const response = await res.json();
      if (response.success) {
        toast.success("Warehouse is deleted Successfully!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        if (warehouseOne) {
          setPage(page - 1);
        } else {
          fetchData();
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearch(value);
      setPage(1);
    }
  };

  const startIndex = (page - 1) * pageSize;

  return (
    <div className="relative">
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
        <div className="text-2xl font-bold mx-2 my-8 px-4">Warehouses List</div>
      </div>
      <div className="flex justify-between">
        <NavLink to="/warehouses/addwarehouse">
          <button className="bg-[#16144b] text-white p-3 m-5 text-sm rounded-lg">
            Add New
          </button>
        </NavLink>
        <div className={`flex items-center`}>
          <input
            placeholder="Search "
            type="text"
            name="search"
            value={search}
            onChange={handleChange}
            className={`text-black border-[1px] rounded-lg bg-white p-2 m-5`}
          />
        </div>
      </div>

      {loader && (
        <div className="absolute h-full w-full top-64  flex justify-center items-center">
          <div
            className=" flex justify-center h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] "
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      )}
      <div className="relative overflow-x-auto m-5 mb-0">
        {warehouses.length > 0 && (
          <table className="w-full text-sm text-left rtl:text-right border-2 border-gray-300">
            <thead className="text-xs uppercase bg-gray-200">
              <tr>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Sr no.
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Name of warehouse
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Contact number
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Inventory
                </th>
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Manager of warehouse
                </th>
               
                <th scope="col" className="px-6 py-3 border-2 border-gray-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {warehouses.map((item, index) => (
                <tr key={item?._id} className="bg-white">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900  border-2 border-gray-300"
                  >
                    {startIndex + index + 1}
                  </th>

                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap  border-2 border-gray-300"
                  >
                    {item?.name}
                  </th>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.contact?.phone}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.contact?.email}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.address}
                  </td>
                  <td className="px-6 py-4 border-2  border-gray-300">
                    {(item?.currentInventory).join(", ")}
                  </td>
                  <td className="px-6 py-4 border-2 border-gray-300">
                    {item?.manager}
                  </td>
                  <td className=" p-5   border-2  border-gray-300">
                    <div className="flex items-center">
                      {/* <NavLink to={`/employees/showemployee/${item?._id}`}>
                        <IoMdEye className="text-2xl cursor-pointer text-blue-900" />
                      </NavLink>*/}
                      <NavLink to={`/warehouses/editwarehouse/${item?._id}`}>
                        <CiEdit className="text-2xl cursor-pointer text-green-900" />
                      </NavLink>
                      <MdDelete
                        onClick={(e) => handleDelete(e, item?._id)}
                        className="text-2xl cursor-pointer text-red-900"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {noData && (
        <div className="text-center text-xl">
          Currently! There are no warehouses in the storage.
        </div>
      )}

      {warehouses.length > 0 && (
        <div className="flex flex-col items-center my-10">
          <span className="text-sm text-black">
            Showing{" "}
            <span className="font-semibold text-black">{startIndex + 1}</span>{" "}
            to{" "}
            <span className="font-semibold text-black">
              {Math.min(startIndex + pageSize, count)}
            </span>{" "}
            of <span className="font-semibold text-black">{count}</span> Entries
          </span>
          <div className="inline-flex mt-2 xs:mt-0">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={
                warehouses.length < pageSize || startIndex + pageSize >= count
              }
              className="flex items-center justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
