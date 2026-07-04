import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { signIn, signUp, signOut } from '../services/auth/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roleLoading, setRoleLoading] = useState(true)

  const fetchRole = async (userId) => {
    if (!userId) { setUserRole(null); setRoleLoading(false); return }
    setRoleLoading(true)
    const { data } = await supabase.from('utilisateurs').select('role').eq('id', userId).single()
    setUserRole(data?.role || null)
    setRoleLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      await fetchRole(session?.user?.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        await fetchRole(session?.user?.id)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (credentials) => {
    const data = await signIn(credentials)
    await fetchRole(data.user?.id)
    const { data: profil } = await supabase.from('utilisateurs').select('role').eq('id', data.user.id).single()
    return { ...data, role: profil?.role || null }
  }

  const register = async (userData) => {
    const data = await signUp(userData)
    return data
  }

  const logout = async () => {
    await signOut()
    setUser(null)
    setSession(null)
    setUserRole(null)
  }

  const isAuthenticated = !!user

  const value = {
    user,
    session,
    loading,
    roleLoading,
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