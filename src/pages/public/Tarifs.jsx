import { Link } from 'react-router-dom';
import Icon from '../../components/Icons';

const tarifs = [
  { nom: 'Ménage', prix: '3 500', unite: 'Heure', icon: 'menage', bg: 'bg-green-100', tc: '#166534' },
  { nom: 'Plomberie', prix: '5 000', unite: 'Intervention', icon: 'plomberie', bg: 'bg-blue-100', tc: '#1e40af' },
  { nom: 'Cuisine à domicile', prix: '3 000', unite: 'Repas', icon: 'cuisine', bg: 'bg-amber-100', tc: '#92400e' },
  { nom: 'Électricité', prix: '5 500', unite: 'Intervention', icon: 'electricite', bg: 'bg-purple-100', tc: '#4c1d95' },
  { nom: 'Climatisation', prix: '4 000', unite: 'Intervention', icon: 'climatisation', bg: 'bg-sky-100', tc: '#075985' },
  { nom: 'Informatique', prix: '4 500', unite: 'Heure', icon: 'informatique', bg: 'bg-emerald-100', tc: '#166534' },
  { nom: 'Jardinage', prix: '4 000', unite: 'Heure', icon: 'jardinage', bg: 'bg-green-100', tc: '#166534' },
  { nom: "Garde d'enfants", prix: '2 500', unite: 'Heure', icon: 'users', bg: 'bg-amber-100', tc: '#92400e' },
];

export default function Tarifs() {
  return (
    <div>
      
      <section className="bg-gradient-to-br from-[#1B3A6B] to-[#142d55] text-white py-16 px-5 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="dollar" size={26} color="white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">Nos tarifs</h1>
          <p className="text-blue-200 text-base">Des prix transparents et compétitifs pour tous nos services</p>
        </div>
      </section>

      <section className="py-14 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="card overflow-hidden border-t-4 border-[#3A9E3A] shadow-lg">
            
            <div className="bg-[#1B3A6B] grid grid-cols-3 px-6 py-4">
              <span className="text-white font-semibold text-sm">Service</span>
              <span className="text-white font-semibold text-sm text-center">Prix</span>
              <span className="text-white font-semibold text-sm text-center">Unité</span>
            </div>

            
            {tarifs.map((t, i) => (
              <div key={i} className="grid grid-cols-3 px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${t.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={t.icon} size={17} color={t.tc} />
                  </div>
                  <span className="font-semibold text-sm text-[#1B3A6B]">{t.nom}</span>
                </div>
                <span className="font-bold text-[#3A9E3A] text-center text-base">{t.prix} FCFA</span>
                <span className="text-gray-500 text-sm text-center">{t.unite}</span>
              </div>
            ))}
          </div>

          
          <div className="mt-5 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <Icon name="info" size={16} color="#16A34A" className="flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 mb-0">
              Tarifs indicatifs. Un devis personnalisé est disponible sur demande.{' '}
              <Link to="/contact" className="text-[#3A9E3A] font-semibold no-underline hover:underline">
                Demander un devis →
              </Link>
            </p>
          </div>

          
          <div className="mt-8 text-center">
            <Link to="/services" className="btn-primary">
              <Icon name="arrowright" size={16} color="white" />
              Voir tous les services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
