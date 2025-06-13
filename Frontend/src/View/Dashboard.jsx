import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Slader } from "../Components/SladerOp";


export const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
  window.dispatchEvent(new Event('resize'));
}, [isCollapsed]);

  return (
    <div className="flex h-screen w-full bg-white">

      <Slader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div
        className={`flex-1 transition-all duration-300  ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >

        <main className="w-full h-screen">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
