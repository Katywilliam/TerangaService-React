import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { getContacts, getThread, markThreadRead, sendMessage, subscribeToIncoming } from '../services/messagesService';

function initials(n) {
  return (n || '').split(' ').filter(Boolean).map(x => x[0]).join('').toUpperCase().slice(0, 2);
}

export default function Messages() {
  const { user, userRole, logout } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [thread, setThread] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const endRef = useRef(null);

  const dashboardLink = userRole === 'admin' ? '/admin/dashboard'
    : userRole === 'prestataire' ? '/dashboard/prestataire'
    : '/dashboard/client';

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  useEffect(() => {
    const load = async () => {
      if (!user || !userRole) { setLoading(false); return; }
      try {
        const list = await getContacts(user.id, userRole);
        setContacts(list);
        if (list.length > 0) setSelected(list[0].id);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, userRole]);

  useEffect(() => {
    if (!selected || !user) return;

    const load = async () => {
      setLoadingThread(true);
      const data = await getThread(user.id, selected);
      setThread(data.map(m => ({
        id: m.id,
        from: m.expediteur_id === user.id ? 'me' : 'other',
        text: m.contenu,
        time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      })));
      setLoadingThread(false);

      await markThreadRead(selected, user.id);
      setContacts(prev => prev.map(c => c.id === selected ? { ...c, unread: 0 } : c));

      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    load();

    const unsubscribe = subscribeToIncoming(user.id, selected, (m) => {
      setThread(prev => [...prev, {
        id: m.id, from: 'other', text: m.contenu,
        time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return unsubscribe;
  }, [selected, user]);

  const conv = contacts.find(c => c.id === selected);

  async function send() {
    if (!newMsg.trim() || !selected || !user) return;
    const contenu = newMsg.trim();
    setNewMsg('');
    try {
      const data = await sendMessage(user.id, selected, contenu);
      setThread(prev => [...prev, {
        id: data.id, from: 'me', text: contenu,
        time: new Date(data.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setContacts(prev => prev.map(c => c.id === selected ? { ...c, lastMsg: contenu, lastTime: data.created_at } : c));
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setNewMsg(contenu);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to={dashboardLink} className="text-sm text-[#1B3A6B] font-medium no-underline hover:underline">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/profil" className="text-sm text-[#1B3A6B] font-medium no-underline hover:underline">
            Profil
          </Link>
          <button onClick={handleLogout} className="text-sm text-red-500 font-medium hover:underline">
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 font-[Poppins]">
        <h1 className="text-xl font-bold text-[#1B3A6B] flex items-center gap-2 mb-6">
          <Icon name="chat" size={22} color="#1B3A6B" /> Messages
        </h1>

        {loading ? (
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        ) : contacts.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <Icon name="chat" size={40} color="#D1D5DB" />
            <p className="mt-3 text-sm">Aucune conversation pour l'instant</p>
            <p className="text-xs text-gray-300 mt-1">Une conversation apparaît ici dès qu'une réservation te met en relation avec quelqu'un</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: '70vh' }}>
            <div className="card overflow-hidden flex flex-col border-t-4 border-[#1B3A6B]">
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                {contacts.map(c => (
                  <div key={c.id} onClick={() => setSelected(c.id)}
                    className={`flex items-start gap-3 p-4 cursor-pointer ${selected === c.id ? 'bg-blue-50 border-l-4 border-l-[#1B3A6B]' : 'hover:bg-gray-50'}`}>
                    <div className="w-10 h-10 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {initials(c.nom)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-0.5">
                        <span className="font-semibold text-sm text-[#1B3A6B] truncate">{c.nom}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{c.lastMsg}</p>
                    </div>
                    {c.unread > 0 && <span className="bg-[#3A9E3A] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">{c.unread}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 card overflow-hidden flex flex-col border-t-4 border-[#3A9E3A]">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-sm font-bold">
                  {initials(conv?.nom || '')}
                </div>
                <p className="font-bold text-sm text-[#1B3A6B]">{conv?.nom}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
                {loadingThread ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
                  </div>
                ) : thread.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 mt-10">Aucun message avec {conv?.nom} pour l'instant. Écris le premier !</p>
                ) : (
                  thread.map(m => (
                    <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                      {m.from === 'other' && (
                        <div className="w-7 h-7 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-xs font-bold mr-2 self-end flex-shrink-0">
                          {initials(conv?.nom || '')}
                        </div>
                      )}
                      <div>
                        <div className={`px-4 py-2.5 rounded-2xl max-w-xs text-sm ${m.from === 'me' ? 'bg-[#1B3A6B] text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'}`}>
                          {m.text}
                        </div>
                        <p className={`text-xs text-gray-400 mt-1 ${m.from === 'me' ? 'text-right' : 'text-left'}`}>{m.time}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={endRef} />
              </div>

              <div className="px-5 py-4 border-t border-gray-100 bg-white flex gap-3">
                <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Écrivez votre message…"
                  className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3A9E3A] font-[Poppins]" />
                <button onClick={send} disabled={!newMsg.trim()} className="w-10 h-10 bg-[#3A9E3A] hover:bg-[#2d8a2d] disabled:opacity-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="send" size={16} color="white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}