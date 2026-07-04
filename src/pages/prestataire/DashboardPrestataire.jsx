import { useState, useEffect } from 'react';
import Icon from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { formatCFA, formatDate } from '../../utils/helpers';

export default function DashboardPrestataire() {
  const { user, logout } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, note: 0, revenus: 0 });
  const [states, setStates] = useState({});
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const prenom = user?.user_metadata?.prenom || 'vous';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const { data: prestData, error: prestErr } = await supabase
          .from('prestataires')
          .select('id, note_moyenne, nb_avis')
          .eq('utilisateur_id', user.id)
          .maybeSingle();
        if (prestErr) throw prestErr;
        if (!prestData) { setError('missing_profile'); setLoading(false); return; }

        const { data: resData, error: resErr } = await supabase
          .from('reservations')
          .select(`
            id, statut, date_debut, adresse, montant_total,
            offres!inner ( prestataire_id, titre ),
            clients ( utilisateurs ( nom, prenom ) )
          `)
          .eq('offres.prestataire_id', prestData.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (resErr) throw resErr;

        const pending = (resData || []).filter(r => r.statut === 'en_attente').map(r => ({
          id: r.id,
          client: r.clients?.utilisateurs
            ? `${r.clients.utilisateurs.prenom} ${r.clients.utilisateurs.nom}`
            : 'Client',
          service: r.offres?.titre || 'Service',
          date: formatDate(r.date_debut),
          heure: new Date(r.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          adresse: r.adresse,
        }));

        const done = (resData || []).filter(r => r.statut === 'termine').map(r => ({
          client: r.clients?.utilisateurs
            ? `${r.clients.utilisateurs.prenom} ${r.clients.utilisateurs.nom}`
            : 'Client',
          service: r.offres?.titre || 'Service',
          date: formatDate(r.date_debut),
          montant: String(r.montant_total),
        }));

        setDemandes(pending);
        setRecentes(done);

        const revenus = (resData || []).filter(r => r.statut === 'termine').reduce((s, r) => s + (r.montant_total || 0), 0);
        setStats({
          total: (resData || []).length,
          enAttente: pending.length,
          note: prestData.note_moyenne || 0,
          revenus,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  async function action(i, type) {
    const demande = demandes[i];
    setStates(p => ({ ...p, [i]: type }));
    setToast(type === 'accepted' ? 'Demande acceptée' : 'Demande refusée');
    setTimeout(() => setToast(''), 3000);

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
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-[#3A9E3A] flex items-center gap-1.5 justify-end mb-0">
              <Icon name="dollar" size={18} color="#3A9E3A" />
              {loading ? '…' : formatCFA(stats.revenus)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Revenus ce mois</p>
          </div>
          <button onClick={async () => { await logout(); window.location.href = '/'; }}
            className="flex items-center gap-1.5 bg-red-50 text-red-500 hover:bg-red-100 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            <Icon name="logout" size={13} color="#EF4444" /> Déconnexion
          </button>
        </div>
      </div>

      {error === 'missing_profile' ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3 mb-6">
          Aucun profil prestataire n'existe pour ce compte dans la table <code>prestataires</code>. Contacte un administrateur pour le créer.
        </div>
      ) : error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
          Impossible de charger certaines données de ton compte pour l'instant.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { val: loading ? '…' : stats.total, label: 'Prestations', icon: 'file', bg: 'bg-indigo-50', ic: '#4F46E5' },
          { val: loading ? '…' : stats.enAttente, label: 'En attente', icon: 'clock', bg: 'bg-amber-50', ic: '#D97706' },
          { val: loading ? '…' : (stats.note || '—'), label: 'Note globale', icon: 'star', bg: 'bg-green-50', ic: '#16A34A' },
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
          ) : demandes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Icon name="calendar" size={36} color="#D1D5DB" />
              <p className="mt-3 text-sm">Aucune demande en attente</p>
            </div>
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
            {loading ? (
              <div className="p-5 space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : recentes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Aucune prestation terminée pour l'instant</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentes.map((p, i) => (
                  <div key={i} className="px-5 py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold text-[#1B3A6B]">{p.client}</p>
                        <p className="text-xs text-gray-400">{p.service} · {p.date}</p>
                      </div>
                      <p className="text-sm font-bold text-[#3A9E3A]">{p.montant} FCFA</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}