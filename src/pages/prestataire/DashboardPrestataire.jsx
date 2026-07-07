import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { formatCFA, formatDate } from '../../utils/helpers';

const UNITES = [
  { value: 'heure', label: 'Par heure' },
  { value: 'jour', label: 'Par jour' },
  { value: 'forfait', label: 'Forfait' },
  { value: 'm2', label: 'Par m²' },
];

function AddOfferModal({ prestataireId, onClose, onCreated }) {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [form, setForm] = useState({ service_id: '', titre: '', description: '', tarif: '', unite_tarif: 'heure', duree_estimee: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('services').select('id, nom, categories ( nom )').eq('actif', true).order('nom')
      .then(({ data }) => {
        setServices(data || []);
        setLoadingServices(false);
      });
  }, []);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.service_id || !form.titre || !form.tarif) {
      setError('Merci de remplir le service, le titre et le tarif.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: insErr } = await supabase
        .from('offres')
        .insert({
          prestataire_id: prestataireId,
          service_id: form.service_id,
          titre: form.titre,
          description: form.description || null,
          tarif: Number(form.tarif),
          unite_tarif: form.unite_tarif,
          duree_estimee: form.duree_estimee ? Number(form.duree_estimee) : null,
        })
        .select('id, titre, tarif, unite_tarif, actif, services ( nom )')
        .single();
      if (insErr) throw insErr;
      onCreated({ ...data, service: data.services?.nom });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#1B3A6B] text-base">Nouvelle offre</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="close" size={18} color="currentColor" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Service proposé</label>
            {loadingServices ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : services.length === 0 ? (
              <p className="text-xs text-gray-400">Aucun service disponible pour l'instant. Contacte un administrateur.</p>
            ) : (
              <select value={form.service_id} onChange={e => update('service_id', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20">
                <option value="">Sélectionner un service</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.categories?.nom ? `${s.categories.nom} — ` : ''}{s.nom}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Titre de l'offre</label>
            <input value={form.titre} onChange={e => update('titre', e.target.value)}
              placeholder="Ex : Ménage complet appartement"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description (optionnel)</label>
            <textarea rows={2} value={form.description} onChange={e => update('description', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Tarif (FCFA)</label>
              <input type="number" min="0" value={form.tarif} onChange={e => update('tarif', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Unité</label>
              <select value={form.unite_tarif} onChange={e => update('unite_tarif', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20">
                {UNITES.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-[#3A9E3A] text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? 'Création...' : "Créer l'offre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPrestataire() {
  const { user, logout } = useAuth();
  const [prestataireId, setPrestataireId] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [confirmees, setConfirmees] = useState([]);
  const [recentes, setRecentes] = useState([]);
  const [offres, setOffres] = useState([]);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, note: 0, revenus: 0 });
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAddOffer, setShowAddOffer] = useState(false);

  const prenom = user?.user_metadata?.prenom || 'vous';
  const initiale = prenom[0]?.toUpperCase() || 'U';

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

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
        setPrestataireId(prestData.id);

        const { data: resData, error: resErr } = await supabase
          .from('reservations')
          .select(`
            id, statut, date_debut, adresse, montant_total,
            offres!inner ( prestataire_id, titre ),
            clients ( utilisateurs ( nom, prenom ) )
          `)
          .eq('offres.prestataire_id', prestData.id)
          .order('created_at', { ascending: false })
          .limit(30);
        if (resErr) throw resErr;

        const toRow = r => ({
          id: r.id,
          client: r.clients?.utilisateurs
            ? `${r.clients.utilisateurs.prenom} ${r.clients.utilisateurs.nom}`
            : 'Client',
          service: r.offres?.titre || 'Service',
          date: formatDate(r.date_debut),
          heure: new Date(r.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          adresse: r.adresse,
          montant: r.montant_total,
        });

        const pending = (resData || []).filter(r => r.statut === 'en_attente').map(toRow);
        const active = (resData || []).filter(r => r.statut === 'confirme' || r.statut === 'en_cours').map(toRow);
        const done = (resData || []).filter(r => r.statut === 'termine').map(toRow);

        setDemandes(pending);
        setConfirmees(active);
        setRecentes(done);

        const revenus = done.reduce((s, r) => s + (r.montant || 0), 0);
        setStats({
          total: (resData || []).length,
          enAttente: pending.length,
          note: prestData.note_moyenne || 0,
          revenus,
        });

        const { data: offData, error: offErr } = await supabase
          .from('offres')
          .select('id, titre, tarif, unite_tarif, actif, services ( nom )')
          .eq('prestataire_id', prestData.id)
          .order('created_at', { ascending: false });
        if (offErr) throw offErr;
        setOffres((offData || []).map(o => ({ ...o, service: o.services?.nom || '—' })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  async function handleDecision(reservation, accepted) {
    const nouveauStatut = accepted ? 'confirme' : 'annule';
    const { error: updErr } = await supabase
      .from('reservations')
      .update({ statut: nouveauStatut })
      .eq('id', reservation.id);
    if (updErr) { showToast("Erreur lors de la mise à jour."); return; }

    setDemandes(prev => prev.filter(d => d.id !== reservation.id));
    setStats(s => ({ ...s, enAttente: Math.max(0, s.enAttente - 1) }));
    if (accepted) {
      setConfirmees(prev => [reservation, ...prev]);
      showToast('Réservation confirmée');
    } else {
      showToast('Réservation annulée');
    }
  }

  async function handleTerminer(reservation) {
    const { error: updErr } = await supabase
      .from('reservations')
      .update({ statut: 'termine' })
      .eq('id', reservation.id);
    if (updErr) { showToast("Erreur lors de la mise à jour."); return; }

    setConfirmees(prev => prev.filter(c => c.id !== reservation.id));
    setRecentes(prev => [reservation, ...prev]);
    setStats(s => ({ ...s, revenus: s.revenus + (reservation.montant || 0) }));
    showToast('Réservation marquée comme terminée');
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-[Poppins]">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1B3A6B] text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl z-50">
          {toast}
        </div>
      )}

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
            <p className="text-xs text-gray-400 mt-0.5">Revenus reçus</p>
          </div>
          <button onClick={() => setShowAddOffer(true)} disabled={!prestataireId}
            className="flex items-center gap-1.5 bg-[#3A9E3A] text-white hover:opacity-90 text-xs font-semibold px-3.5 py-2 rounded-lg transition-opacity disabled:opacity-50">
            <Icon name="plus" size={12} color="white" /> Nouvelle offre
          </button>
          <div className="relative">
            <button onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-[#1B3A6B] px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all">
              <span className="w-5 h-5 bg-[#1B3A6B] rounded-full flex items-center justify-center text-white text-[10px] font-bold">{initiale}</span>
              {prenom}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg w-44 overflow-hidden z-50">
                <Link to="/messages" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-[#1B3A6B] hover:bg-gray-50 no-underline border-b border-gray-100">
                  <Icon name="chat" size={14} color="#1B3A6B" /> Messages
                </Link>
                <Link to="/profil" onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-[#1B3A6B] hover:bg-gray-50 no-underline border-b border-gray-100">
                  <Icon name="user" size={14} color="#1B3A6B" /> Profil
                </Link>
                <button onClick={async () => { await logout(); window.location.href = '/'; }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 text-left">
                  <Icon name="logout" size={14} color="#EF4444" /> Déconnexion
                </button>
              </div>
            )}
          </div>
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

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { val: loading ? '…' : stats.total, label: 'Prestations', icon: 'file', bg: 'bg-indigo-50', ic: '#4F46E5', border: 'border-indigo-100' },
          { val: loading ? '…' : stats.enAttente, label: 'En attente', icon: 'clock', bg: 'bg-amber-50', ic: '#D97706', border: 'border-amber-100' },
          { val: loading ? '…' : (stats.note || '—'), label: 'Note globale', icon: 'star', bg: 'bg-green-50', ic: '#16A34A', border: 'border-green-100' },
        ].map((s, i) => (
          <div key={i} className={`card p-5 text-center border ${s.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
              <Icon name={s.icon} size={20} color={s.ic} />
            </div>
            <p className="text-2xl font-bold text-[#1B3A6B] mb-0 tracking-tight">{s.val}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
              {demandes.map(d => (
                <div key={d.id} className="px-6 py-4">
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
                    <div className="flex gap-2">
                      <button onClick={() => handleDecision(d, true)} className="flex items-center gap-1.5 bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        <Icon name="check" size={12} color="white" /> Confirmer
                      </button>
                      <button onClick={() => handleDecision(d, false)} className="flex items-center gap-1.5 border border-red-400 text-red-500 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                        <Icon name="x" size={12} color="#EF4444" /> Annuler
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
                      <p className="text-sm font-bold text-[#3A9E3A]">{formatCFA(p.montant)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card border-t-4 border-[#1B3A6B] overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1B3A6B] text-sm">Réservations confirmées</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : confirmees.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Icon name="check" size={36} color="#D1D5DB" />
            <p className="mt-3 text-sm">Aucune réservation confirmée en cours</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {confirmees.map(c => (
              <div key={c.id} className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#1B3A6B]">{c.client} — {c.service}</p>
                  <p className="text-xs text-gray-400">{c.date} à {c.heure} · {c.adresse}</p>
                </div>
                <button onClick={() => handleTerminer(c)}
                  className="flex items-center gap-1.5 bg-[#1B3A6B] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                  <Icon name="check" size={12} color="white" /> Marquer comme terminée
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card border-t-4 border-[#3A9E3A] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1B3A6B] text-sm">Mes offres</h2>
          <button onClick={() => setShowAddOffer(true)} disabled={!prestataireId}
            className="flex items-center gap-1.5 bg-[#3A9E3A] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50">
            <Icon name="plus" size={12} color="white" /> Ajouter
          </button>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : offres.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Icon name="tool" size={36} color="#D1D5DB" />
            <p className="mt-3 text-sm">Tu n'as encore créé aucune offre</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Titre', 'Service', 'Tarif', 'Statut'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {offres.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1B3A6B]">{o.titre}</td>
                    <td className="px-5 py-3.5"><span className="badge-blue">{o.service}</span></td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#3A9E3A]">{o.tarif} F / {o.unite_tarif}</td>
                    <td className="px-5 py-3.5">
                      <span className={o.actif ? 'badge-green' : 'badge-red'}>{o.actif ? 'Active' : 'Inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddOffer && prestataireId && (
        <AddOfferModal
          prestataireId={prestataireId}
          onClose={() => setShowAddOffer(false)}
          onCreated={(newOffer) => {
            setOffres(prev => [newOffer, ...prev]);
            setShowAddOffer(false);
            showToast('Offre créée');
          }}
        />
      )}
    </div>
  );
}