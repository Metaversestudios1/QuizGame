import "./App.css";
import Layout from "./Components/Layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Employees from "./Components/employees/Employees";
import AddEmployee from "./Components/employees/AddEmployee";
import EditEmployee from "./Components/employees/EditEmployee";
import Question from "./Components/question/Question";
import AddQuestion from "./Components/question/AddQuestion";
import EditQuestion from "./Components/question/EditQuestion";
import EditCategory from "./Components/category/EditCategory";
import AddCategory from "./Components/category/AddCategory";
import Categories from "./Components/category/Categories";
import EditWarehouse from "./Components/warehouse/EditWarehouse";
import AddWarehouse from "./Components/warehouse/AddWarehouse";
import Warehouses from "./Components/warehouse/Warehouses";


function App() {
  return (
    <>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/addemployee" element={<AddEmployee />} />
            <Route path="/employees/editemployee/:id" element={<EditEmployee />}/>
            <Route path="/question" element={<Question />} />
            <Route path="/question/addquestion" element={<AddQuestion />} />
            <Route path="/questions/editquestion/:id" element={<EditQuestion />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/addcategory" element={<AddCategory />} />
            <Route path="/categories/editcategory/:id" element={<EditCategory />}/>
            <Route path="/warehouses" element={<Warehouses />}/>
            <Route path="/warehouses/addwarehouse" element={<AddWarehouse />}/>
            <Route path="/warehouses/editwarehouse/:id"element={<EditWarehouse />}/>
          </Routes>
        </Layout>
      </Router>
    </>
  );
}

export default App;
