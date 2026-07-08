import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../public/images/logo.png';

const MAX_DIM = 256;

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Register() {
  const { register, isAuthenticated, roleLoading, userRole } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', phone: '',
    role: 'client', password: '', confirm: '',
    experience_annees: '', zone_intervention: '', bio: '',
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || roleLoading) return;
    navigate(userRole === 'prestataire' ? '/dashboard/prestataire' : '/dashboard/client', { replace: true });
  }, [isAuthenticated, roleLoading, userRole]);

  const u = k => e => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setError(null);
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError("Le fichier sélectionné doit être une image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      setPhoto(dataUrl);
    } catch {
      setError("Impossible de lire cette image.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (form.role === 'prestataire' && !form.experience_annees) {
      setError("Merci d'indiquer votre nombre d'années d'expérience.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        nom: form.nom,
        prenom: form.prenom,
        phone: form.phone,
        role: form.role,
        photo_url: photo,
        experience_annees: form.role === 'prestataire' ? form.experience_annees : null,
        zone_intervention: form.role === 'prestataire' ? form.zone_intervention : null,
        bio: form.role === 'prestataire' ? form.bio : null,
      });
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-12 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2 no-underline">
            <img src={logo} alt="Teranga Service" className="h-16 object-contain" />
          </Link>
          <p className="text-gray-500 text-sm mt-2">Créez votre compte gratuitement</p>
        </div>

        <div className="card p-9 border-t-4 border-[#3A9E3A] shadow-xl">
          <h2 className="text-2xl font-bold text-[#1B3A6B] mb-7 text-center">Créer un compte</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
              <Icon name="alert-circle" size={16} color="#EF4444" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>

            <div className="flex flex-col items-center mb-2">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-[#3A9E3A] transition-colors">
                {photo ? (
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
                  </svg>
                )}
                <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] py-0.5 text-center">
                  {photo ? 'Changer' : 'Ajouter'}
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              <p className="text-xs text-gray-400 mt-2">Photo de profil (optionnelle)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Prénom</label>
                <input type="text" className="form-input" value={form.prenom} onChange={u('prenom')} required disabled={loading} />
              </div>
              <div>
                <label className="form-label">Nom</label>
                <input type="text" className="form-input" value={form.nom} onChange={u('nom')} required disabled={loading} />
              </div>
            </div>

            <div>
              <label className="form-label">Adresse email</label>
              <input type="email" className="form-input" value={form.email} onChange={u('email')} required disabled={loading} />
            </div>

            <div>
              <label className="form-label">Téléphone</label>
              <input type="tel" className="form-input" placeholder="77 000 00 00" value={form.phone} onChange={u('phone')} required disabled={loading} />
            </div>

            <div>
              <label className="form-label">Je suis</label>
              <div className="grid grid-cols-2 gap-3">
                {[['client', 'Un client'], ['prestataire', 'Un prestataire']].map(([v, l]) => (
                  <label key={v}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all text-sm font-medium ${
                      form.role === v ? 'border-[#3A9E3A] bg-green-50 text-[#3A9E3A]' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="role" value={v} checked={form.role === v} onChange={u('role')} className="sr-only" disabled={loading} />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {form.role === 'prestataire' && (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="form-label">Années d'expérience</label>
                  <input type="number" min="0" className="form-input" value={form.experience_annees} onChange={u('experience_annees')} required disabled={loading} />
                </div>
                <div>
                  <label className="form-label">Zone d'intervention</label>
                  <input type="text" className="form-input" placeholder="Dakar, Pikine, Guédiawaye..." value={form.zone_intervention} onChange={u('zone_intervention')} required disabled={loading} />
                </div>
                <div>
                  <label className="form-label">Présentation (optionnel)</label>
                  <textarea rows={3} className="form-input" value={form.bio} onChange={u('bio')} disabled={loading} />
                </div>
              </div>
            )}

            <div>
              <label className="form-label">Mot de passe</label>
              <input type="password" className="form-input" placeholder="Min. 8 caractères" value={form.password} onChange={u('password')} required disabled={loading} />
            </div>

            <div>
              <label className="form-label">Confirmer le mot de passe</label>
              <input type="password" className="form-input" value={form.confirm} onChange={u('confirm')} required disabled={loading} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#3A9E3A] hover:bg-[#2d8a2d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors text-sm mt-2 flex items-center justify-center gap-2">
              {loading ? 'Création en cours…' : 'Créer mon compte →'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5 pt-5 border-t border-gray-100">
            Déjà un compte ?{' '}
            <Link to="/connexion" className="text-[#3A9E3A] font-semibold no-underline hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}