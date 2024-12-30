import React from 'react';

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

export default DeletedPage;
