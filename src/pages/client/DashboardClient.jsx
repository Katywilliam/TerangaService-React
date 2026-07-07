import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { sendMessage } from '../../services/messagesService';
import { formatCFA, formatDate } from '../../utils/helpers';

function Badge({ statut }) {
  const styles = {
    en_attente: 'badge-amber', confirme: 'badge-green',
    en_cours: 'badge-blue', termine: 'badge-blue',
    annule: 'badge-red', litige: 'badge-red',
  };
  const label = statut?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  return <span className={styles[statut] || 'badge-blue'}>{label}</span>;
}

function NewReservationModal({ clientId, userId, onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingOffres, setLoadingOffres] = useState(false);

  const [categorieId, setCategorieId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [offreId, setOffreId] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [adresse, setAdresse] = useState('');
  const [instructions, setInstructions] = useState('');
  const [montant, setMontant] = useState('');

  const [contactText, setContactText] = useState('');
  const [sendingContact, setSendingContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('categories').select('id, nom').eq('actif', true).order('nom').then(({ data }) => {
      setCategories(data || []);
      setLoadingCats(false);
    });
  }, []);

  useEffect(() => {
    setServiceId('');
    setOffreId('');
    setOffres([]);
    if (!categorieId) { setServices([]); return; }
    setLoadingServices(true);
    supabase.from('services').select('id, nom').eq('categorie_id', categorieId).eq('actif', true).order('nom')
      .then(({ data }) => {
        setServices(data || []);
        setLoadingServices(false);
      });
  }, [categorieId]);

  useEffect(() => {
    setOffreId('');
    setContactText('');
    setContactSent(false);
    if (!serviceId) { setOffres([]); return; }
    setLoadingOffres(true);
    supabase.from('offres')
      .select('id, titre, tarif, unite_tarif, prestataires ( zone_intervention, note_moyenne, utilisateurs ( id, nom, prenom ) )')
      .eq('service_id', serviceId)
      .eq('actif', true)
      .then(({ data }) => {
        setOffres(data || []);
        setLoadingOffres(false);
      });
  }, [serviceId]);

  useEffect(() => {
    const offre = offres.find(o => o.id === offreId);
    if (offre) setMontant(String(offre.tarif));
    setContactText('');
    setContactSent(false);
  }, [offreId]);

  async function handleContact() {
    const offre = offres.find(o => o.id === offreId);
    const prestataireUserId = offre?.prestataires?.utilisateurs?.id;
    if (!contactText.trim() || !prestataireUserId || !userId) return;
    setSendingContact(true);
    try {
      await sendMessage(userId, prestataireUserId, contactText.trim());
      setContactSent(true);
      setContactText('');
    } catch {
      setError("Impossible d'envoyer le message pour l'instant.");
    } finally {
      setSendingContact(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!offreId || !dateDebut || !adresse || !montant) {
      setError('Merci de remplir tous les champs obligatoires.');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: insErr } = await supabase
        .from('reservations')
        .insert({
          offre_id: offreId,
          client_id: clientId,
          date_debut: new Date(dateDebut).toISOString(),
          date_fin: dateFin ? new Date(dateFin).toISOString() : null,
          adresse,
          instructions: instructions || null,
          montant_total: Number(montant),
          statut: 'en_attente',
        })
        .select('id, statut, date_debut, montant_total, offres ( titre, prestataires ( utilisateurs ( nom, prenom ) ) )')
        .single();
      if (insErr) throw insErr;
      onCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#1B3A6B] text-base">Nouvelle réservation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="close" size={18} color="currentColor" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Catégorie</label>
            {loadingCats ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : (
              <select value={categorieId} onChange={e => setCategorieId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20">
                <option value="">Sélectionner une catégorie</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            )}
          </div>

          {categorieId && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Service</label>
              {loadingServices ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : services.length === 0 ? (
                <p className="text-xs text-gray-400">Aucun service dans cette catégorie pour l'instant.</p>
              ) : (
                <select value={serviceId} onChange={e => setServiceId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20">
                  <option value="">Sélectionner un service</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              )}
            </div>
          )}

          {serviceId && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Prestataire disponible</label>
              {loadingOffres ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : offres.length === 0 ? (
                <p className="text-xs text-gray-400">Aucun prestataire ne propose ce service pour l'instant.</p>
              ) : (
                <div className="space-y-2">
                  {offres.map(o => {
                    const nomPrestataire = o.prestataires?.utilisateurs
                      ? `${o.prestataires.utilisateurs.prenom} ${o.prestataires.utilisateurs.nom}`
                      : 'Prestataire';
                    return (
                      <label key={o.id}
                        className={`flex items-center justify-between gap-2 px-3 py-2.5 border-2 rounded-lg cursor-pointer text-sm transition-all ${
                          offreId === o.id ? 'border-[#3A9E3A] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <span className="flex items-center gap-2">
                          <input type="radio" name="offre" value={o.id} checked={offreId === o.id}
                            onChange={e => setOffreId(e.target.value)} className="accent-[#3A9E3A]" />
                          <span>
                            <span className="font-medium text-[#1B3A6B]">{nomPrestataire}</span>
                            <span className="text-gray-400"> — {o.prestataires?.zone_intervention || 'zone non précisée'}</span>
                          </span>
                        </span>
                        <span className="font-semibold text-[#3A9E3A] whitespace-nowrap">{o.tarif} F / {o.unite_tarif}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {offreId && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              {contactSent ? (
                <p className="text-xs text-green-700 flex items-center gap-1.5">
                  <Icon name="check" size={13} color="#16A34A" />
                  Message envoyé — la réponse arrivera dans tes Messages.
                </p>
              ) : (
                <>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Une question avant de réserver ? Contacte le prestataire</label>
                  <div className="flex gap-2">
                    <input value={contactText} onChange={e => setContactText(e.target.value)}
                      placeholder="Ex : êtes-vous disponible ce weekend ?"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20" />
                    <button type="button" onClick={handleContact} disabled={!contactText.trim() || sendingContact}
                      className="shrink-0 bg-[#1B3A6B] text-white text-xs font-semibold px-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                      {sendingContact ? '...' : 'Envoyer'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {offreId && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Date et heure de début</label>
                  <input type="datetime-local" value={dateDebut} onChange={e => setDateDebut(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Date et heure de fin (optionnel)</label>
                  <input type="datetime-local" value={dateFin} onChange={e => setDateFin(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Adresse</label>
                <input value={adresse} onChange={e => setAdresse(e.target.value)}
                  placeholder="Adresse complète de l'intervention"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Instructions (optionnel)</label>
                <textarea rows={2} value={instructions} onChange={e => setInstructions(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Montant (FCFA)</label>
                <input type="number" min="0" value={montant} onChange={e => setMontant(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A9E3A]/20" />
              </div>
            </>
          )}

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
            <button type="submit" disabled={submitting || !offreId}
              className="flex-1 bg-[#3A9E3A] text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? 'Envoi...' : 'Confirmer la réservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const { user, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, avisLaisses: 0, depense: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);

  const prenom = user?.user_metadata?.prenom || 'vous';
  const initiale = prenom[0]?.toUpperCase() || 'U';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const { data: clientData, error: clientErr } = await supabase
          .from('clients')
          .select('id')
          .eq('utilisateur_id', user.id)
          .maybeSingle();
        if (clientErr) throw clientErr;
        if (!clientData) { setError('missing_profile'); setLoading(false); return; }
        setClientId(clientData.id);

        const { data: resData, error: resErr } = await supabase
          .from('reservations')
          .select(`
            id, statut, date_debut, montant_total,
            offres ( titre, prestataires ( utilisateurs ( nom, prenom ), note_moyenne ) )
          `)
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (resErr) throw resErr;

        setReservations((resData || []).map(r => ({
          service: r.offres?.titre || 'Service',
          prestataire: r.offres?.prestataires?.utilisateurs
            ? `${r.offres.prestataires.utilisateurs.prenom} ${r.offres.prestataires.utilisateurs.nom}`
            : 'Prestataire',
          date: formatDate(r.date_debut),
          statut: r.statut,
          montant: formatCFA(r.montant_total),
        })));

        const total = (resData || []).length;
        const enAttente = (resData || []).filter(r => r.statut === 'en_attente').length;
        const depense = (resData || []).reduce((sum, r) => sum + (r.montant_total || 0), 0);

        const { count: avisCount } = await supabase
          .from('avis')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientData.id);

        setStats(s => ({ ...s, total, enAttente, depense, avisLaisses: avisCount || 0 }));

        const { data: msgData } = await supabase
          .from('messages')
          .select('id, contenu, created_at, expediteur:utilisateurs!expediteur_id(nom, prenom)')
          .eq('destinataire_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        setMessages((msgData || []).map(m => ({
          id: m.id,
          from: `${m.expediteur?.prenom || ''} ${m.expediteur?.nom || ''}`.trim() || 'Inconnu',
          text: m.contenu,
          time: formatDate(m.created_at),
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-[Poppins]">

      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 rounded-full bg-[#1B3A6B] flex items-center justify-center">
          <Icon name="user" size={20} color="white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A6B] mb-0">Bonjour, {prenom}</h1>
          <p className="text-sm text-gray-400 mt-0">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setShowReservationModal(true)} disabled={!clientId} className="btn-primary text-sm disabled:opacity-50">
            <Icon name="search" size={15} color="white" />
            Nouveau service
          </button>
          <div className="relative">
            <button onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-[#1B3A6B] px-3 py-2.5 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all">
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
          Aucun profil client n'existe pour ce compte dans la table <code>clients</code>. Contacte un administrateur pour le créer.
        </div>
      ) : error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-6">
          Impossible de charger certaines données de ton compte pour l'instant.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { val: loading ? '…' : stats.total, label: 'Réservations', icon: 'file', bg: 'bg-indigo-50', ic: '#4F46E5', border: 'border-indigo-100' },
          { val: loading ? '…' : stats.enAttente, label: 'En attente', icon: 'clock', bg: 'bg-amber-50', ic: '#D97706', border: 'border-amber-100' },
          { val: loading ? '…' : stats.avisLaisses, label: 'Avis laissés', icon: 'star', bg: 'bg-green-50', ic: '#16A34A', border: 'border-green-100' },
          { val: loading ? '…' : formatCFA(stats.depense), label: 'Dépensé', icon: 'dollar', bg: 'bg-blue-50', ic: '#1e40af', border: 'border-blue-100' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card border-t-4 border-[#3A9E3A] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1B3A6B]">Mes réservations</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Icon name="calendar" size={36} color="#D1D5DB" />
              <p className="mt-3 text-sm">Aucune réservation pour l'instant</p>
              <button onClick={() => setShowReservationModal(true)} className="text-[#3A9E3A] text-sm font-semibold hover:underline mt-1">
                Réserver un service
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-5 py-3 text-xs text-gray-500 font-semibold">Service</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-semibold">Prestataire</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-semibold hidden md:table-cell">Date</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-semibold">Statut</th>
                    <th className="px-5 py-3 text-xs text-gray-500 font-semibold hidden md:table-cell">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                      <td className="px-5 py-3.5 text-sm font-medium text-[#1B3A6B]">{r.service}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{r.prestataire}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 hidden md:table-cell">{r.date}</td>
                      <td className="px-5 py-3.5"><Badge statut={r.statut} /></td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-[#3A9E3A] hidden md:table-cell">{r.montant}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card border-t-4 border-[#1B3A6B]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1B3A6B] text-sm">Messages</h2>
            {messages.length > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{messages.length}</span>
            )}
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(2)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Icon name="chat" size={30} color="#D1D5DB" />
              <p className="mt-2 text-sm">Aucun message</p>
            </div>
          ) : (
            <div className="px-5 py-2 divide-y divide-gray-50">
              {messages.map(m => (
                <div key={m.id} className="py-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#3A9E3A] rounded-full flex items-center justify-center text-white text-xs font-bold">{m.from[0]}</div>
                      <span className="text-sm font-semibold text-[#1B3A6B]">{m.from}</span>
                    </div>
                    <span className="text-xs text-gray-400">{m.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 pl-9 truncate">{m.text}</p>
                </div>
              ))}
            </div>
          )}
          <div className="px-5 py-4 border-t border-gray-100">
            <Link to="/messages" className="w-full flex items-center justify-center gap-2 text-sm text-[#3A9E3A] font-semibold no-underline hover:underline">
              Voir tous les messages
            </Link>
          </div>
        </div>
      </div>

      {showReservationModal && clientId && (
        <NewReservationModal
          clientId={clientId}
          userId={user?.id}
          onClose={() => setShowReservationModal(false)}
          onCreated={(newRes) => {
            setReservations(prev => [{
              service: newRes.offres?.titre || 'Service',
              prestataire: newRes.offres?.prestataires?.utilisateurs
                ? `${newRes.offres.prestataires.utilisateurs.prenom} ${newRes.offres.prestataires.utilisateurs.nom}`
                : 'Prestataire',
              date: formatDate(newRes.date_debut),
              statut: newRes.statut,
              montant: formatCFA(newRes.montant_total),
            }, ...prev]);
            setStats(s => ({ ...s, total: s.total + 1, enAttente: s.enAttente + 1 }));
            setShowReservationModal(false);
          }}
        />
      )}
    </div>
  );
}