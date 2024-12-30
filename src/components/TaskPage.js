import React from 'react';

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

export default TaskPage;
