const API_BASE_URL = "https://tasksphere-ai.onrender.com";

const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch data.");
  }
  return response.json();
};

export const fetchTasks = () => fetchAPI("/tasks?user_id=1");
export const fetchCompletedTasks = () => fetchAPI("/tasks?user_id=1&completed=true");
export const fetchDeletedTasks = () => fetchAPI("/deleted_tasks?user_id=1");
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
