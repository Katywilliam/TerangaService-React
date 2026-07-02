import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { signIn, signUp, signOut } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = async (credentials) => {
    const data = await signIn(credentials)
    return data
  }

  const register = async (userData) => {
    const data = await signUp(userData)
    return data
  }

  const logout = async () => {
    await signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated: !!user,
      userRole: user?.user_metadata?.role || null,
      login, register, logout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être dans un AuthProvider')
  return context
}
