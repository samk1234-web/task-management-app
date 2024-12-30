import React from 'react';

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

export default CompletedPage;
