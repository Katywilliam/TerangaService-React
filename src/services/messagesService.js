import { supabase } from './supabase';

export async function getContacts(userId, userRole) {
  let raw = [];

  if (userRole === 'client') {
    const { data: clientData } = await supabase
      .from('clients').select('id').eq('utilisateur_id', userId).maybeSingle();
    if (clientData) {
      const { data } = await supabase
        .from('reservations')
        .select('offres ( prestataires ( utilisateurs ( id, nom, prenom ) ) )')
        .eq('client_id', clientData.id);
      raw = (data || []).map(r => r.offres?.prestataires?.utilisateurs).filter(Boolean);
    }
  } else if (userRole === 'prestataire') {
    const { data: prestData } = await supabase
      .from('prestataires').select('id').eq('utilisateur_id', userId).maybeSingle();
    if (prestData) {
      const { data } = await supabase
        .from('reservations')
        .select('clients ( utilisateurs ( id, nom, prenom ) ), offres!inner ( prestataire_id )')
        .eq('offres.prestataire_id', prestData.id);
      raw = (data || []).map(r => r.clients?.utilisateurs).filter(Boolean);
    }
  }

  const { data: msgRows } = await supabase
    .from('messages')
    .select('expediteur_id, destinataire_id')
    .or(`expediteur_id.eq.${userId},destinataire_id.eq.${userId}`);

  const otherIds = new Set();
  (msgRows || []).forEach(m => {
    const otherId = m.expediteur_id === userId ? m.destinataire_id : m.expediteur_id;
    if (otherId && otherId !== userId) otherIds.add(otherId);
  });

  if (otherIds.size > 0) {
    const { data: msgUsers } = await supabase
      .from('utilisateurs')
      .select('id, nom, prenom')
      .in('id', Array.from(otherIds));
    raw = raw.concat(msgUsers || []);
  }

  const uniqueMap = new Map();
  raw.forEach(u => uniqueMap.set(u.id, u));
  const uniques = Array.from(uniqueMap.values());

  const withPreview = await Promise.all(uniques.map(async (u) => {
    const { data: lastMsg } = await supabase
      .from('messages')
      .select('contenu, created_at, expediteur_id')
      .or(`and(expediteur_id.eq.${userId},destinataire_id.eq.${u.id}),and(expediteur_id.eq.${u.id},destinataire_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: unread } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('expediteur_id', u.id)
      .eq('destinataire_id', userId)
      .eq('lu', false);

    return {
      id: u.id,
      nom: `${u.prenom} ${u.nom}`.trim(),
      lastMsg: lastMsg?.contenu || "Aucun message pour l'instant",
      lastTime: lastMsg?.created_at || null,
      unread: unread || 0,
    };
  }));

  withPreview.sort((a, b) => {
    if (!a.lastTime) return 1;
    if (!b.lastTime) return -1;
    return new Date(b.lastTime) - new Date(a.lastTime);
  });

  return withPreview;
}

export async function getThread(userId, contactId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, contenu, created_at, expediteur_id')
    .or(`and(expediteur_id.eq.${userId},destinataire_id.eq.${contactId}),and(expediteur_id.eq.${contactId},destinataire_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function markThreadRead(contactId, userId) {
  await supabase
    .from('messages')
    .update({ lu: true })
    .eq('expediteur_id', contactId)
    .eq('destinataire_id', userId)
    .eq('lu', false);
}

export async function sendMessage(fromId, toId, contenu) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ expediteur_id: fromId, destinataire_id: toId, contenu })
    .select('id, created_at')
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToIncoming(userId, contactId, onMessage) {
  const channel = supabase
    .channel(`messages-${userId}-${contactId}`)
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'messages',
      filter: `expediteur_id=eq.${contactId}`,
    }, payload => {
      if (payload.new.destinataire_id !== userId) return;
      onMessage(payload.new);
      supabase.from('messages').update({ lu: true }).eq('id', payload.new.id);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}