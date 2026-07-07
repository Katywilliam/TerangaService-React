import { useState, useEffect } from 'react';
import Icon from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const TYPE_STYLE = {
  reservation: { icon: 'calendar', color: 'text-green-600', bg: 'bg-green-50' },
  message:     { icon: 'chat',     color: 'text-blue-600',  bg: 'bg-blue-50'  },
  paiement:    { icon: 'dollar',   color: 'text-amber-600', bg: 'bg-amber-50' },
  avis:        { icon: 'star',     color: 'text-purple-600',bg: 'bg-purple-50'},
  default:     { icon: 'bell',     color: 'text-gray-600',  bg: 'bg-gray-50'  },
};

function toItem(n) {
  const style = TYPE_STYLE[n.type] || TYPE_STYLE.default;
  return {
    id: n.id,
    icon: style.icon,
    title: n.type ? n.type.charAt(0).toUpperCase() + n.type.slice(1) : 'Notification',
    desc: n.contenu,
    time: new Date(n.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    lue: n.lue,
    color: style.color,
    bg: style.bg,
  };
}

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    let active = true;

    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('utilisateur_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      if (active) {
        setItems((data || []).map(toItem));
        setLoading(false);
      }
    };
    fetchNotifs();

    const channel = supabase
      .channel(`notifs-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `utilisateur_id=eq.${user.id}`,
      }, payload => {
        setItems(prev => [toItem(payload.new), ...prev]);
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function markRead(i) {
    const item = items[i];
    if (item.lue) return;
    setItems(prev => prev.map((n, j) => j === i ? { ...n, lue: true } : n));
    await supabase.from('notifications').update({ lue: true }).eq('id', item.id);
  }

  async function markAllRead() {
    setItems(prev => prev.map(n => ({ ...n, lue: true })));
    await supabase.from('notifications').update({ lue: true })
      .eq('utilisateur_id', user.id).eq('lue', false);
  }

  const unread = items.filter(n => !n.lue).length;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#1B3A6B] mb-0 flex items-center gap-2">
            <Icon name="bell" size={24} color="#1B3A6B" />
            Notifications
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{unread}</span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{unread} non lue{unread > 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-[#3A9E3A] font-semibold hover:underline flex items-center gap-1">
            <Icon name="check" size={14} color="#3A9E3A" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icon name="bell" size={48} color="#D1D5DB" />
          <p className="mt-3">Aucune notification pour l'instant</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n, i) => (
            <div
              key={n.id}
              onClick={() => markRead(i)}
              className={`card flex gap-4 p-5 cursor-pointer hover:shadow-md transition-all border-l-4 ${!n.lue ? 'border-l-[#3A9E3A] bg-green-50/30' : 'border-l-transparent'}`}
            >
              <div className={`w-10 h-10 ${n.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon name={n.icon} size={18} color="currentColor" className={n.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-bold ${!n.lue ? 'text-[#1B3A6B]' : 'text-gray-700'}`}>{n.title}</h3>
                  <span className="text-xs text-gray-400 flex-shrink-0">{n.time}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mt-0.5">{n.desc}</p>
              </div>
              {!n.lue && <div className="w-2.5 h-2.5 bg-[#3A9E3A] rounded-full flex-shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}