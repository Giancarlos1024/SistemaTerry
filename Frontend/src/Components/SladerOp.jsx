import React from 'react';
import {
    LayoutDashboard,
    CircleChevronRight,
    CircleChevronLeft,
    FileClock,
    Settings
} from "lucide-react";
import { NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeProvider';

export const Slader = ({ isCollapsed, setIsCollapsed }) => {

    const { theme } = useTheme(); // Obtiene el tema actual
    const activeClass = theme === "dark" 
    ? "bg-[#17326b] text-white font-bold" 
    : "bg-[#17326b] text-white font-bold";

    const inactiveClass = theme === "dark" 
    ? "hover:bg-gray-700 text-white hover:text-white" 
    : "hover:bg-gray-200 text-gray-600 hover:text-black";

    // Obtener el rol desde localStorage
    const role = localStorage.getItem("role");

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside className={`
            shadow-lg h-screen fixed flex flex-col items-center transition-all duration-300 
            ${isCollapsed ? 'w-20' : 'w-64'}
            ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}
        `}>
            <div className="flex items-center justify-around pt-6 pr-2">
                <div className="flex items-start space-x-1">
                    {!isCollapsed && <h2 className="text-xl font-medium pr-8">New Project</h2>}
                </div>
                <button 
                    onClick={toggleCollapse} 
                    className={`flex items-center pl-2 rounded-lg font-medium 
                        ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
                >
                    {isCollapsed ? (
                        <CircleChevronRight className={`${theme === "dark" ? "hover:text-blue-300" : "hover:text-sky-400"} cursor-pointer`} />
                    ) : (
                        <CircleChevronLeft className={`${theme === "dark" ? "text-white hover:text-gray-400" : "text-[#17326b] hover:text-gray-500"} cursor-pointer`} />
                    )}
                </button>

            </div>
            <nav className="mt-5">
                <ul className="space-y-2">
                    <li> 
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                `flex items-center p-3 mx-3 text-xs rounded-lg font-medium ${isActive ? activeClass : inactiveClass}`
                            }
                            end
                        >
                            <LayoutDashboard className="mr-2 ml-2" />
                            {!isCollapsed && "Dashboard"}
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/dashboard/historial"
                            className={({ isActive }) =>
                                `flex items-center p-3 mx-3 text-xs rounded-lg font-medium ${isActive ? activeClass : inactiveClass}`
                            }
                        >
                            <FileClock  className="mr-2 ml-2"/>
                            {!isCollapsed && "Historial"}
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/dashboard/configuracion"
                            className={({ isActive }) =>
                                `flex items-center p-3 mx-3 text-xs rounded-lg font-medium ${isActive ? activeClass : inactiveClass}`
                            }
                        >
                            <Settings  className="mr-2 ml-2"/>
                            {!isCollapsed && "Configuracion"}
                        </NavLink>
                    </li>
                   
                </ul>
            </nav>
        </aside>
    );
};
