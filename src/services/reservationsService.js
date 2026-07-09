import { supabase } from './supabase'

export const getReservationsClient = async (userId) => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id, statut, date_debut, date_fin, adresse, montant_total, created_at,
      clients!inner ( utilisateur_id ),
      offres (
        titre, tarif, unite_tarif,
        prestataires (
          utilisateurs (nom, prenom, photo_url, telephone)
        ),
        services (nom, categories (nom, icone))
      )
    `)
    .eq('clients.utilisateur_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const getReservationsPrestataire = async (prestataireId) => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id, statut, date_debut, date_fin, adresse, montant_total, instructions, created_at,
      clients (
        utilisateurs (nom, prenom, photo_url, telephone)
      ),
      offres!inner (prestataire_id, titre, tarif, unite_tarif)
    `)
    .eq('offres.prestataire_id', prestataireId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createReservation = async ({ offre_id, client_id, date_debut, date_fin, adresse, instructions, montant_total }) => {
  const { data, error } = await supabase
    .from('reservations')
    .insert([{ offre_id, client_id, date_debut, date_fin, adresse, instructions, montant_total }])
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateStatutReservation = async (id, statut) => {
  const { data, error } = await supabase
    .from('reservations')
    .update({ statut })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const getAllReservations = async () => {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      id, statut, montant_total, date_debut, created_at,
      clients (utilisateurs (nom, prenom)),
      offres (
        titre,
        prestataires (utilisateurs (nom, prenom))
      )
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}