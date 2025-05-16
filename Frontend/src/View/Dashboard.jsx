import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Slader } from "../Components/SladerOp";


export const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-white">

      <Slader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"} w-full`}>
        <main className="w-full overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
