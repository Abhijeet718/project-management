import { useEffect, useState } from 'react'
import AuthContext from './authContext.js'
import apiClient from '../services/apiClient.js'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadCurrentUser() {
      try {
        const response = await apiClient.post('/auth/current-user')
        if (isMounted) setUser(response.data.data.user)
      } catch (error) {
        // If the short-lived access cookie expired, rotate it with the refresh cookie once.
        if (error.response?.status === 401) {
          try {
            await apiClient.post('/auth/refresh-token')
            const response = await apiClient.post('/auth/current-user')
            if (isMounted) setUser(response.data.data.user)
          } catch {
            if (isMounted) setUser(null)
          }
        } else if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadCurrentUser()

    return () => {
      isMounted = false
    }
  }, [])

  async function login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password })
    setUser(response.data.data.user)
    return response.data.data.user
  }

  async function register(formValues) {
    const response = await apiClient.post('/auth/register', formValues)
    return response.data
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      if (error.response?.status !== 401) throw error
      await apiClient.post('/auth/refresh-token')
      await apiClient.post('/auth/logout')
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
