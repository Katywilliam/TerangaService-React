import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/helpers';

export default function Profil() {
  const { user, userRole, logout } = useAuth();
  const [profil, setProfil] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dashboardLink = userRole === 'admin' ? '/admin/dashboard'
    : userRole === 'prestataire' ? '/dashboard/prestataire'
    : '/dashboard/client';

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }

  function TopBar() {
    return (
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link to={dashboardLink} className="text-sm text-[#1B3A6B] font-medium no-underline hover:underline">
          ← Retour au dashboard
        </Link>
        <div className="flex items-center gap-5">
          <Link to="/messages" className="text-sm text-[#1B3A6B] font-medium no-underline hover:underline">
            Messages
          </Link>
          <button onClick={handleLogout} className="text-sm text-red-500 font-medium hover:underline">
            Déconnexion
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchProfil = async () => {
      if (!user) return;
      try {
        const { data: u, error: uErr } = await supabase
          .from('utilisateurs')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (uErr) throw uErr;
        setProfil(u);

        if (userRole === 'prestataire') {
          const { data: p } = await supabase
            .from('prestataires')
            .select('bio, experience_annees, zone_intervention, note_moyenne, nb_avis, verifie')
            .eq('utilisateur_id', user.id)
            .maybeSingle();
          setDetails(p);
        } else if (userRole === 'client') {
          const { data: c } = await supabase
            .from('clients')
            .select('created_at')
            .eq('utilisateur_id', user.id)
            .maybeSingle();
          setDetails(c);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, [user, userRole]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-green-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !profil) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">
          Impossible de charger votre profil pour l'instant.
        </div>
      </div>
    );
  }

  const roleLabel = { client: 'Client', prestataire: 'Prestataire', admin: 'Administrateur' }[profil.role] || profil.role;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="card p-8 border-t-4 border-[#3A9E3A]">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
            {profil.photo_url ? (
              <img src={profil.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
              </svg>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B3A6B] mb-0.5">{profil.prenom} {profil.nom}</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-[#3A9E3A]">{roleLabel}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-sm font-medium text-[#1B3A6B]">{profil.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Téléphone</p>
              <p className="text-sm font-medium text-[#1B3A6B]">{profil.telephone || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Ville</p>
              <p className="text-sm font-medium text-[#1B3A6B]">{profil.ville || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Membre depuis</p>
              <p className="text-sm font-medium text-[#1B3A6B]">{formatDate(profil.created_at)}</p>
            </div>
          </div>

          {userRole === 'prestataire' && details && (
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Années d'expérience</p>
                  <p className="text-sm font-medium text-[#1B3A6B]">{details.experience_annees ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Zone d'intervention</p>
                  <p className="text-sm font-medium text-[#1B3A6B]">{details.zone_intervention || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Note moyenne</p>
                  <p className="text-sm font-medium text-[#1B3A6B]">{details.note_moyenne || 0} / 5 ({details.nb_avis || 0} avis)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Statut</p>
                  <p className="text-sm font-medium text-[#1B3A6B]">{details.verifie ? 'Vérifié' : 'Non vérifié'}</p>
                </div>
              </div>
              {details.bio && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Présentation</p>
                  <p className="text-sm text-gray-600">{details.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}