import React, { useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { AiOutlineProduct } from "react-icons/ai";
import { CiCircleList } from "react-icons/ci";
import { PiWarehouse } from "react-icons/pi";
import { GrHistory } from "react-icons/gr";
import { GiNotebook } from "react-icons/gi";
import { FaPeopleRoof } from "react-icons/fa6";
const Sidebar = ({ sidebar, toggleSideBar }) => {
  const [openSubMenu, setOpenSubMenu] = useState({
    client: false,
    property: false,
    agent: false,
    rank: false,
    setting: false,
  });
  const toggleSubMenu = (menu) => {
    setOpenSubMenu((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };
  return (
    <>
      <div
        className={`h-full bg-[#4B49AC] w-[260px] flex-col  overflow-y-auto overflow-x-hidden ${
          sidebar ? "hidden" : "flex"
        } md:block`}
      >
        <div
          id="docs-sidebar"
          className={`bg-[#4B49AC]  hs-overlay   [--auto-close:lg] start-0 z-[60]  border-gray-200 pt-7 pb-10 overflow-y-auto sidebar
          }`}
        >
          <div className="px-6">
            <a
              className="flex-none text-xl font-semibold text-white"
              href="/"
              aria-label="Brand"
            >
              Admin
            </a>
          </div>
          <nav
            className="hs-accordion-group p-3 w-full flex flex-col flex-wrap mt-8"
            data-hs-accordion-always-open
          >
            <ul className="space-y-1.5">
              <li
                className=" hover:scale-105 transition-transform duration-200 "
                onClick={toggleSideBar}
              >
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white bg-[#7978E9] rounded-lg"
                      : "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white rounded-lg hover:text-black hover:bg-white"
                  }
                >
                  <svg
                    className="size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <div className="text-sm">Dashboard</div>
                </NavLink>
              </li>
              <li
                className=" hover:scale-105 transition-transform duration-200 "
                id="users-accordion "
                onClick={toggleSideBar}
              >
                <NavLink
                  to="/user"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white bg-[#7978E9] rounded-lg"
                      : "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white rounded-lg hover:text-black hover:bg-white"
                  }
                >
                  <svg
                    className="size-4 "
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <div className="text-sm">Users</div>
                </NavLink>
              </li>
            
              <li
                className=" hover:scale-105 transition-transform duration-200 "
                onClick={toggleSideBar}
                id="users-accordion "
              >
                <NavLink
                  to="/question"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white bg-[#7978E9] rounded-lg"
                      : "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white rounded-lg hover:text-black hover:bg-white"
                  }
                >
                  <AiOutlineProduct className="text-lg"/>
                  <div className="text-sm">Questionaries</div>
                </NavLink>
              </li>
              {/* <li
                className=" hover:scale-105 transition-transform duration-200 "
                onClick={toggleSideBar}
                id="users-accordion "
              >
                <NavLink
                  to="/warehouses"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white bg-[#7978E9] rounded-lg"
                      : "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white rounded-lg hover:text-black hover:bg-white"
                  }
                >
                  <PiWarehouse className="text-lg"/>
                  <div className="text-sm">Warehouses</div>
                </NavLink>
              </li> */}
              {/* <li
                className=" hover:scale-105 transition-transform duration-200 "
                onClick={toggleSideBar}
                id="users-accordion "
              >
                <NavLink
                  to="/dealers"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white bg-[#7978E9] rounded-lg"
                      : "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white rounded-lg hover:text-black hover:bg-white"
                  }
                >
                  <FaPeopleRoof className="text-lg"/>
                  <div className="text-sm">Dealers</div>
                </NavLink>
              </li> */}
              {/* <li
                className=" hover:scale-105 transition-transform duration-200 "
                onClick={toggleSideBar}
                id="users-accordion "
              >
                <NavLink
                  to="/assigningorder"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white bg-[#7978E9] rounded-lg"
                      : "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white rounded-lg hover:text-black hover:bg-white"
                  }
                >
                  <GiNotebook className="text-xl -rotate-12"/>
                  <div className="text-sm">Order assigning</div>
                </NavLink>
              </li> */}
              {/*<li
                className=" hover:scale-105 transition-transform duration-200 "
                onClick={toggleSideBar}
                id="users-accordion "
              >
                <NavLink
                  to="/assigningorder"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white bg-[#7978E9] rounded-lg"
                      : "flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-white rounded-lg hover:text-black hover:bg-white"
                  }
                >
                  <GrHistory className="text-lg"/>
                  <div className="text-sm">Order History</div>
                </NavLink>
              </li>*/}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
