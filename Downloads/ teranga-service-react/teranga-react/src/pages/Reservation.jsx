import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const SERVICES = [
  { titre: 'Ménage complet', tarif: 3500 },
  { titre: 'Plomberie', tarif: 5000 },
  { titre: 'Cuisine à domicile', tarif: 5000 },
  { titre: 'Électricité', tarif: 5500 },
  { titre: 'Climatisation', tarif: 6000 },
  { titre: 'Informatique', tarif: 4500 },
];

export default function Reservation() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ service: searchParams.get('service') || '', date: '', heure: '', adresse: '', note: '' });
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const u = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    supabase.from('offres').select('id, titre, tarif').eq('actif', true).limit(20)
      .then(({ data }) => { if (data && data.length > 0) setOffres(data); });
  }, []);

  const selectedTarif = () => {
    const o = offres.find(o => o.titre === form.service);
    if (o) return o.tarif;
    return SERVICES.find(s => s.titre === form.service)?.tarif || 5000;
  };

  const handleConfirm = async () => {
    if (!user) { setError('Vous devez être connecté pour réserver.'); return; }
    if (!form.service || !form.date || !form.heure || !form.adresse) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true); setError(null);
    try {
      const { data: clientData } = await supabase.from('clients').select('id').eq('utilisateur_id', user.id).single();
      if (!clientData) throw new Error('Profil client introuvable.');
      const offre = offres.find(o => o.titre === form.service) || offres[0];
      if (!offre) throw new Error('Aucune offre disponible.');
      const { error: resError } = await supabase.from('reservations').insert([{
        offre_id: offre.id, client_id: clientData.id,
        date_debut: new Date(`${form.date}T${form.heure}:00`).toISOString(),
        adresse: form.adresse, instructions: form.note || null,
        montant_total: offre.tarif || 5000, statut: 'en_attente',
      }]);
      if (resError) throw resError;
      setDone(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-12">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="check" size={40} color="#16A34A" />
        </div>
        <h2 className="text-2xl font-bold text-[#1B3A6B] mb-2">Réservation confirmée !</h2>
        <p className="text-gray-500 mb-6">Votre demande de <strong>{form.service}</strong> a été envoyée.</p>
        <div className="bg-gray-50 rounded-xl p-5 text-left space-y-2 mb-6">
          {[['Service', form.service],['Date', form.date],['Heure', form.heure],['Adresse', form.adresse],['Montant', `${selectedTarif().toLocaleString('fr-FR')} FCFA`]].map(([k,v]) => v && (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-semibold text-[#1B3A6B]">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard/client" className="btn-primary"><Icon name="calendar" size={16} color="white" /> Mes réservations</Link>
          <Link to="/" className="border-2 border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 no-underline flex items-center gap-2">Accueil</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-2">Réserver un service</h1>
        <p className="text-gray-500 text-sm">Remplissez le formulaire pour confirmer votre réservation</p>
      </div>
      <div className="card p-8 border-t-4 border-[#3A9E3A] shadow-lg space-y-5">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <Icon name="alert-circle" size={16} color="#EF4444" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div>
          <label className="form-label">Type de service *</label>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map(s => (
              <label key={s.titre} className={`flex flex-col px-4 py-3 border-2 rounded-xl cursor-pointer transition-all ${form.service === s.titre ? 'border-[#3A9E3A] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="service" value={s.titre} checked={form.service === s.titre} onChange={e => setForm(p => ({...p, service: e.target.value}))} className="sr-only" />
                <span className={`text-sm font-semibold ${form.service === s.titre ? 'text-[#3A9E3A]' : 'text-gray-700'}`}>{s.titre}</span>
                <span className="text-xs text-gray-400 mt-0.5">{s.tarif.toLocaleString('fr-FR')} FCFA</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Date *</label>
            <input type="date" className="form-input" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={u('date')} />
          </div>
          <div>
            <label className="form-label">Heure *</label>
            <select className="form-input cursor-pointer" value={form.heure} onChange={u('heure')}>
              <option value="">-- Choisir --</option>
              {['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="form-label">Adresse *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2"><Icon name="mappin" size={16} color="#9CA3AF" /></span>
            <input type="text" className="form-input pl-10" placeholder="Ex: Rue 10, Mermoz, Dakar" value={form.adresse} onChange={u('adresse')} />
          </div>
        </div>
        <div>
          <label className="form-label">Instructions <span className="text-gray-400 text-xs">(optionnel)</span></label>
          <textarea className="form-input resize-none" rows={3} placeholder="Ex: 3ème étage, code 1234..." value={form.note} onChange={u('note')} />
        </div>
        {form.service && form.date && form.heure && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-semibold text-[#1B3A6B] text-sm mb-2">Récapitulatif</h3>
            <div className="space-y-1">
              {[['Service', form.service],['Date', form.date],['Heure', form.heure],['Montant', `${selectedTarif().toLocaleString('fr-FR')} FCFA`]].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-[#1B3A6B]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button onClick={handleConfirm} disabled={loading || !form.service || !form.date || !form.heure || !form.adresse}
          className="w-full btn-primary justify-center py-3.5 disabled:opacity-50 disabled:cursor-not-allowed text-base">
          {loading
            ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>
            : <><Icon name="check" size={18} color="white" /> Confirmer la réservation</>
          }
        </button>
      </div>
    </div>
  );
}