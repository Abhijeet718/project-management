import apiClient from './apiClient.js'

export async function getProjects() {
  const response = await apiClient.get('/projects')
  return response.data.data
}

export async function getProjectById(projectId) {
  const response = await apiClient.get(`/projects/${projectId}`)
  return response.data.data
}

export async function createProject(projectData) {
  const response = await apiClient.post('/projects', projectData)
  return response.data.data
}

export async function updateProject(projectId, projectData) {
  const response = await apiClient.put(`/projects/${projectId}`, projectData)
  return response.data.data
}

export async function deleteProject(projectId) {
  const response = await apiClient.delete(`/projects/${projectId}`)
  return response.data.data
}
