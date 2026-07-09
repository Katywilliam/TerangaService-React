import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icons';
import { supabase } from '../../services/supabase';

const FALLBACK = [
  { id: 1, nom: 'Fatima Sow', metier: 'Ménage & Entretien', ville: 'Nord Foire', note: 4.9, avis: 127, prix: '3 500 FCFA/h', dispo: true, img: 'https://i.pinimg.com/736x/70/d1/c5/70d1c5e75e34f16e69045837ab4f6f51.jpg', services: ['Ménage', 'Repassage'] },
  { id: 2, nom: 'Aissatou Diallo', metier: 'Cuisinière', ville: 'Almadies', note: 4.8, avis: 89, prix: '5 000 FCFA/repas', dispo: true, img: 'https://i.pinimg.com/736x/e9/6b/03/e96b03735e785c919c7cc3a01f3dbcc5.jpg', services: ['Cuisine', 'Pâtisserie'] },
  { id: 3, nom: 'Omar Badji', metier: 'Plombier', ville: 'Mermoz', note: 4.7, avis: 64, prix: '5 000 FCFA/interv.', dispo: false, img: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&q=80&fit=crop&crop=face', services: ['Plomberie', 'Robinetterie'] },
  { id: 4, nom: 'Fatou Ndiaye', metier: 'Électricienne', ville: 'Keur Masar', note: 4.9, avis: 203, prix: '5 500 FCFA/interv.', dispo: true, img: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200&q=80&fit=crop&crop=face', services: ['Électricité', 'Domotique'] },
  { id: 5, nom: 'Ibrahima Cissé', metier: 'Technicien Informatique', ville: 'Point E', note: 4.6, avis: 42, prix: '4 500 FCFA/h', dispo: true, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&fit=crop&crop=face', services: ['Informatique', 'Réseau'] },
  { id: 6, nom: 'Rokhaya Fall', metier: 'Ménage & Baby-sitting', ville: 'Sacré-Cœur', note: 4.8, avis: 156, prix: '2 500 FCFA/h', dispo: true, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&fit=crop&crop=face', services: ['Ménage', 'Garde enfants'] },
  { id: 7, nom: 'Modou Fall', metier: 'Climatisation', ville: 'Ouakam', note: 4.7, avis: 58, prix: '5 000 FCFA/interv.', dispo: true, img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&fit=crop&crop=face', services: ['Climatisation', 'Ventilation'] },
  { id: 8, nom: 'Ramatoulaye Sarr', metier: 'Ménage & Repassage', ville: 'Yoff', note: 4.5, avis: 33, prix: '2 800 FCFA/h', dispo: true, img: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=200&q=80&fit=crop&crop=face', services: ['Ménage', 'Repassage'] },
  { id: 9, nom: 'Khadija Sarr', metier: 'Cuisinière traiteur', ville: 'Liberté 6', note: 4.9, avis: 174, prix: '6 000 FCFA/repas', dispo: false, img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&q=80&fit=crop&crop=face', services: ['Cuisine', 'Traiteur'] },
  { id: 10, nom: 'Abdoulaye Diouf', metier: 'Plombier sanitaire', ville: 'Grand Yoff', note: 4.6, avis: 47, prix: '4 800 FCFA/interv.', dispo: true, img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80&fit=crop&crop=face', services: ['Plomberie', 'Sanitaire'] },
  { id: 11, nom: 'Mariama Kane', metier: 'Électricienne bâtiment', ville: 'HLM', note: 4.8, avis: 91, prix: '5 200 FCFA/interv.', dispo: true, img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80&fit=crop&crop=face', services: ['Électricité', 'Bâtiment'] },
  { id: 12, nom: 'Cheikh Fall', metier: 'Support Informatique', ville: 'Parcelles Assainies', note: 4.7, avis: 65, prix: '4 200 FCFA/h', dispo: true, img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80&fit=crop&crop=face', services: ['Informatique', 'Support'] },
  { id: 13, nom: 'Astou Mbengue', metier: 'Jardinière paysagiste', ville: 'Ngor', note: 4.6, avis: 38, prix: '4 000 FCFA/h', dispo: true, img: 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=200&q=80&fit=crop&crop=face', services: ['Jardinage', 'Entretien extérieur'] },
  { id: 14, nom: 'Lamine Gueye', metier: 'Peintre en bâtiment', ville: 'Grand Dakar', note: 4.7, avis: 52, prix: '4 500 FCFA/interv.', dispo: true, img: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&q=80&fit=crop&crop=face', services: ['Peinture', 'Rénovation'] },
  { id: 15, nom: 'Adama Sy', metier: 'Menuisier', ville: 'Pikine', note: 4.5, avis: 29, prix: '5 000 FCFA/interv.', dispo: true, img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80&fit=crop&crop=face', services: ['Menuiserie', 'Ameublement'] },
  { id: 16, nom: 'Ndeye Awa Diagne', metier: 'Garde d\'enfants', ville: 'Sicap Liberté', note: 4.9, avis: 112, prix: '2 000 FCFA/h', dispo: true, img: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=80&fit=crop&crop=face', services: ['Garde enfants', 'Aide aux devoirs'] },
  { id: 17, nom: 'Babacar Thiam', metier: 'Serrurier', ville: 'Médina', note: 4.6, avis: 24, prix: '4 000 FCFA/interv.', dispo: true, img: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&q=80&fit=crop&crop=face', services: ['Serrurerie', 'Sécurité'] },
  { id: 18, nom: 'Coumba Ndao', metier: 'Coiffeuse à domicile', ville: 'Fann', note: 4.8, avis: 143, prix: '3 000 FCFA/prest.', dispo: true, img: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&q=80&fit=crop&crop=face', services: ['Coiffure', 'Beauté'] },
  { id: 19, nom: 'Souleymane Diop', metier: 'Livreur & Déménagement', ville: 'Rufisque', note: 4.7, avis: 81, prix: '6 000 FCFA/course', dispo: true, img: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=200&q=80&fit=crop&crop=face', services: ['Livraison', 'Déménagement'] },
  { id: 20, nom: 'Alioune Sané', metier: 'Transport & Manutention', ville: 'Thiaroye', note: 4.6, avis: 39, prix: '7 500 FCFA/course', dispo: true, img: 'https://images.unsplash.com/photo-1622560481156-01a35d6ce7d0?w=200&q=80&fit=crop&crop=face', services: ['Déménagement', 'Transport'] },
  { id: 21, nom: 'Bineta Camara', metier: 'Blanchisserie', ville: 'Guédiawaye', note: 4.8, avis: 97, prix: '2 200 FCFA/kg', dispo: true, img: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=200&q=80&fit=crop&crop=face', services: ['Blanchisserie', 'Repassage'] },
  { id: 22, nom: 'Ousmane Barry', metier: 'Vitrier', ville: 'Colobane', note: 4.5, avis: 21, prix: '4 500 FCFA/interv.', dispo: true, img: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&q=80&fit=crop&crop=face', services: ['Vitrerie', 'Réparation'] },
  { id: 23, nom: 'Aminata Thiam', metier: 'Couturière', ville: 'Médina', note: 4.9, avis: 118, prix: '3 500 FCFA/pièce', dispo: true, img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80&fit=crop&crop=face', services: ['Couture', 'Retouches'] },
  { id: 24, nom: 'Pape Malick Sy', metier: 'Gardiennage & Sécurité', ville: 'Diamniadio', note: 4.6, avis: 27, prix: '3 000 FCFA/h', dispo: true, img: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&q=80&fit=crop&crop=face', services: ['Sécurité', 'Gardiennage'] },
];

const SERVICES = ['Tous', 'Ménage', 'Plomberie', 'Cuisine', 'Électricité', 'Informatique', 'Jardinage', 'Garde enfants', 'Livraison'];

export default function Prestataires() {
  const [query, setQuery] = useState('');
  const [service, setService] = useState('Tous');
  const [dispoOnly, setDispoOnly] = useState(false);
  const [prestataires, setPrestataires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrestataires = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('prestataires')
          .select(`
            id, bio, note_moyenne, nb_avis, verifie,
            utilisateurs ( nom, prenom, ville, photo_url ),
            offres ( titre, tarif, unite_tarif, actif, services ( nom, categories ( nom ) ) )
          `)
          .order('note_moyenne', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setPrestataires(data.map(p => {
            const offresActives = (p.offres || []).filter(o => o.actif);
            const premiereOffre = offresActives[0];
            const categories = [...new Set(offresActives.map(o => o.services?.categories?.nom).filter(Boolean))];
            return {
              id: p.id,
              nom: `${p.utilisateurs?.prenom || ''} ${p.utilisateurs?.nom || ''}`.trim() || 'Prestataire',
              metier: categories[0] || 'Prestataire',
              ville: p.utilisateurs?.ville || 'Keur Massar',
              note: p.note_moyenne || 0,
              avis: p.nb_avis || 0,
              prix: premiereOffre ? `${premiereOffre.tarif} FCFA/${premiereOffre.unite_tarif}` : 'Sur devis',
              dispo: true, 
              img: p.utilisateurs?.photo_url || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&fit=crop&crop=face`,
              services: categories,
            };
          }));
        } else {
          setPrestataires(FALLBACK);
        }
      } catch (err) {
        setPrestataires(FALLBACK);
        setError(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchPrestataires();
  }, []);

  const filtered = prestataires.filter(p => {
    const q = query.toLowerCase();
    const matchQ = !q || p.nom.toLowerCase().includes(q) || p.metier.toLowerCase().includes(q) || p.ville.toLowerCase().includes(q);
    const matchS = service === 'Tous' || p.services.some(s => s.includes(service));
    const matchD = !dispoOnly || p.dispo;
    return matchQ && matchS && matchD;
  });

  return (
    <div>

      <section className="bg-gradient-to-br from-[#1B3A6B] to-[#142d55] text-white py-16 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-3 text-white">
            Vos services à domicile<br />
            <span className="text-emerald-400">en toute confiance</span>
          </h1>
          <p className="text-blue-200 mb-7">Connectez-vous avec des professionnels qualifiés, en quelques clics.</p>
          <div className="flex items-center gap-2 max-w-md mx-auto bg-white rounded-full px-4 py-1.5 shadow-xl">
            <Icon name="search" size={16} color="#9CA3AF" />
            <input
              type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ménage, Dakar Plateau…"
              className="flex-1 border-none outline-none text-sm text-[#1B3A6B] bg-transparent font-[Poppins] py-1.5 min-w-0"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400">
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 py-8">

        <div className="card p-5 border-t-4 border-[#3A9E3A] mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2 flex-wrap">
            {SERVICES.map(s => (
              <button key={s} onClick={() => setService(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  service === s ? 'bg-[#1B3A6B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer ml-auto">
            <input type="checkbox" className="accent-[#3A9E3A] w-4 h-4"
              checked={dispoOnly} onChange={e => setDispoOnly(e.target.checked)} />
            Disponibles uniquement
          </label>
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-2">
            {loading ? (
              <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium animate-pulse">
                Chargement…
              </span>
            ) : (
              <span className="bg-[#1B3A6B] text-white text-xs px-3 py-1 rounded-full font-medium">
                {filtered.length} prestataire{filtered.length > 1 ? 's' : ''}
              </span>
            )}
            {dispoOnly && (
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                Disponibles
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200" />
                <div className="pt-10 px-5 pb-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-8 bg-gray-200 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Icon name="users" size={48} color="#D1D5DB" />
            <p className="mt-3">Aucun prestataire trouvé</p>
            <button onClick={() => { setQuery(''); setService('Tous'); setDispoOnly(false); }}
              className="mt-4 text-sm text-[#3A9E3A] hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <div key={p.id} className="card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-32 bg-gradient-to-br from-[#1B3A6B] to-[#2A5298]">
                  <div className="absolute bottom-0 left-4 transform translate-y-1/2">
                    <img src={p.img} alt={p.nom}
                      className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-md" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
                      p.dispo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dispo ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {p.dispo ? 'Disponible' : 'Occupé'}
                    </span>
                  </div>
                </div>

                <div className="pt-10 px-5 pb-5">
                  <h3 className="font-bold text-[#1B3A6B] text-base">{p.nom}</h3>
                  <p className="text-gray-500 text-sm mb-1">{p.metier}</p>
                  <div className="flex items-center gap-1 mb-1">
                    <Icon name="mappin" size={13} color="#9CA3AF" />
                    <span className="text-xs text-gray-400">{p.ville}</span>
                  </div>

                  <div className="flex items-center gap-3 my-3">
                    <div className="flex items-center gap-1">
                      <Icon name="star" size={14} color="#FBBF24" />
                      <span className="text-sm font-bold text-[#1B3A6B]">{p.note}</span>
                      <span className="text-xs text-gray-400">({p.avis} avis)</span>
                    </div>
                    <span className="text-[#3A9E3A] text-xs font-semibold ml-auto">{p.prix}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {p.services.map(s => (
                      <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>

                  <Link to={`/prestataires/${p.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white text-sm font-semibold py-2.5 rounded-lg no-underline transition-colors">
                    <Icon name="calendar" size={14} color="white" />
                    Voir le profil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}