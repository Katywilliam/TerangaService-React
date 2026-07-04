import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icons';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', phone: '',
    role: 'client', password: '', confirm: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const u = k => e => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
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
      });
      setSuccess(true);
      // Redirection après 2 secondes
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-12 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[#1B3A6B] font-bold text-xl no-underline">
            <span className="bg-[#3A9E3A] text-white p-2 rounded-xl">
              <Icon name="home" size={18} color="white" />
            </span>
            Teranga <span className="text-[#3A9E3A]">Service</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Créez votre compte gratuitement</p>
        </div>

        <div className="card p-9 border-t-4 border-[#3A9E3A] shadow-xl">
          <h2 className="text-2xl font-bold text-[#1B3A6B] mb-7 text-center">Créer un compte</h2>

          {/* Message succès */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5">
              <Icon name="check-circle" size={16} color="#16A34A" />
              <p className="text-green-700 text-sm font-medium">
                Compte créé ! Vérifiez votre email pour confirmer votre inscription.
              </p>
            </div>
          )}

          {/* Message erreur */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
              <Icon name="alert-circle" size={16} color="#EF4444" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Prénom</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="user" size={16} color="#9CA3AF" />
                  </span>
                  <input
                    type="text" className="form-input pl-10"
                    placeholder="Prénom"
                    value={form.prenom} onChange={u('prenom')}
                    required disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Nom</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="user" size={16} color="#9CA3AF" />
                  </span>
                  <input
                    type="text" className="form-input pl-10"
                    placeholder="Nom"
                    value={form.nom} onChange={u('nom')}
                    required disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Adresse email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Icon name="mail" size={16} color="#9CA3AF" />
                </span>
                <input
                  type="email" className="form-input pl-10"
                  placeholder="votre@email.com"
                  value={form.email} onChange={u('email')}
                  required disabled={loading}
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="form-label">Téléphone</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Icon name="phone" size={16} color="#9CA3AF" />
                </span>
                <input
                  type="tel" className="form-input pl-10"
                  placeholder="77 000 00 00"
                  value={form.phone} onChange={u('phone')}
                  required disabled={loading}
                />
              </div>
            </div>

            {/* Rôle */}
            <div>
              <label className="form-label">Je suis</label>
              <div className="grid grid-cols-2 gap-3">
                {[['client', 'user', 'Un client'], ['prestataire', 'tool', 'Un prestataire']].map(([v, icon, l]) => (
                  <label key={v}
                    className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all text-sm font-medium ${
                      form.role === v
                        ? 'border-[#3A9E3A] bg-green-50 text-[#3A9E3A]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}>
                    <input type="radio" name="role" value={v}
                      checked={form.role === v} onChange={u('role')}
                      className="sr-only" disabled={loading}
                    />
                    <Icon name={icon} size={16} color={form.role === v ? '#3A9E3A' : '#9CA3AF'} />
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="form-label">Mot de passe</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Icon name="lock" size={16} color="#9CA3AF" />
                </span>
                <input
                  type="password" className="form-input pl-10"
                  placeholder="Min. 8 caractères"
                  value={form.password} onChange={u('password')}
                  required disabled={loading}
                />
              </div>
            </div>

            {/* Confirmer */}
            <div>
              <label className="form-label">Confirmer le mot de passe</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Icon name="lock" size={16} color="#9CA3AF" />
                </span>
                <input
                  type="password" className="form-input pl-10"
                  placeholder="••••••••"
                  value={form.confirm} onChange={u('confirm')}
                  required disabled={loading}
                />
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-[#3A9E3A] hover:bg-[#2d8a2d] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-lg transition-colors text-sm font-[Poppins] mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Création en cours…
                </>
              ) : success ? (
                'Compte créé !'
              ) : (
                'Créer mon compte →'
              )}
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