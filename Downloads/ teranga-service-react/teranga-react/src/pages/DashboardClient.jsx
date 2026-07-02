import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { formatCFA, formatDate, getStatutColor } from '../utils/helpers';

const FALLBACK_RESERVATIONS = [
  { service: 'Ménage complet', prestataire: 'Mamadou Sow', date: '28 juin 2026', statut: 'Confirmé', montant: '3 500 FCFA' },
  { service: 'Plomberie', prestataire: 'Omar Badji', date: '30 juin 2026', statut: 'En attente', montant: '5 000 FCFA' },
  { service: 'Cuisine à domicile', prestataire: 'Aissatou Diallo', date: '15 juin 2026', statut: 'Terminé', montant: '5 000 FCFA' },
  { service: 'Électricité', prestataire: 'Fatou Ndiaye', date: '10 juin 2026', statut: 'Terminé', montant: '5 500 FCFA' },
];

const FALLBACK_MESSAGES = [
  { from: 'Mamadou Sow', text: "Je serai chez vous demain à 8h. Bonne journée !", time: 'Il y a 2h' },
  { from: 'Support Teranga', text: "Votre demande a bien été prise en compte.", time: 'Hier' },
];

function Badge({ statut }) {
  const styles = {
    'Confirmé': 'badge-green', 'confirmé': 'badge-green',
    'En attente': 'badge-amber', 'en_attente': 'badge-amber',
    'Terminé': 'badge-blue', 'termine': 'badge-blue',
    'Annulé': 'badge-red', 'annule': 'badge-red',
    'En cours': 'badge-blue', 'en_cours': 'badge-blue',
  };
  const label = statut?.replace('_', ' ');
  return <span className={styles[statut] || 'badge-blue'}>{label}</span>;
}

export default function DashboardClient() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages] = useState(FALLBACK_MESSAGES);
  const [stats, setStats] = useState({ total: 0, enAttente: 0, note: 4.8, depense: 0 });
  const [loading, setLoading] = useState(true);

  const prenom = user?.user_metadata?.name?.split(' ')[0] || 'vous';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Récupérer le client
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('utilisateur_id', user.id)
          .single();

        if (!clientData) { setReservations(FALLBACK_RESERVATIONS); setLoading(false); return; }

        // Récupérer les réservations
        const { data: resData } = await supabase
          .from('reservations')
          .select(`
            id, statut, date_debut, montant_total,
            offres ( titre, prestataires ( utilisateurs ( nom, prenom ) ) )
          `)
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (resData && resData.length > 0) {
          setReservations(resData.map(r => ({
            service: r.offres?.titre || 'Service',
            prestataire: r.offres?.prestataires?.utilisateurs
              ? `${r.offres.prestataires.utilisateurs.prenom} ${r.offres.prestataires.utilisateurs.nom}`
              : 'Prestataire',
            date: formatDate(r.date_debut),
            statut: r.statut,
            montant: formatCFA(r.montant_total),
          })));

          const total = resData.length;
          const enAttente = resData.filter(r => r.statut === 'en_attente').length;
          const depense = resData.reduce((sum, r) => sum + (r.montant_total || 0), 0);
          setStats(s => ({ ...s, total, enAttente, depense }));
        } else {
          setReservations(FALLBACK_RESERVATIONS);
        }

        // Messages
        const { data: msgData } = await supabase
          .from('messages')
          .select('contenu, created_at, expediteur:utilisateurs!expediteur_id(nom, prenom)')
          .eq('destinataire_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (msgData && msgData.length > 0) {
          setMessages(msgData.map(m => ({
            from: `${m.expediteur?.prenom || ''} ${m.expediteur?.nom || ''}`.trim() || 'Inconnu',
            text: m.contenu,
            time: formatDate(m.created_at),
          })));
        }
      } catch (err) {
        setReservations(FALLBACK_RESERVATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-[Poppins]">

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 rounded-full bg-[#1B3A6B] flex items-center justify-center">
          <Icon name="user" size={20} color="white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A6B] mb-0">Bonjour, {prenom}</h1>
          <p className="text-sm text-gray-400 mt-0">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Link to="/services" className="ml-auto btn-primary text-sm">
          <Icon name="search" size={15} color="white" />
          Nouveau service
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { val: loading ? '…' : stats.total, label: 'Réservations', icon: 'file', bg: 'bg-indigo-50', ic: '#4F46E5' },
          { val: loading ? '…' : stats.enAttente, label: 'En attente', icon: 'clock', bg: 'bg-amber-50', ic: '#D97706' },
          { val: stats.note, label: 'Note moyenne', icon: 'star', bg: 'bg-green-50', ic: '#16A34A' },
          { val: loading ? '…' : `${Math.round(stats.depense / 1000)}K`, label: 'Dépensé (FCFA)', icon: 'dollar', bg: 'bg-blue-50', ic: '#1e40af' },
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
        {/* Réservations */}
        <div className="lg:col-span-2 card border-t-4 border-[#3A9E3A] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1B3A6B]">Mes réservations</h2>
            <Link to="/reservations" className="text-[#3A9E3A] text-xs font-semibold no-underline hover:underline flex items-center gap-1">
              Tout voir <Icon name="arrowright" size={13} color="#3A9E3A" />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
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

        {/* Messages */}
        <div className="card border-t-4 border-[#1B3A6B]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1B3A6B] text-sm">Messages</h2>
            <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{messages.length}</span>
          </div>
          <div className="px-5 py-2 divide-y divide-gray-50">
            {messages.map((m, i) => (
              <div key={i} className="py-3.5">
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
          <div className="px-5 py-4 border-t border-gray-100">
            <Link to="/messages" className="w-full flex items-center justify-center gap-2 text-sm text-[#3A9E3A] font-semibold no-underline hover:underline">
              Voir tous les messages
            </Link>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: 'calendar', label: 'Réserver', to: '/services', color: 'bg-[#3A9E3A]' },
          { icon: 'users', label: 'Prestataires', to: '/prestataires', color: 'bg-[#1B3A6B]' },
          { icon: 'bell', label: 'Notifications', to: '/notifications', color: 'bg-amber-500' },
          { icon: 'user', label: 'Mon profil', to: '/dashboard/client', color: 'bg-purple-600' },
        ].map((a, i) => (
          <Link key={i} to={a.to} className={`${a.color} text-white flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm no-underline hover:opacity-90 transition-opacity`}>
            <Icon name={a.icon} size={18} color="white" />
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
