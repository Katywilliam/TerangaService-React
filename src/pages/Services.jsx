import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';

const services = [
  { icon: 'electricite', title: 'Électricité', desc: 'Installation électrique, dépannage et maintenance. Interventions rapides et garanties.', prix: '5 500', unite: 'intervention' },
  { icon: 'plomberie', title: 'Plomberie', desc: 'Installation, réparation et entretien de vos équipements sanitaires.', prix: '5 000', unite: 'intervention' },
  { icon: 'menage', title: 'Ménage', desc: 'Nettoyage complet de votre maison ou bureau. Lessive, repassage, vitres.', prix: '5 000', unite: 'intervention' },
  { icon: 'cuisine', title: 'Cuisine à domicile', desc: 'Préparation de repas pour événements et particuliers.', prix: '5 000', unite: 'repas' },
  { icon: 'climatisation', title: 'Froid & Climatisation', desc: 'Installation et dépannage de climatiseurs et réfrigérateurs.', prix: '3 000', unite: 'intervention' },
  { icon: 'informatique', title: 'Informatique', desc: 'Maintenance informatique, installation de logiciels et assistance technique.', prix: '4 500', unite: 'heure' },
  { icon: 'jardinage', title: 'Jardinage', desc: 'Entretien de jardin, taille de haies et aménagement extérieur.', prix: '4 000', unite: 'heure' },
  { icon: 'users', title: "Garde d'enfants", desc: "Garde à domicile par des professionnels expérimentés et de confiance.", prix: '2 500', unite: 'heure' },
];

export default function Services() {
  const [query, setQuery] = useState('');
  const filtered = services.filter(s => s.title.toLowerCase().includes(query.toLowerCase()) || s.desc.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      
      <section className="bg-gradient-to-br from-[#1B3A6B] to-[#142d55] text-white py-20 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">Nos services</h1>
          <p className="text-blue-200 text-lg mb-7">Découvrez tous nos services à domicile réalisés par des professionnels vérifiés</p>
          <div className="flex items-center gap-2 max-w-md mx-auto bg-white rounded-full px-4 py-1.5 shadow-xl">
            <Icon name="search" size={16} color="#9CA3AF" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher un service..."
              className="flex-1 border-none outline-none text-sm text-[#1B3A6B] bg-transparent font-[Poppins] py-1.5 min-w-0"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      
      <section className="py-16 px-5 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Tous nos services</h2>
            <div className="section-divider mx-auto" />
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Icon name="search" size={48} className="mx-auto mb-3 opacity-30" />
              <p>Aucun service trouvé pour "{query}"</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((s, i) => (
              <div key={i} className="card p-7 text-center border-t-4 border-[#3A9E3A] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-green-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Icon name={s.icon} size={30} color="#3A9E3A" />
                </div>
                <h3 className="text-base font-bold text-[#1B3A6B] mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <div className="mb-5">
                  <span className="text-[#3A9E3A] text-xl font-bold">{s.prix} FCFA</span>
                  <span className="text-gray-400 text-xs"> /{s.unite}</span>
                </div>
                <Link to="/prestataires" className="inline-block bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white px-6 py-2.5 rounded-lg text-sm font-semibold no-underline transition-colors">
                  Réserver
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
