import { useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";

import Customers from "./pages/Customers";
import FollowUps from "./pages/FollowUps";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Challans from "./pages/Challans";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activePage, setActivePage] = useState("Dashboard");

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setActivePage("Dashboard");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="main-area">
        <header className="topbar">
          <div>
            <h2>{activePage}</h2>
          </div>

          <div className="user-section">
            <span>{user.name}</span>

            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main>
          {activePage === "Dashboard" && (
            <Dashboard user={user} />
          )}

          {activePage === "Customers" && (
            <Customers />
          )}

          {activePage === "Products" && (
            <Products />
          )}

          {activePage === "Inventory" && (
            <Inventory />
          )}

          {activePage === "Challans" && (
            <Challans />
          )}

          {activePage === "Follow-ups" && (
            <FollowUps />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;