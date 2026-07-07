import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icons';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { formatCFA, formatDate } from '../../utils/helpers';
import { createAdmin, generateTempPassword } from '../../services/admin/adminUsersService';

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

function Avatar({ nom }) {
  const initials = nom
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase())
    .join('');
  return (
    <div className="w-9 h-9 rounded-full bg-[#1B3A6B]/10 text-[#1B3A6B] flex items-center justify-center text-xs font-bold shrink-0">
      {initials || '?'}
    </div>
  );
}

function AddAdminModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', password: generateTempPassword() });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.nom || !form.prenom || !form.email || !form.password) {
      setError('Merci de remplir au minimum le nom, le prénom, l\'email et le mot de passe.');
      return;
    }
    setSubmitting(true);
    try {
      await createAdmin(form);
      onCreated({
        id: null,
        nom: `${form.prenom} ${form.nom}`.trim(),
        email: form.email,
        role: 'admin',
        statut: 'actif',
        date: formatDate(new Date().toISOString()),
      }, { email: form.email, password: form.password });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyPassword() {
    navigator.clipboard?.writeText(form.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#1B3A6B] text-base">Ajouter un administrateur</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="close" size={18} color="currentColor" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Prénom</label>
              <input value={form.prenom} onChange={e => update('prenom', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Nom</label>
              <input value={form.nom} onChange={e => update('nom', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Téléphone (optionnel)</label>
            <input value={form.telephone} onChange={e => update('telephone', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Mot de passe temporaire</label>
            <div className="flex gap-2">
              <input value={form.password} onChange={e => update('password', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
              <button type="button" onClick={copyPassword}
                className="shrink-0 text-xs px-3 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">À transmettre au nouvel admin ; il pourra le changer après connexion.</p>
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
              className="flex-1 bg-[#1B3A6B] text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {submitting ? 'Création...' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddServiceModal({ onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ categorie_id: '', nouvelle_categorie: '', nom: '', description: '' });
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('categories').select('id, nom').order('nom').then(({ data }) => {
      setCategories(data || []);
      setLoadingCats(false);
    });
  }, []);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.nom || (!form.categorie_id && !form.nouvelle_categorie)) {
      setError('Merci de renseigner le nom du service et une catégorie.');
      return;
    }
    setSubmitting(true);
    try {
      let categorieId = form.categorie_id;
      let categorieNom = categories.find(c => c.id === form.categorie_id)?.nom;

      if (!categorieId && form.nouvelle_categorie) {
        const { data: newCat, error: catErr } = await supabase
          .from('categories')
          .insert({ nom: form.nouvelle_categorie })
          .select('id, nom')
          .single();
        if (catErr) throw catErr;
        categorieId = newCat.id;
        categorieNom = newCat.nom;
      }

      const { data: service, error: svcErr } = await supabase
        .from('services')
        .insert({ categorie_id: categorieId, nom: form.nom, description: form.description || null })
        .select('id, nom, description, actif')
        .single();
      if (svcErr) throw svcErr;

      onCreated({ ...service, categorie: categorieNom });
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
          <h3 className="font-bold text-[#1B3A6B] text-base">Ajouter un service</h3>
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
              <select value={form.categorie_id} onChange={e => update('categorie_id', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20">
                <option value="">— Nouvelle catégorie —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            )}
          </div>

          {!form.categorie_id && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Nom de la nouvelle catégorie</label>
              <input value={form.nouvelle_categorie} onChange={e => update('nouvelle_categorie', e.target.value)}
                placeholder="Ex : Ménage, Plomberie, Jardinage"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Nom du service</label>
            <input value={form.nom} onChange={e => update('nom', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Description (optionnel)</label>
            <textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20" />
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
              {submitting ? 'Création...' : 'Créer le service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [toast, setToast] = useState('');
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({
    clients: 0, prestataires: 0, reservations: 0, revenus: 0,
    revenusPotentiels: 0, tauxCompletion: 0, panierMoyen: 0,
    parStatut: {}, topServices: [], usersActifs: 0, usersTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminCreds, setNewAdminCreds] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [services, setServices] = useState([]);
  const [showAddService, setShowAddService] = useState(false);

  const prenom = user?.user_metadata?.prenom || 'Admin';
  const initiale = prenom[0]?.toUpperCase() || 'A';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: utilData, error: utilErr } = await supabase
          .from('utilisateurs')
          .select('id, nom, prenom, email, role, actif, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        if (utilErr) throw utilErr;

        setUsers((utilData || []).map(u => ({
          id: u.id,
          nom: `${u.prenom} ${u.nom}`.trim(),
          email: u.email,
          role: u.role,
          statut: u.actif ? 'actif' : 'en_attente',
          date: formatDate(u.created_at),
        })));

        const { count: clientsCount } = await supabase
          .from('utilisateurs').select('id', { count: 'exact', head: true }).eq('role', 'client');
        const { count: prestatairesCount } = await supabase
          .from('utilisateurs').select('id', { count: 'exact', head: true }).eq('role', 'prestataire');
        const { count: usersActifsCount } = await supabase
          .from('utilisateurs').select('id', { count: 'exact', head: true }).eq('actif', true);
        const { count: usersTotalCount } = await supabase
          .from('utilisateurs').select('id', { count: 'exact', head: true });

        setStats(s => ({
          ...s,
          clients: clientsCount || 0,
          prestataires: prestatairesCount || 0,
          usersActifs: usersActifsCount || 0,
          usersTotal: usersTotalCount || 0,
        }));

        const { data: allRes, error: allResErr } = await supabase
          .from('reservations')
          .select(`
            id, statut, montant_total, created_at,
            offres ( titre, prestataires ( utilisateurs ( nom, prenom ) ) ),
            clients ( utilisateurs ( nom, prenom ) )
          `)
          .order('created_at', { ascending: false })
          .limit(200);
        if (allResErr) throw allResErr;

        const rows = allRes || [];
        setReservations(rows.slice(0, 5).map(r => ({
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

        const parStatut = rows.reduce((acc, r) => {
          acc[r.statut] = (acc[r.statut] || 0) + 1;
          return acc;
        }, {});
        const termine = rows.filter(r => r.statut === 'termine');
        const revenus = termine.reduce((s, r) => s + (r.montant_total || 0), 0);
        const revenusPotentiels = rows
          .filter(r => r.statut !== 'annule')
          .reduce((s, r) => s + (r.montant_total || 0), 0);
        const tauxCompletion = rows.length ? Math.round((termine.length / rows.length) * 100) : 0;
        const panierMoyen = termine.length ? Math.round(revenus / termine.length) : 0;

        const serviceCounts = rows.reduce((acc, r) => {
          const nom = r.offres?.titre || 'Service';
          acc[nom] = (acc[nom] || 0) + 1;
          return acc;
        }, {});
        const topServices = Object.entries(serviceCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([nom, count]) => ({ nom, count }));

        setStats(s => ({
          ...s,
          reservations: rows.length,
          revenus,
          revenusPotentiels,
          tauxCompletion,
          panierMoyen,
          parStatut,
          topServices,
        }));

        const { data: svcData, error: svcErr } = await supabase
          .from('services')
          .select('id, nom, description, actif, categories ( nom )')
          .order('created_at', { ascending: false });
        if (svcErr) throw svcErr;
        setServices((svcData || []).map(s => ({
          id: s.id,
          nom: s.nom,
          description: s.description,
          actif: s.actif,
          categorie: s.categories?.nom || '—',
        })));
      } catch (err) {
        setError(err.message);
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

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-[Poppins]">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1B3A6B] text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl z-50 flex items-center gap-2 animate-[fadeIn_0.2s_ease-out]">
          <Icon name="check" size={14} color="white" />
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="w-12 h-12 bg-gradient-to-br from-[#1B3A6B] to-[#2c5aa0] rounded-xl flex items-center justify-center shadow-sm shadow-[#1B3A6B]/20">
          <Icon name="shield" size={22} color="white" />
        </div>
        <div className="mr-auto">
          <h1 className="text-xl font-bold text-[#1B3A6B] mb-0 leading-tight">Administration</h1>
          <p className="text-sm text-gray-400 mt-0.5">Vue d'ensemble de l'activité de la plateforme</p>
        </div>
        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Icon name="shield" size={12} color="#92400e" /> Admin
        </span>
        <button onClick={() => setShowAddAdmin(true)}
          className="flex items-center gap-1.5 bg-[#1B3A6B] text-white hover:opacity-90 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-opacity">
          <Icon name="plus" size={12} color="white" /> Ajouter un admin
        </button>
        <div className="relative">
          <button onClick={() => setShowUserMenu(v => !v)}
            className="flex items-center gap-2 bg-gray-100 border border-gray-200 text-[#1B3A6B] px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-200 transition-all">
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
              <button onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 text-left">
                <Icon name="logout" size={14} color="#EF4444" /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          {
            val: loading ? null : formatCFA(stats.revenus), label: 'Revenus encaissés',
            sub: loading ? '' : `${stats.parStatut.termine || 0} prestations terminées`,
            icon: 'dollar', bg: 'bg-green-50', ic: '#16A34A', border: 'border-green-100',
          },
          {
            val: loading ? null : `${stats.tauxCompletion}%`, label: 'Taux de complétion',
            sub: loading ? '' : `${stats.reservations} réservations au total`,
            icon: 'check', bg: 'bg-blue-50', ic: '#1e40af', border: 'border-blue-100',
          },
          {
            val: loading ? null : formatCFA(stats.panierMoyen), label: 'Panier moyen',
            sub: 'par prestation terminée',
            icon: 'file', bg: 'bg-purple-50', ic: '#4c1d95', border: 'border-purple-100',
          },
          {
            val: loading ? null : `${stats.usersActifs}/${stats.usersTotal}`, label: 'Utilisateurs actifs',
            sub: loading ? '' : `${stats.clients} clients · ${stats.prestataires} prestataires`,
            icon: 'users', bg: 'bg-amber-50', ic: '#D97706', border: 'border-amber-100',
          },
        ].map((s, i) => (
          <div key={i} className={`card p-5 border ${s.border} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3.5`}>
              <Icon name={s.icon} size={20} color={s.ic} />
            </div>
            {loading ? (
              <div className="h-7 w-16 bg-gray-100 rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-[#1B3A6B] mb-0 tracking-tight">{s.val}</p>
            )}
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
            {!loading && s.sub && <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-6 border-t-4 border-[#1B3A6B]">
          <h2 className="font-bold text-[#1B3A6B] text-sm tracking-wide mb-4">Réservations par statut</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : stats.reservations === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Aucune réservation pour l'instant</p>
          ) : (
            <div className="space-y-3">
              {[
                { key: 'en_attente', label: 'En attente', color: 'bg-amber-400' },
                { key: 'confirme', label: 'Confirmée', color: 'bg-blue-400' },
                { key: 'en_cours', label: 'En cours', color: 'bg-blue-500' },
                { key: 'termine', label: 'Terminée', color: 'bg-[#3A9E3A]' },
                { key: 'annule', label: 'Annulée', color: 'bg-red-400' },
              ].map(row => {
                const count = stats.parStatut[row.key] || 0;
                const pct = stats.reservations ? Math.round((count / stats.reservations) * 100) : 0;
                if (count === 0) return null;
                return (
                  <div key={row.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600">{row.label}</span>
                      <span className="text-gray-400">{count} · {pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6 border-t-4 border-[#3A9E3A]">
          <h2 className="font-bold text-[#1B3A6B] text-sm tracking-wide mb-4">Services les plus demandés</h2>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : stats.topServices.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Pas encore de données</p>
          ) : (
            <div className="space-y-3">
              {stats.topServices.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-50 text-[#3A9E3A] flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1B3A6B] truncate">{s.nom}</p>
                    <p className="text-xs text-gray-400">{s.count} réservation{s.count > 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          <Icon name="alert" size={16} color="#DC2626" />
          Impossible de charger certaines données pour l'instant.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card border-t-4 border-[#3A9E3A] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-[#1B3A6B] text-sm tracking-wide">Réservations récentes</h2>
            {!loading && reservations.length > 0 && (
              <span className="text-xs text-gray-400 font-medium">{reservations.length} affichée{reservations.length > 1 ? 's' : ''}</span>
            )}
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <Icon name="calendar" size={36} color="#D1D5DB" />
              <p className="mt-3 text-sm font-medium">Aucune réservation pour l'instant</p>
              <p className="text-xs text-gray-300 mt-1">Les nouvelles réservations apparaîtront ici</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Client', 'Service', 'Prestataire', 'Montant', 'Statut'].map(h => (
                      <th key={h} className="px-5 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors last:border-0">
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

        <div className="space-y-4">
          <div className="card p-5 border-t-4 border-[#1B3A6B]">
            <h2 className="font-bold text-[#1B3A6B] text-sm tracking-wide mb-4">Actions rapides</h2>
            <div className="space-y-2">
              <button onClick={() => setShowAddService(true)}
                className="bg-[#3A9E3A] text-white flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm hover:opacity-90 hover:shadow-sm transition-all text-left">
                <Icon name="tool" size={16} color="white" />
                Ajouter un service
              </button>
              <button onClick={() => setShowAddAdmin(true)}
                className="bg-[#1B3A6B] text-white flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium text-sm hover:opacity-90 hover:shadow-sm transition-all text-left">
                <Icon name="users" size={16} color="white" />
                Ajouter un admin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-t-4 border-[#1B3A6B] overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-[#1B3A6B] text-sm tracking-wide">Services proposés</h2>
          <button onClick={() => setShowAddService(true)}
            className="flex items-center gap-1.5 bg-[#3A9E3A] text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
            <Icon name="plus" size={12} color="white" /> Ajouter
          </button>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : services.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <Icon name="tool" size={36} color="#D1D5DB" />
            <p className="mt-3 text-sm font-medium">Aucun service pour l'instant</p>
            <p className="text-xs text-gray-300 mt-1">Ajoute le premier service pour que les prestataires puissent créer des offres</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Service', 'Catégorie', 'Description', 'Statut'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors last:border-0">
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1B3A6B]">{s.nom}</td>
                    <td className="px-5 py-3.5"><span className="badge-blue">{s.categorie}</span></td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 max-w-xs truncate">{s.description || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={s.actif ? 'badge-green' : 'badge-red'}>{s.actif ? 'Actif' : 'Inactif'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card border-t-4 border-[#3A9E3A] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-[#1B3A6B] text-sm tracking-wide">Utilisateurs récents</h2>
          {!loading && users.length > 0 && (
            <span className="text-xs text-gray-400 font-medium">{users.length} affiché{users.length > 1 ? 's' : ''}</span>
          )}
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <Icon name="users" size={36} color="#D1D5DB" />
            <p className="mt-3 text-sm font-medium">Aucun utilisateur inscrit pour l'instant</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Nom', 'Email', 'Rôle', 'Statut', 'Date inscription', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar nom={u.nom} />
                        <span className="font-medium text-sm text-[#1B3A6B]">{u.nom}</span>
                      </div>
                    </td>
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

      {showAddAdmin && (
        <AddAdminModal
          onClose={() => setShowAddAdmin(false)}
          onCreated={(newUser, creds) => {
            setUsers(prev => [newUser, ...prev]);
            setShowAddAdmin(false);
            setNewAdminCreds(creds);
          }}
        />
      )}

      {showAddService && (
        <AddServiceModal
          onClose={() => setShowAddService(false)}
          onCreated={(newService) => {
            setServices(prev => [{ ...newService, categorie: newService.categorie }, ...prev]);
            setShowAddService(false);
            setToast('Service ajouté');
            setTimeout(() => setToast(''), 3000);
          }}
        />
      )}

      {newAdminCreds && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="check" size={22} color="#16A34A" />
            </div>
            <h3 className="font-bold text-[#1B3A6B] mb-1">Administrateur créé</h3>
            <p className="text-sm text-gray-500 mb-4">Transmettez ces identifiants au nouvel admin.</p>
            <div className="bg-gray-50 rounded-xl p-3 text-left text-sm mb-4 space-y-1">
              <p><span className="text-gray-400">Email : </span><span className="font-mono">{newAdminCreds.email}</span></p>
              <p><span className="text-gray-400">Mot de passe : </span><span className="font-mono">{newAdminCreds.password}</span></p>
            </div>
            <button onClick={() => setNewAdminCreds(null)}
              className="w-full bg-[#1B3A6B] text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity">
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}