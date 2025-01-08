import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import TaskPage from "./components/TaskPage";
import CompletedPage from "./components/CompletedPage";
import DeletedPage from "./components/DeletedPage";
import { fetchTasks, fetchCompletedTasks, fetchDeletedTasks, login, addTask, updateTask, deleteTask } from "./services/api";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasksData();
      fetchCompletedTasksData();
      fetchDeletedTasksData();
    }
  }, [isAuthenticated]);

  const fetchTasksData = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchCompletedTasksData = async () => {
    try {
      const data = await fetchCompletedTasks();
      setCompletedTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchDeletedTasksData = async () => {
    try {
      const data = await fetchDeletedTasks();
      setDeletedTasks(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      await login({ username, password });
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

  const handleAddTask = async () => {
    if (!newTask.trim()) {
      setError("Task title cannot be empty.");
      return;
    }
    try {
      const taskData = await addTask({ title: newTask, user_id: 1 });
      setTasks([...tasks, taskData]);
      setNewTask("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      await updateTask(taskId, { completed: !completed });
      fetchTasksData();
      fetchCompletedTasksData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      fetchTasksData();
      fetchCompletedTasksData();
      fetchDeletedTasksData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage handleLogin={handleLogin} error={error} />} />
        <Route path="/tasks" element={isAuthenticated ? <TaskPage tasks={tasks} handleAddTask={handleAddTask} handleToggleComplete={handleToggleComplete} handleDelete={handleDelete} newTask={newTask} error={error} /> : <Navigate to="/login" />} />
        <Route path="/completed" element={isAuthenticated ? <CompletedPage completedTasks={completedTasks} handleToggleComplete={handleToggleComplete} handleDelete={handleDelete} /> : <Navigate to="/login" />} />
        <Route path="/deleted" element={isAuthenticated ? <DeletedPage deletedTasks={deletedTasks} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
