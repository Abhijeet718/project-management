import apiClient from './apiClient.js'

const getTasksPath = (projectId) => `/projects/${projectId}/tasks`

export async function getProjectTasks(projectId) {
  const response = await apiClient.get(getTasksPath(projectId))
  return response.data.data
}

export async function getTaskById(projectId, taskId) {
  const response = await apiClient.get(`${getTasksPath(projectId)}/${taskId}`)
  return response.data.data
}

export async function createTask(projectId, taskData) {
  const response = await apiClient.post(getTasksPath(projectId), taskData)
  return response.data.data
}

export async function updateTask(projectId, taskId, taskData) {
  const response = await apiClient.patch(`${getTasksPath(projectId)}/${taskId}`, taskData)
  return response.data.data
}

export async function deleteTask(projectId, taskId) {
  const response = await apiClient.delete(`${getTasksPath(projectId)}/${taskId}`)
  return response.data.data
}

export async function createSubtask(projectId, taskId, title) {
  const response = await apiClient.post(`${getTasksPath(projectId)}/${taskId}/subtasks`, { title })
  return response.data.data
}

export async function updateSubtask(projectId, taskId, subtaskId, updates) {
  const response = await apiClient.put(
    `${getTasksPath(projectId)}/${taskId}/subtasks/${subtaskId}`,
    updates,
  )
  return response.data.data
}

export async function deleteSubtask(projectId, taskId, subtaskId) {
  const response = await apiClient.delete(`${getTasksPath(projectId)}/${taskId}/subtasks/${subtaskId}`)
  return response.data.data
}
