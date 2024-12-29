import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import "./App.css";

// Custom components
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

const HomePage = () => (
  <div className="page-content">
    <h2>Welcome to the Task Management App</h2>
    <p>Log in to manage your tasks effectively.</p>
  </div>
);

const LoginPage = ({ handleLogin, error }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    handleLogin(username, password);
  };

  return (
    <div className="page-content">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

const TaskPage = ({ tasks, handleAddTask, handleToggleComplete, handleDelete, newTask, setNewTask }) => (
  <div className="page-content">
    <h2>Tasks</h2>
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>
          {task.title}{" "}
          <button onClick={() => handleToggleComplete(task.id, task.completed)}>
            {task.completed ? "Undo" : "Complete"}
          </button>
          <button onClick={() => handleDelete(task.id)}>Delete</button>
        </li>
      ))}
    </ul>
    <input
      type="text"
      placeholder="Enter a new task"
      value={newTask}
      onChange={(e) => setNewTask(e.target.value)}
    />
    <button onClick={handleAddTask}>Add Task</button>
  </div>
);

const CompletedPage = ({ completedTasks, handleToggleComplete, handleDelete }) => (
  <div className="page-content">
    <h2>Completed Tasks</h2>
    <ul>
      {completedTasks.map((task) => (
        <li key={task.id}>
          {task.title}{" "}
          <button onClick={() => handleToggleComplete(task.id, task.completed)}>Undo</button>
          <button onClick={() => handleDelete(task.id)}>Delete</button>
        </li>
      ))}
    </ul>
  </div>
);

const DeletedPage = ({ deletedTasks }) => (
  <div className="page-content">
    <h2>Deleted Tasks</h2>
    <ul>
      {deletedTasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  </div>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchCompletedTasks();
      fetchDeletedTasks();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/tasks?user_id=1");
      if (!response.ok) throw new Error("Failed to fetch tasks.");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/tasks?user_id=1&completed=true");
      if (!response.ok) throw new Error("Failed to fetch completed tasks.");
      const data = await response.json();
      setCompletedTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDeletedTasks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/deleted_tasks?user_id=1");
      if (!response.ok) throw new Error("Failed to fetch deleted tasks.");
      const data = await response.json();
      setDeletedTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error("Invalid login credentials.");
      setIsAuthenticated(true);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTasks([]);
    setCompletedTasks([]);
    setDeletedTasks([]);
  };

  const addTask = async () => {
    if (!newTask.trim()) {
        setError("Task title cannot be empty.");
        return;
    }
    try {
        const payload = { title: newTask, user_id: 1 }; // Assuming user_id is 1 for testing
        console.log("Sending payload:", payload);

        const response = await fetch("http://127.0.0.1:5000/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add task.");
        }

        const newTaskData = await response.json();
        console.log("Task added:", newTaskData);

        setTasks([...tasks, newTaskData]);
        setNewTask("");
        setError("");
    } catch (err) {
        console.error("Add task error:", err.message);
        setError(err.message);
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      fetchTasks();
      fetchCompletedTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      fetchTasks();
      fetchCompletedTasks();
      fetchDeletedTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={<LoginPage handleLogin={handleLogin} error={error} />}
        />
        <Route
          path="/tasks"
          element={
            isAuthenticated ? (
              <TaskPage
                tasks={tasks}
                handleAddTask={addTask}
                handleToggleComplete={handleToggleComplete}
                handleDelete={handleDelete}
                newTask={newTask}
                setNewTask={setNewTask}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/completed"
          element={
            isAuthenticated ? (
              <CompletedPage
                completedTasks={completedTasks}
                handleToggleComplete={handleToggleComplete}
                handleDelete={handleDelete}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/deleted"
          element={
            isAuthenticated ? (
              <DeletedPage deletedTasks={deletedTasks} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;