import React,{ useEffect, useState }  from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';


// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Home = () => {
  const [totalEmployee, setTotalEmployee] = useState(0);
  const [totalCategory, setTotalCategory] = useState(0);
  const [totalproduct, setTotalProduct] = useState(0);
  const [totaldealers, setTotaldealers] = useState(0);
  useEffect(() => {
    // setLoader(true); 
    fetchEmployee();
    fetchcategory();
    fetchproduct();
    fetchdealers();
  },);
  
  const fetchEmployee = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllEmployee`);
    const response = await res.json();
    setTotalEmployee(response.count);
  };
  const fetchcategory = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllCategory`);
    const response = await res.json();
    setTotalCategory(response.count);
  };
  const fetchproduct = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllProducts`);
    const response = await res.json();
    setTotalProduct(response.count);
  };
  const fetchdealers = async () => {
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/getAllDealers`);
    const response = await res.json();
    setTotaldealers(response.count);
  };
  const barData = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: 'Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ['Red', 'Blue', 'Yellow'],
    datasets: [
      {
        label: 'Votes',
        data: [300, 50, 100],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
      },
    ],
  };

  return (
    <div className="w-full p-4 flex flex-wrap gap-4">
      {/* Row 1: First three boxes */}
      <div className="flex w-full justify-between gap-4">
        <div className="flex-1 max-w-[30%] p-4 bg-white shadow-md rounded">
          <div className="ml-2">
            <div className="text-sm">Total Employees</div>
            <div className="font-bold text-black">{totalEmployee}</div>
          </div>
        </div>
        <div className="flex-1 max-w-[30%] p-4 bg-white shadow-md rounded">
          <div className="ml-2">
            <div className="text-sm">Total Categories</div>
            <div className="font-bold text-black">{totalCategory}</div>
          </div>
        </div>
        <div className="flex-1 max-w-[30%] p-4 bg-white shadow-md rounded">
          <div className="ml-2">
            <div className="text-sm">Total Products</div>
            <div className="font-bold text-black">{totalproduct}</div>
          </div>
        </div>
        <div className="flex-1 max-w-[30%] p-4 bg-white shadow-md rounded">
          <div className="ml-2">
            <div className="text-sm">Total Dealers</div>
            <div className="font-bold text-black">{totaldealers}</div>
          </div>
        </div>
      </div>
      

      {/* Row 2: Bar Chart and Pie Chart */}
      <div className="flex w-full justify-between gap-4">
        <div className="flex-1 max-w-[48%] p-4 bg-white shadow-md rounded">
          <h2 className="text-lg mb-2 text-center">Bar Chart</h2>
          <div className="h-[300px]">
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="flex-1 max-w-[48%] p-4 bg-white shadow-md rounded">
          <h2 className="text-lg mb-2 text-center">Pie Chart</h2>
          <div className="h-[300px]">
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
