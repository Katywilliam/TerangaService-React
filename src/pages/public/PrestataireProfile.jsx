import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../../components/Icons';
import { supabase } from '../../services/supabase';
import { formatCFA } from '../../utils/helpers';

const FALLBACK = {
  nom: 'Mamadou Sow', metier: 'Spécialiste ménage', ville: 'Plateau, Dakar',
  bio: "Professionnel du ménage depuis 3 ans. Ponctualité et discrétion garanties.",
  note: 4.9, nb_avis: 127, experience: 3, prestations: 200, photo: null,
  offres: [
    { titre: 'Ménage complet', tarif: 3500, unite_tarif: 'heure' },
    { titre: 'Repassage', tarif: 2000, unite_tarif: 'heure' },
    { titre: 'Nettoyage vitres', tarif: 4000, unite_tarif: 'heure' },
  ],
  avis: [
    { nom: 'Fatou D.', note: 5, texte: 'Travail impeccable, très ponctuel !', date: '12 juin 2026' },
    { nom: 'Moussa K.', note: 5, texte: "Excellent prestataire !", date: '5 juin 2026' },
    { nom: 'Mariama S.', note: 4, texte: 'Très professionnel et efficace.', date: '1er juin 2026' },
  ],
};

export default function PrestataireProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHeure, setSelectedHeure] = useState('09:00');
  const [selectedOffre, setSelectedOffre] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    setSelectedOffre('');

    const fetch = async () => {
      if (!id) { if (!cancelled) { setData(FALLBACK); setLoading(false); } return; }
      try {
        const { data: p } = await supabase
          .from('prestataires')
          .select(`id, bio, experience_annees, note_moyenne, nb_avis, verifie,
            utilisateurs ( nom, prenom, ville, photo_url ),
            offres ( id, titre, tarif, unite_tarif, actif, services ( nom, categories ( nom ) ) ),
            avis ( note, commentaire, created_at, clients ( utilisateurs ( nom, prenom ) ) )`)
          .eq('id', id).single();

        if (cancelled) return;
        if (!p) { setData(FALLBACK); return; }
        const offres = (p.offres||[]).filter(o=>o.actif);
        const avis = (p.avis||[]).map(a=>({
          nom: a.clients?.utilisateurs ? `${a.clients.utilisateurs.prenom?.[0]||''}. ${a.clients.utilisateurs.nom||''}` : 'Client',
          note: a.note, texte: a.commentaire||'Très bon service !',
          date: new Date(a.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}),
        }));
        setData({
          id: p.id,
          nom: `${p.utilisateurs?.prenom||''} ${p.utilisateurs?.nom||''}`.trim(),
          metier: offres[0]?.services?.categories?.nom||'Prestataire',
          ville: p.utilisateurs?.ville||'Dakar',
          bio: p.bio||FALLBACK.bio,
          note: p.note_moyenne||0, nb_avis: p.nb_avis||0,
          experience: p.experience_annees||0, prestations: p.nb_avis||0,
          photo: p.utilisateurs?.photo_url||null,
          offres: offres.length>0 ? offres.map(o=>({id:o.id,titre:o.titre,tarif:o.tarif,unite_tarif:o.unite_tarif})) : FALLBACK.offres,
          avis: avis.length>0 ? avis : FALLBACK.avis,
        });
        if (offres.length>0) setSelectedOffre(offres[0].id);
      } catch { if (!cancelled) setData(FALLBACK); }
      finally { if (!cancelled) setLoading(false); }
    };
    fetch();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><svg className="animate-spin h-10 w-10 text-green-600" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg></div>;

  const p = data;

  return (
    <div>
      <section className="bg-gradient-to-r from-[#1B3A6B] via-[#2d5fa8] to-[#3A9E3A] text-white py-12 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          {p.photo ? <img src={p.photo} alt={p.nom} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-white/30" />
            : <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4"><Icon name="user" size={40} color="white" /></div>}
          <h1 className="text-3xl font-bold mb-1 text-white">{p.nom}</h1>
          <p className="opacity-90 mb-4 text-sm">{p.metier} · {p.ville}</p>
          <div className="flex justify-center gap-2 flex-wrap mb-5">
            <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"><Icon name="star" size={13} color="#78350F" /> {p.note} · {p.nb_avis} avis</span>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"><Icon name="clock" size={13} color="white" /> {p.experience} ans d'expérience</span>
            <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"><Icon name="check" size={13} color="white" /> {p.prestations}+ prestations</span>
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to={`/reserver?service=${encodeURIComponent(p.offres[0]?.titre||'')}`} className="flex items-center gap-2 bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white px-5 py-2.5 rounded-lg font-semibold text-sm no-underline transition-colors"><Icon name="calendar" size={15} color="white" /> Réserver</Link>
            <Link to="/messages" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-lg text-sm no-underline transition-colors border border-white/30"><Icon name="chat" size={15} color="white" /> Contacter</Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          <div className="md:col-span-2 space-y-6">
            <div className="card p-6 border-t-4 border-[#3A9E3A]">
              <h2 className="font-bold text-[#1B3A6B] text-base mb-3">À propos</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{p.bio}</p>
            </div>
            <div className="card p-6 border-t-4 border-[#3A9E3A]">
              <h2 className="font-bold text-[#1B3A6B] text-base mb-4">Services proposés</h2>
              <div className="space-y-3">
                {p.offres.map((o,i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2"><Icon name="check" size={14} color="#3A9E3A" /><span className="text-sm text-gray-700">{o.titre}</span></div>
                    <span className="text-sm font-bold text-[#3A9E3A]">{formatCFA(o.tarif)}/{o.unite_tarif||'h'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6 border-t-4 border-[#3A9E3A]">
              <h2 className="font-bold text-[#1B3A6B] text-base mb-4">Avis clients</h2>
              <div className="divide-y divide-gray-100">
                {p.avis.map((r,i) => (
                  <div key={i} className="py-4 first:pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#1B3A6B] rounded-full flex items-center justify-center text-white text-xs font-bold">{r.nom[0]}</div>
                        <span className="font-semibold text-sm text-[#1B3A6B]">{r.nom}</span>
                      </div>
                      <div className="flex items-center gap-1">{[...Array(r.note)].map((_,j)=><Icon key={j} name="star" size={12} color="#FBBF24" />)}</div>
                    </div>
                    <p className="text-gray-600 text-sm italic leading-relaxed">"{r.texte}"</p>
                    <p className="text-gray-400 text-xs mt-1">{r.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div className="card p-5 border-t-4 border-[#3A9E3A] sticky top-20">
              <h3 className="font-bold text-[#1B3A6B] mb-4">Faire une réservation</h3>
              <div className="space-y-3">
                <div>
                  <label className="form-label">Service</label>
                  <select className="form-input cursor-pointer" value={selectedOffre} onChange={e=>setSelectedOffre(e.target.value)}>
                    {p.offres.map((o,i)=><option key={i} value={o.id||o.titre}>{o.titre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Date souhaitée</label>
                  <input type="date" className="form-input" min={new Date().toISOString().split('T')[0]} value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Heure</label>
                  <select className="form-input cursor-pointer" value={selectedHeure} onChange={e=>setSelectedHeure(e.target.value)}>
                    {['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(h=><option key={h}>{h}</option>)}
                  </select>
                </div>
                <Link to={`/reserver?service=${encodeURIComponent(p.offres.find(o=>o.id===selectedOffre)?.titre||p.offres[0]?.titre||'')}`}
                  className="w-full flex items-center justify-center gap-2 bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white text-sm font-semibold py-3 rounded-lg no-underline transition-colors">
                  <Icon name="calendar" size={15} color="white" /> Réserver maintenant
                </Link>
              </div>
            </div>
            <div className="card p-5 border-t-4 border-[#1B3A6B]">
              <h3 className="font-bold text-[#1B3A6B] mb-4 text-sm">Statistiques</h3>
              <div className="grid grid-cols-2 gap-3">
                {[[p.note,'Note'],[p.nb_avis,'Avis'],[`${p.prestations}+`,'Prestations'],[`${p.experience} ans`,"D'expérience"]].map(([v,l])=>(
                  <div key={l} className="text-center bg-gray-50 rounded-lg p-3">
                    <p className="font-bold text-[#3A9E3A] text-lg">{v}</p>
                    <p className="text-xs text-gray-500">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
