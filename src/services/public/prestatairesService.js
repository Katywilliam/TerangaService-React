import { supabase } from '../supabase'

export const getPrestataires = async (filters = {}) => {
  let query = supabase
    .from('prestataires')
    .select(`
      id,
      bio,
      experience_annees,
      zone_intervention,
      note_moyenne,
      nb_avis,
      verifie,
      utilisateurs (
        id, nom, prenom, email, telephone, ville, photo_url
      ),
      offres (
        id, titre, tarif, unite_tarif, actif,
        services (
          id, nom,
          categories (nom, icone, couleur)
        )
      )
    `)

  if (filters.ville) {
    query = query.eq('utilisateurs.ville', filters.ville)
  }
  if (filters.note_min) {
    query = query.gte('note_moyenne', filters.note_min)
  }

  const { data, error } = await query.order('note_moyenne', { ascending: false })
  if (error) throw error

  return (data || []).map(p => ({
    ...p,
    offres: (p.offres || []).filter(o => o.actif),
  }))
}

export const getPrestataire = async (id) => {
  const { data, error } = await supabase
    .from('prestataires')
    .select(`
      id,
      bio,
      experience_annees,
      zone_intervention,
      note_moyenne,
      nb_avis,
      verifie,
      utilisateurs (
        id, nom, prenom, email, telephone, ville, photo_url
      ),
      offres (
        id, titre, description, tarif, unite_tarif, duree_estimee, photos, actif,
        services (
          id, nom, description,
          categories (nom, icone, couleur)
        )
      ),
      avis (
        id, note, commentaire, reponse, created_at,
        clients (
          utilisateurs (nom, prenom, photo_url)
        )
      )
    `)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const getPrestatairesEnAttente = async () => {
  const { data, error } = await supabase
    .from('prestataires')
    .select(`
      id, verifie, created_at,
      utilisateurs (nom, prenom, email, telephone, ville)
    `)
    .eq('verifie', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const validerPrestataire = async (id) => {
  const { data, error } = await supabase
    .from('prestataires')
    .update({ verifie: true })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updatePrestataire = async (id, updates) => {
  const { data, error } = await supabase
    .from('prestataires')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
