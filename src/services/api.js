const API_BASE_URL = "https://tasksphere-ai.onrender.com";

const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch data.");
  }
  return response.json();
};

export const fetchTasks = (user_id) => fetchAPI(`/tasks?user_id=${user_id}`);
export const fetchCompletedTasks = (user_id) => fetchAPI(`/tasks?user_id=${user_id}&completed=true`);
export const fetchDeletedTasks = (user_id) => fetchAPI(`/deleted_tasks?user_id=${user_id}`);
export const login = async ({ username, password }) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Invalid credentials");
  }
};
export const addTask = (task) => fetchAPI("/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(task),
});
export const updateTask = (taskId, updates) => fetchAPI(`/tasks/${taskId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(updates),
});
export const deleteTask = (taskId) => fetchAPI(`/tasks/${taskId}`, {
  method: "DELETE",
});
