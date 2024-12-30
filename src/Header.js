import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ isAuthenticated, handleLogout }) => (
  <header className="app-header">
    <h1>Task Management App</h1>
    <nav>
      <Link to="/">Home</Link> |{" "}
      {isAuthenticated ? (
        <>
          <Link to="/tasks">Tasks</Link> |{" "}
          <Link to="/completed">Completed</Link> |{" "}
          <Link to="/deleted">Deleted</Link> |{" "}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  </header>
);

export default Header;
