import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('ttm_user')
  if (stored) {
    const { token } = JSON.parse(stored)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
}

// Projects
export const projectAPI = {
  getAll:      ()          => api.get('/projects'),
  create:      (data)      => api.post('/projects', data),
  getMembers:  (id)        => api.get(`/projects/${id}/members`),
  addMember:   (id, data)  => api.post(`/projects/${id}/members`, data),
}

// Tasks
export const taskAPI = {
  getByProject: (projectId) => api.get(`/tasks?projectId=${projectId}`),
  create:        (data)      => api.post('/tasks', data),
  updateStatus:  (id, status) => api.patch(`/tasks/${id}`, { status }),
}

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
}

export default api
