import { useState, useEffect } from 'react';
import Icon from '../components/Icons';
import { supabase } from '../services/supabase';
import { formatCFA, formatDate } from '../utils/helpers';

const FALLBACK_USERS = [
  { nom: 'Aminata Ba', email: 'aminata@email.com', role: 'client', statut: 'actif', date: '15 juin 2026' },
  { nom: 'Mamadou Sow', email: 'mamadou@email.com', role: 'prestataire', statut: 'actif', date: '10 juin 2026' },
  { nom: 'Fatou Ndiaye', email: 'fatou@email.com', role: 'prestataire', statut: 'en_attente', date: '28 juin 2026' },
];

const FALLBACK_RESERVATIONS = [
  { id: '#1042', client: 'Aminata Ba', service: 'Ménage', prestataire: 'Mamadou Sow', montant: '3 500', statut: 'confirme' },
  { id: '#1043', client: 'Moussa Diop', service: 'Plomberie', prestataire: 'Omar Badji', montant: '5 000', statut: 'en_cours' },
  { id: '#1044', client: 'Ndèye Fall', service: 'Électricité', prestataire: 'Fatou Ndiaye', montant: '5 500', statut: 'en_attente' },
];

function Badge({ s }) {
  const map = {
    actif: 'badge-green', client: 'badge-green', confirme: 'badge-green',
    en_attente: 'badge-amber', prestataire: 'badge-blue',
    en_cours: 'badge-blue', termine: 'badge-blue',
    annule: 'badge-red', admin: 'badge-red',
  };
  const labels = {
    actif: 'Actif', client: 'Client', confirme: 'Confirmé',
    en_attente: 'En attente', prestataire: 'Prestataire',
    en_cours: 'En cours', termine: 'Terminé', annule: 'Annulé',
  };
  return <span className={map[s] || 'badge-blue'}>{labels[s] || s}</span>;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('semaine');
  const [toast, setToast] = useState('');
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({ clients: 0, prestataires: 0, reservations: 0, revenus: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Stats utilisateurs
        const { data: utilData } = await supabase
          .from('utilisateurs')
          .select('id, nom, prenom, email, role, actif, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        if (utilData && utilData.length > 0) {
          setUsers(utilData.map(u => ({
            id: u.id,
            nom: `${u.prenom} ${u.nom}`.trim(),
            email: u.email,
            role: u.role,
            statut: u.actif ? 'actif' : 'en_attente',
            date: formatDate(u.created_at),
          })));
          setStats(s => ({
            ...s,
            clients: utilData.filter(u => u.role === 'client').length,
            prestataires: utilData.filter(u => u.role === 'prestataire').length,
          }));
        } else {
          setUsers(FALLBACK_USERS);
        }

        // Réservations
        const { data: resData } = await supabase
          .from('reservations')
          .select(`
            id, statut, montant_total,
            offres ( titre, prestataires ( utilisateurs ( nom, prenom ) ) ),
            clients ( utilisateurs ( nom, prenom ) )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (resData && resData.length > 0) {
          setReservations(resData.map(r => ({
            id: `#${r.id.slice(-4).toUpperCase()}`,
            client: r.clients?.utilisateurs
              ? `${r.clients.utilisateurs.prenom} ${r.clients.utilisateurs.nom}`
              : 'Client',
            service: r.offres?.titre || 'Service',
            prestataire: r.offres?.prestataires?.utilisateurs
              ? `${r.offres.prestataires.utilisateurs.prenom} ${r.offres.prestataires.utilisateurs.nom}`
              : 'Prestataire',
            montant: String(r.montant_total),
            statut: r.statut,
          })));
          const revenus = resData.reduce((s, r) => s + (r.montant_total || 0), 0);
          setStats(s => ({ ...s, reservations: resData.length, revenus }));
        } else {
          setReservations(FALLBACK_RESERVATIONS);
        }
      } catch {
        setUsers(FALLBACK_USERS);
        setReservations(FALLBACK_RESERVATIONS);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  async function approve(user) {
    setToast(`${user.nom} approuvé`);
    setTimeout(() => setToast(''), 3000);
    if (user.id) {
      await supabase.from('utilisateurs').update({ actif: true }).eq('id', user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, statut: 'actif' } : u));
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-[Poppins]">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1B3A6B] text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <div className="w-12 h-12 bg-[#1B3A6B] rounded-xl flex items-center justify-center">
          <Icon name="shield" size={22} color="white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B3A6B] mb-0">Administration</h1>
          <p className="text-sm text-gray-400 mt-0">Gérez votre plateforme Teranga Service</p>
        </div>
        <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
          <Icon name="shield" size={12} color="#92400e" /> Admin
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { val: loading ? '…' : stats.clients, label: 'Clients', icon: 'users', bg: 'bg-blue-50', ic: '#1e40af', trend: '+12%' },
          { val: loading ? '…' : stats.prestataires, label: 'Prestataires', icon: 'tool', bg: 'bg-green-50', ic: '#16A34A', trend: '+5%' },
          { val: loading ? '…' : stats.reservations, label: 'Réservations', icon: 'calendar', bg: 'bg-purple-50', ic: '#4c1d95', trend: '+18%' },
          { val: loading ? '…' : formatCFA(stats.revenus), label: 'Revenus', icon: 'dollar', bg: 'bg-amber-50', ic: '#D97706', trend: '+24%' },
        ].map((s, i) => (
          <div key={i} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                <Icon name={s.icon} size={20} color={s.ic} />
              </div>
              <span className="badge-green text-[10px]">{s.trend}</span>
            </div>
            <p className="text-2xl font-bold text-[#1B3A6B] mb-0">{s.val}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Réservations */}
        <div className="lg:col-span-2 card border-t-4 border-[#3A9E3A] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1B3A6B] text-sm">Réservations récentes</h2>
            <div className="flex gap-1">
              {['semaine', 'mois', 'annee'].map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${tab === t ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {t === 'semaine' ? 'Semaine' : t === 'mois' ? 'Mois' : 'Année'}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table>
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Client', 'Service', 'Prestataire', 'Montant', 'Statut'].map(h => (
                      <th key={h} className="px-5 py-3 text-xs text-gray-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 last:border-0">
                      <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">{r.id}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-[#1B3A6B]">{r.client}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{r.service}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{r.prestataire}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-[#3A9E3A]">{r.montant} F</td>
                      <td className="px-5 py-3.5"><Badge s={r.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions + Litiges */}
        <div className="space-y-4">
          <div className="card p-5 border-t-4 border-[#1B3A6B]">
            <h2 className="font-bold text-[#1B3A6B] text-sm mb-4">Actions rapides</h2>
            {[
              { label: 'Gérer les utilisateurs', icon: 'users', color: 'bg-[#1B3A6B]' },
              { label: 'Gérer les services', icon: 'tool', color: 'bg-[#3A9E3A]' },
              { label: 'Voir les réservations', icon: 'calendar', color: 'bg-purple-600' },
              { label: 'Signalements', icon: 'bell', color: 'bg-red-500' },
            ].map((a, i) => (
              <button key={i} className={`${a.color} text-white flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm mb-2 hover:opacity-90 transition-opacity text-left`}>
                <Icon name={a.icon} size={16} color="white" />
                {a.label}
              </button>
            ))}
          </div>
          <div className="card p-5 border-t-4 border-amber-400">
            <h2 className="font-bold text-[#1B3A6B] text-sm mb-3">Litiges actifs</h2>
            {[
              { id: '#L-021', desc: 'Prestataire absent', urgence: 'Haute' },
              { id: '#L-022', desc: 'Qualité insuffisante', urgence: 'Normale' },
            ].map((l, i) => (
              <div key={i} className="border border-red-100 rounded-lg px-4 py-3 mb-2 bg-red-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs text-gray-400">{l.id}</span>
                  <span className={`text-xs font-semibold ${l.urgence === 'Haute' ? 'text-red-600' : 'text-amber-600'}`}>{l.urgence}</span>
                </div>
                <p className="text-sm text-gray-700">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Utilisateurs */}
      <div className="card border-t-4 border-[#3A9E3A] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#1B3A6B] text-sm">Utilisateurs récents</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead className="bg-gray-50">
                <tr>
                  {['Nom', 'Email', 'Rôle', 'Statut', 'Date inscription', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs text-gray-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 last:border-0">
                    <td className="px-5 py-3.5 font-medium text-sm text-[#1B3A6B]">{u.nom}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5"><Badge s={u.role} /></td>
                    <td className="px-5 py-3.5"><Badge s={u.statut} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{u.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        {u.statut === 'en_attente' && (
                          <button onClick={() => approve(u)} className="text-xs bg-[#3A9E3A] text-white px-2.5 py-1 rounded-md font-medium hover:bg-[#2d8a2d] transition-colors">
                            Approuver
                          </button>
                        )}
                        <button className="text-xs border border-gray-300 text-gray-500 px-2.5 py-1 rounded-md font-medium hover:bg-gray-50 transition-colors">
                          Voir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
