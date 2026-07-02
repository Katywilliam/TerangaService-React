import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const SERVICES_LABELS = ['Ménage complet', 'Plomberie', 'Cuisine à domicile', 'Électricité', 'Climatisation', 'Informatique'];

export default function Reservation() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ service: searchParams.get('service') || '', offre_id: '', date: '', heure: '', adresse: '', note: '' });
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const u = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    supabase.from('offres').select('id, titre, tarif').eq('actif', true).limit(12)
      .then(({ data }) => { if (data && data.length > 0) setOffres(data); });
  }, []);

  const handleConfirm = async () => {
    if (!user) { setError('Vous devez être connecté pour réserver.'); return; }
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
      setStep(3);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (step === 3) return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 py-12">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="check" size={40} color="#16A34A" />
        </div>
        <h2 className="text-2xl font-bold text-[#1B3A6B] mb-2">Réservation confirmée !</h2>
        <p className="text-gray-500 mb-6">Votre demande de <strong>{form.service}</strong> a été envoyée.</p>
        <div className="bg-gray-50 rounded-xl p-5 text-left space-y-2 mb-6">
          {[['Service', form.service],['Date', form.date],['Heure', form.heure],['Adresse', form.adresse]].map(([k,v]) => v && (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-500">{k}</span>
              <span className="font-semibold text-[#1B3A6B]">{v}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard/client" className="btn-primary"><Icon name="calendar" size={16} color="white" /> Voir mes réservations</Link>
          <Link to="/" className="border-2 border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 no-underline flex items-center gap-2">Accueil</Link>
        </div>
      </div>
    </div>
  );

  const servicesList = offres.length > 0 ? offres.map(o => o.titre) : SERVICES_LABELS;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <div className="flex items-center gap-2 mb-10">
        {[1,2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-[#3A9E3A] text-white' : 'bg-gray-200 text-gray-400'}`}>
              {step > s ? <Icon name="check" size={14} color="white" /> : s}
            </div>
            {s < 2 && <div className={`h-0.5 ${step > s ? 'bg-[#3A9E3A]' : 'bg-gray-200'}`} style={{width:80}} />}
          </div>
        ))}
        <div className="ml-auto text-sm text-gray-400">Étape {step}/2</div>
      </div>
      <div className="card p-8 border-t-4 border-[#3A9E3A] shadow-lg">
        {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5"><Icon name="alert-circle" size={16} color="#EF4444" /><p className="text-red-600 text-sm">{error}</p></div>}
        {step === 1 ? (
          <>
            <h2 className="text-xl font-bold text-[#1B3A6B] mb-6">Choisissez votre service</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Type de service</label>
                <div className="grid grid-cols-2 gap-3">
                  {servicesList.map(s => (
                    <label key={s} className={`flex items-center gap-2 px-4 py-3 border-2 rounded-xl cursor-pointer text-sm ${form.service === s ? 'border-[#3A9E3A] bg-green-50 text-[#3A9E3A] font-semibold' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      <input type="radio" name="service" value={s} checked={form.service === s} onChange={e => setForm(p => ({...p, service: e.target.value}))} className="sr-only" />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Adresse</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2"><Icon name="mappin" size={16} color="#9CA3AF" /></span>
                  <input type="text" className="form-input pl-10" placeholder="Votre adresse complète" value={form.adresse} onChange={u('adresse')} />
                </div>
              </div>
              <div>
                <label className="form-label">Note ou instructions</label>
                <textarea className="form-input resize-none" rows={3} placeholder="Instructions particulières..." value={form.note} onChange={u('note')} />
              </div>
              <button disabled={!form.service || !form.adresse} onClick={() => setStep(2)} className="w-full btn-primary justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                Continuer <Icon name="arrowright" size={16} color="white" />
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[#1B3A6B] mb-6">Choisissez la date et l'heure</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Date souhaitée</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2"><Icon name="calendar" size={16} color="#9CA3AF" /></span>
                  <input type="date" className="form-input pl-10" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={u('date')} />
                </div>
              </div>
              <div>
                <label className="form-label">Heure souhaitée</label>
                <div className="grid grid-cols-3 gap-2">
                  {['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(h => (
                    <label key={h} className={`flex items-center justify-center py-2.5 border-2 rounded-lg cursor-pointer text-sm font-medium ${form.heure === h ? 'border-[#3A9E3A] bg-green-50 text-[#3A9E3A]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      <input type="radio" name="heure" value={h} checked={form.heure === h} onChange={u('heure')} className="sr-only" />
                      {h}
                    </label>
                  ))}
                </div>
              </div>
              {form.date && form.heure && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h3 className="font-semibold text-[#1B3A6B] text-sm mb-2">Récapitulatif</h3>
                  <div className="space-y-1">
                    {[['Service',form.service],['Adresse',form.adresse],['Date',form.date],['Heure',form.heure]].map(([k,v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-[#1B3A6B]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50">Retour</button>
                <button disabled={!form.date || !form.heure || loading} onClick={handleConfirm} className="flex-1 btn-primary justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : <><Icon name="check" size={16} color="white" /> Confirmer</>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
