import { Link } from 'react-router-dom';
import Icon from '../../components/Icons';
import logo from './images/logo.jpeg';

const services = [
  { icon: 'menage', title: 'Ménage', desc: 'Nettoyage complet, repassage et entretien de votre maison.', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80&fit=crop', badge: 'Populaire' },
  { icon: 'plomberie', title: 'Plomberie', desc: 'Installation, réparation de fuites et dépannage rapide.', img: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=80&fit=crop' },
  { icon: 'cuisine', title: 'Cuisine à domicile', desc: 'Repas préparés chez vous par un cuisinier qualifié.', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&fit=crop' },
  { icon: 'electricite', title: 'Électricité', desc: 'Installation électrique, dépannage et mise aux normes.', img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80&fit=crop' },
  { icon: 'climatisation', title: 'Climatisation', desc: 'Installation, entretien et dépannage de climatiseurs.', img: 'https://i.pinimg.com/1200x/6e/72/4d/6e724d018fc3c02e51cb649cdf0e2f78.jpg' },
  { icon: 'informatique', title: 'Informatique', desc: 'Maintenance, dépannage et assistance technique.', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80&fit=crop' },
];

const steps = [
  { icon: 'search', title: 'Choisissez', desc: 'Sélectionnez votre service parmi notre catalogue' },
  { icon: 'calendar', title: 'Réservez', desc: 'Planifiez votre intervention à la date qui vous convient' },
  { icon: 'tool', title: 'On intervient', desc: 'Le prestataire se déplace directement chez vous' },
  { icon: 'star', title: 'Profitez', desc: "Évaluez le service et bénéficiez d'un suivi qualité" },
];

const testimonials = [
  { text: "Service impeccable ! La personne est arrivée à l'heure et le travail était parfait. Je recommande vivement.", name: 'Aissatou D.', city: 'Dakar Plateau', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80&fit=crop&crop=face' },
  { text: "Excellente expérience ! Un vrai gain de temps, je n'ai plus besoin de chercher partout. La plateforme est très simple.", name: 'Fatou M.', city: 'Almadies', img: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=80&q=80&fit=crop&crop=face' },
  { text: "Service rapide et professionnel. Mon problème de plomberie a été résolu en moins d'une heure. Merci !", name: 'Mamadou F.', city: 'Mermoz', img: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=80&q=80&fit=crop&crop=face' },
];

const stats = [
  { value: '300+', label: 'Professionnels' },
  { value: '1 500+', label: 'Clients satisfaits' },
  { value: '2 000+', label: 'Services réalisés' },
  { value: '24h/24', label: 'Disponibilité' },
];

export default function Home() {
  return (
    <div className="font-[Poppins]">

      <section className="relative bg-gradient-to-br from-[#0f2549] via-[#1B3A6B] to-[#1a4a3a] text-white py-24 px-5 text-center overflow-hidden">
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block bg-green-900/40 text-green-300 border border-green-700/50 px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
            La plateforme #1 au Sénégal
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white">
            Vos services à domicile<br />
            <span className="text-[#3A9E3A]">en toute confiance</span>
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto leading-relaxed">
            Teranga Service vous connecte avec des professionnels qualifiés pour tous vos besoins à la maison, en quelques clics.
          </p>

          <div className="flex items-center gap-2 max-w-lg mx-auto bg-white rounded-full px-4 py-1.5 shadow-2xl mb-7">
            <Icon name="search" size={16} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Ménage, Dakar Plateau..."
              className="flex-1 border-none outline-none text-sm text-[#1B3A6B] bg-transparent font-[Poppins] min-w-0 py-1.5"
            />
            <button className="bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white font-semibold px-5 py-2 rounded-full text-sm transition-colors">
              Réserver
            </button>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <a href="#comment-ca-marche" className="px-5 py-2.5 border-2 border-white/40 text-white rounded-lg font-semibold text-sm hover:bg-white/10 transition-all no-underline">
              Comment ça marche
            </a>
            <Link to="/prestataires" className="px-5 py-2.5 bg-[#3A9E3A] border-2 border-[#3A9E3A] text-white rounded-lg font-semibold text-sm hover:bg-[#2d8a2d] transition-all no-underline">
              Voir les prestataires
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {stats.map((s, i) => (
            <div key={i} className={`py-4 ${i > 0 ? 'md:border-l border-gray-100' : ''}`}>
              <div className="text-3xl font-bold text-[#1B3A6B]">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-5 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Nos services</h2>
            <div className="section-divider mx-auto" />
            <p className="text-gray-500 max-w-md mx-auto">Découvrez tous nos services à domicile réalisés par des professionnels vérifiés</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {services.map((s, i) => (
              <div key={i} className="card overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {s.badge && (
                    <span className="absolute top-3 left-3 bg-[#3A9E3A] text-white text-xs font-semibold px-3 py-1 rounded-full">{s.badge}</span>
                  )}
                  <div className="absolute bottom-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md">
                    <Icon name={s.icon} size={18} color="#3A9E3A" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-[#1B3A6B] mb-1.5">{s.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{s.desc}</p>
                  <Link to="/services" className="text-[#3A9E3A] text-sm font-semibold no-underline inline-flex items-center gap-1 hover:gap-2 transition-all">
                    Réserver <Icon name="arrowright" size={14} color="#3A9E3A" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/services" className="bg-[#1B3A6B] hover:bg-navy-dark text-white px-8 py-3.5 rounded-lg font-semibold text-sm no-underline inline-block transition-all hover:-translate-y-0.5 hover:shadow-lg">
              Voir tous les services
            </Link>
          </div>
        </div>
      </section>

      <section id="comment-ca-marche" className="py-20 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Comment ça marche ?</h2>
            <div className="section-divider mx-auto" />
            <p className="text-gray-500">Trouvez un prestataire qualifié en quelques clics</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3A9E3A] to-[#2d8a2d] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                  <Icon name={step.icon} size={28} color="white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#1B3A6B] text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-[#1B3A6B] text-base mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title">Témoignages clients</h2>
            <div className="section-divider mx-auto" />
            <p className="text-gray-500">Ils nous font confiance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card border-t-4 border-[#3A9E3A] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Icon key={j} name="star" size={16} color="#FBBF24" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-11 h-11 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm text-[#1B3A6B] mb-0">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-5 bg-gradient-to-br from-[#1B3A6B] to-[#142d55] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80&fit=crop') center/cover no-repeat", opacity: 0.06 }} />
        <div className="relative max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Rejoignez notre communauté</h2>
          <p className="text-blue-200 text-base mb-7 leading-relaxed">Des milliers de familles au Sénégal nous font déjà confiance pour leurs services à domicile.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/inscription" className="bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white px-7 py-3 rounded-lg font-semibold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-lg">
              Créer un compte
            </Link>
            <Link to="/prestataires" className="border-2 border-white/40 text-white hover:bg-white/10 px-7 py-3 rounded-lg font-semibold text-sm no-underline transition-all">
              Voir les prestataires
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}