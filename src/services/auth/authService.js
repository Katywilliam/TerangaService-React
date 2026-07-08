import { supabase } from '../supabase'

export const signUp = async ({ email, password, nom, prenom, phone, role, photo_url, experience_annees, zone_intervention, bio }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nom,
        prenom,
        telephone: phone,
        role,
        photo_url: photo_url || null,
        experience_annees: experience_annees || null,
        zone_intervention: zone_intervention || null,
        bio: bio || null,
      },
    },
  })
  if (error) throw error

  // IMPORTANT : la table `utilisateurs` est peuplée automatiquement par un
  // trigger côté base de données à partir des métadonnées ci-dessus.
  // En revanche, rien ne créait jusqu'ici la ligne correspondante dans la
  // table `prestataires` pour les comptes inscrits avec role="prestataire" —
  // c'est pour ça que la page publique /prestataires n'affichait presque
  // aucun résultat. On la crée donc explicitement ici.
  if (role === 'prestataire' && data?.user?.id) {
    const { error: prestataireError } = await supabase
      .from('prestataires')
      .upsert(
        {
          id: data.user.id,
          bio: bio || null,
          experience_annees: experience_annees || null,
          zone_intervention: zone_intervention || null,
          verifie: false,
        },
        { onConflict: 'id' }
      )
    if (prestataireError) {
      // On ne bloque pas l'inscription si cette étape échoue (ex: session
      // pas encore active en attendant la confirmation email), mais on
      // remonte l'erreur dans la console pour pouvoir la diagnostiquer.
      console.error('Erreur lors de la création du profil prestataire :', prestataireError.message)
    }
  }

  return data
}

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
}