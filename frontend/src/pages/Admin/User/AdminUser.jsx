import React from "react";
import Navbar from "../../../components/AdminComponent/Navbar";
import Sidebar from "../../../components/AdminComponent/SideBar";
import ContentUser from "../../../components/AdminComponent/User/ContentUser";

function App() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <ContentUser />
      </div>
    </div>
  );
}

export default App;
