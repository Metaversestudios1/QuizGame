import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [sideBar, setSideBar] = useState(true);
  const toggleSideBar = () => {
    setSideBar(!sideBar);
  };
  return (
    <div className="flex h-screen">
      <Sidebar
        sidebar={sideBar}
        className=""
        toggleSideBar={toggleSideBar}
      />
      <div className="flex flex-col flex-grow overflow-y-auto w-full">
        <Navbar toggleSideBar={toggleSideBar} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
