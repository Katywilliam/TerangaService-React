import { supabase } from './supabase'

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('utilisateur_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

export const marquerLue = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ lue: true })
    .eq('id', id)
  if (error) throw error
}

export const marquerToutesLues = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ lue: true })
    .eq('utilisateur_id', userId)
    .eq('lue', false)
  if (error) throw error
}

export const countNonLues = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('utilisateur_id', userId)
    .eq('lue', false)
  if (error) throw error
  return count || 0
}

export const subscribeNotifications = (userId, callback) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `utilisateur_id=eq.${userId}`,
    }, callback)
    .subscribe()
}
