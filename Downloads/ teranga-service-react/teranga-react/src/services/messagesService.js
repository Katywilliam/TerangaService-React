import { supabase } from './supabase'

// Récupérer les messages d'une réservation
export const getMessages = async (reservationId) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      id, contenu, lu, created_at,
      expediteur:utilisateurs!expediteur_id (id, nom, prenom, photo_url)
    `)
    .eq('reservation_id', reservationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// Envoyer un message
export const envoyerMessage = async ({ reservation_id, expediteur_id, destinataire_id, contenu }) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ reservation_id, expediteur_id, destinataire_id, contenu }])
    .select()
    .single()
  if (error) throw error
  return data
}

// Écouter les nouveaux messages en temps réel
export const subscribeMessages = (reservationId, callback) => {
  return supabase
    .channel(`messages-${reservationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `reservation_id=eq.${reservationId}`,
    }, callback)
    .subscribe()
}
