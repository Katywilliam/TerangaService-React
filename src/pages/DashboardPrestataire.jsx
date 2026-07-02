import { useState, useEffect } from 'react';
import Icon from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { formatCFA, formatDate } from '../utils/helpers';

const FALLBACK_DEMANDES = [
  { client: 'Aminata Ba', service: 'Ménage complet', date: '30 juin 2026', heure: '09:00', adresse: 'Plateau, Dakar', statut: 'pending' },
  { client: 'Moussa Diop', service: 'Repassage', date: '1er juillet 2026', heure: '14:00', adresse: 'Almadies', statut: 'pending' },
  { client: 'Rokhaya Gaye', service: 'Nettoyage vitres', date: '2 juillet 2026', heure: '10:00', adresse: 'Mermoz', statut: 'pending' },
];

const FALLBACK_RECENT = [
  { client: 'Fatou S.', service: 'Ménage', date: '25 juin', montant: '3 500', note: 5 },
  { client: 'Ibrahima D.', service: 'Repassage', date: '22 juin', montant: '2 000', note: 5 },
  { client: 'Ndèye N.', service: 'Ménage', date: '18 juin', montant: '3 500', note: 4 },
];

export default function DashboardPrestataire() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [recentes, setRecentes] = useState(FALLBACK_RECENT);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, note: 4.9, revenus: 0 });
  const [states, setStates] = useState({});
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  const prenom = user?.user_metadata?.name?.split(' ')[0] || 'vous';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const { data: prestData } = await supabase
          .from('prestataires')
          .select('id, note_moyenne, nb_avis')
          .eq('utilisateur_id', user.id)
          .single();

        if (!prestData) { setDemandes(FALLBACK_DEMANDES); setLoading(false); return; }

        // Réservations en attente
        const { data: resData } = await supabase
          .from('reservations')
          .select(`
            id, statut, date_debut, adresse, montant_total,
            offres!inner ( prestataire_id, titre ),
            clients ( utilisateurs ( nom, prenom ) )
          `)
          .eq('offres.prestataire_id', prestData.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (resData && resData.length > 0) {
          const pending = resData.filter(r => r.statut === 'en_attente').map(r => ({
            id: r.id,
            client: r.clients?.utilisateurs
              ? `${r.clients.utilisateurs.prenom} ${r.clients.utilisateurs.nom}`
              : 'Client',
            service: r.offres?.titre || 'Service',
            date: formatDate(r.date_debut),
            heure: new Date(r.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            adresse: r.adresse,
            statut: 'pending',
          }));

          const done = resData.filter(r => r.statut === 'termine').map(r => ({
            client: r.clients?.utilisateurs
              ? `${r.clients.utilisateurs.prenom} ${r.clients.utilisateurs.nom}`
              : 'Client',
            service: r.offres?.titre || 'Service',
            date: formatDate(r.date_debut),
            montant: String(r.montant_total),
            note: 5,
          }));

          setDemandes(pending.length > 0 ? pending : FALLBACK_DEMANDES);
          setRecentes(done.length > 0 ? done : FALLBACK_RECENT);

          const revenus = resData.filter(r => r.statut === 'termine').reduce((s, r) => s + (r.montant_total || 0), 0);
          setStats({
            total: resData.length,
            enAttente: pending.length,
            note: prestData.note_moyenne || 4.9,
            revenus,
          });
        } else {
          setDemandes(FALLBACK_DEMANDES);
        }
      } catch {
        setDemandes(FALLBACK_DEMANDES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  async function action(i, type) {
    setStates(p => ({ ...p, [i]: type }));
    setToast(type === 'accepted' ? 'Demande acceptée' : 'Demande refusée');
    setTimeout(() => setToast(''), 3000);

    const demande = demandes[i];
    if (demande?.id) {
      await supabase
        .from('reservations')
        .update({ statut: type === 'accepted' ? 'confirme' : 'annule' })
        .eq('id', demande.id);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-[Poppins]">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1B3A6B] text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1B3A6B] flex items-center justify-center">
            <Icon name="user" size={22} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B3A6B] mb-0">Bonjour, {prenom}</h1>
            <p className="text-sm text-[#3A9E3A] mt-0 flex items-center gap-1.5">
              <Icon name="check" size={12} color="#3A9E3A" />
              Prestataire vérifié
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#3A9E3A] flex items-center gap-1.5 justify-end mb-0">
            <Icon name="dollar" size={18} color="#3A9E3A" />
            {loading ? '…' : formatCFA(stats.revenus)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Revenus ce mois</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { val: loading ? '…' : stats.total, label: 'Prestations', icon: 'file', bg: 'bg-indigo-50', ic: '#4F46E5' },
          { val: loading ? '…' : stats.enAttente, label: 'En attente', icon: 'clock', bg: 'bg-amber-50', ic: '#D97706' },
          { val: stats.note, label: 'Note globale', icon: 'star', bg: 'bg-green-50', ic: '#16A34A' },
        ].map((s, i) => (
          <div key={i} className="card p-5 text-center hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <Icon name={s.icon} size={20} color={s.ic} />
            </div>
            <p className="text-2xl font-bold text-[#1B3A6B] mb-0">{s.val}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demandes */}
        <div className="lg:col-span-2 card border-t-4 border-[#3A9E3A]">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1B3A6B]">Demandes en attente</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {demandes.map((d, i) => {
                const st = states[i];
                return (
                  <div key={i} className="px-6 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 bg-[#1B3A6B] rounded-full flex items-center justify-center text-white text-xs font-bold">{d.client[0]}</div>
                          <span className="font-semibold text-sm text-[#1B3A6B]">{d.client}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{d.service}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Icon name="calendar" size={11} /> {d.date} à {d.heure}</span>
                          <span className="flex items-center gap-1"><Icon name="mappin" size={11} /> {d.adresse}</span>
                        </div>
                      </div>
                      {st ? (
                        <span className={st === 'accepted' ? 'badge-green' : 'badge-red'}>
                          {st === 'accepted' ? 'Acceptée' : 'Refusée'}
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={() => action(i, 'accepted')} className="flex items-center gap-1.5 bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            <Icon name="check" size={12} color="white" /> Accepter
                          </button>
                          <button onClick={() => action(i, 'refused')} className="flex items-center gap-1.5 border border-red-400 text-red-500 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                            <Icon name="x" size={12} color="#EF4444" /> Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card border-t-4 border-[#1B3A6B]">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#1B3A6B] text-sm">Prestations récentes</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {recentes.map((p, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-[#1B3A6B]">{p.client}</p>
                      <p className="text-xs text-gray-400">{p.service} · {p.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#3A9E3A]">{p.montant} FCFA</p>
                      <div className="flex justify-end gap-0.5">
                        {[...Array(p.note)].map((_, j) => <Icon key={j} name="star" size={11} color="#FBBF24" />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disponibilité */}
          <div className="card p-5">
            <h3 className="font-bold text-[#1B3A6B] text-sm mb-3">Disponibilité</h3>
            <div className="space-y-2">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map((j, i) => (
                <div key={j} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{j}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-checked:bg-[#3A9E3A] rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
