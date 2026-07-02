import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { signIn, signUp, signOut } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

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
    setSession(null)
  }

  const isAuthenticated = !!user
  const userRole = user?.user_metadata?.role || null

  const value = {
    user,
    session,
    loading,
    isAuthenticated,
    userRole,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
