import { supabase } from '../supabase'

// Récupérer tous les prestataires actifs avec leurs infos
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

  // On ne garde que les offres actives dans chaque prestataire,
  // sans exclure les prestataires eux-mêmes (contrairement à un
  // filtre .eq('offres.actif', true) côté requête, qui transforme
  // la jointure en INNER JOIN strict et fait disparaître presque
  // tous les prestataires).
  return (data || []).map(p => ({
    ...p,
    offres: (p.offres || []).filter(o => o.actif),
  }))
}

// Récupérer un prestataire par ID
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

// Récupérer les prestataires en attente de validation (admin)
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

// Valider un prestataire (admin)
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

// Mettre à jour le profil prestataire
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
