import { supabase } from './supabase'

// Inscription
export const signUp = async ({ email, password, name, phone, role }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, role },
    },
  })
  if (error) throw error
  return data
}

// Connexion
export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

// Déconnexion
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Récupérer la session actuelle
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

// Récupérer l'utilisateur connecté
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

// Réinitialisation du mot de passe
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

// Écouter les changements de session
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}
