import Icon from '../../components/Icons';

const valeurs = [
  { titre: 'Confiance', desc: 'Chaque prestataire est vérifié et validé par notre équipe avant de rejoindre la plateforme.', bg: 'bg-green-100', tc: '#166534', icon: 'shield' },
  { titre: 'Qualité', desc: 'Nous maintenons des standards élevés grâce aux avis clients et au suivi de chaque prestation.', bg: 'bg-amber-100', tc: '#92400e', icon: 'star' },
  { titre: 'Proximité', desc: 'Des professionnels dans votre quartier, disponibles rapidement pour répondre à vos besoins.', bg: 'bg-blue-100', tc: '#1e40af', icon: 'mappin' },
  { titre: 'Excellence', desc: "Nous nous engageons à offrir une expérience irréprochable du premier contact jusqu'au paiement.", bg: 'bg-purple-100', tc: '#4c1d95', icon: 'award' },
];

const team = [
  { nom: 'Abdoulaye BARRY', role: 'Scrum Master & Chef de projet', img: 'https://i.pinimg.com/1200x/5c/e9/d5/5ce9d55d2e67a3f66e3a41ba6042d683.jpg' },
  { nom: 'Coumba SEYE', role: 'Développeuse Backend', img: 'https://i.pinimg.com/736x/13/45/e8/1345e86a04ec3f4051d0c6198ede38ac.jpg' },
  { nom: 'Marie Luoise Cathérine WILLIAM', role: 'Développeur Frontend', img: 'https://i.pinimg.com/736x/09/fa/04/09fa048a7212e02721a3a6053320f8c6.jpg' },
  { nom: 'Oumar BALDE', role: 'Développeuse Backend', img: 'https://i.pinimg.com/736x/ec/d8/e5/ecd8e598e49b5ef894da9c440f49f666.jpg' },
  { nom: 'Mariama Ba', role: 'Développeuse Frontend', img: 'https://i.pinimg.com/736x/e8/f0/87/e8f087d6ee3ee0a7039e2f2f4e998012.jpg' },
  { nom: 'Kenda Bailo BA', role: 'UI/UX Designer', img: 'https://i.pinimg.com/736x/2d/b1/97/2db19781b06af827062acf6baa6d8755.jpg' },
  { nom: 'Thierno Oumar Iba SALL', role: 'Développeur Full-Stack', img: 'https://i.pinimg.com/736x/48/fa/5b/48fa5b719960b8dc578f2aaaf7db2d51.jpg' },
  { nom: 'Alioune TOUNKARA', role: 'Développeur Frontend', img: 'https://i.pinimg.com/736x/11/e7/55/11e75577c30adeb2a89db77bb279a23c.jpg' },
  { nom: 'Bassirou NDIAYE', role: 'Développeur Frontend', img: 'https://i.pinimg.com/736x/34/0e/db/340edb16ec3baf1a695385d03662ecc7.jpg' },
];

export default function About() {
  return (
    <div>
      
      <section className="relative bg-gradient-to-br from-[#0f2549] via-[#1B3A6B] to-[#1a4a3a] text-white py-24 px-5 text-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&q=80&fit=crop') center/cover no-repeat", opacity: 0.10 }} />
        <div className="relative max-w-2xl mx-auto">
          <span className="inline-block bg-green-900/40 text-green-300 border border-green-700/50 px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
            🇸🇳 Made in Sénégal
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">À propos de nous</h1>
          <p className="text-blue-100 text-lg leading-relaxed">Teranga Service est bien plus qu'un service, un engagement envers les familles sénégalaises.</p>
        </div>
      </section>

      
      <section className="py-20 px-5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Notre mission</span>
            <h2 className="text-3xl font-bold text-[#1B3A6B] mb-5 leading-snug">Simplifier le quotidien des familles au Sénégal</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Née à Dakar, Teranga Service connecte les particuliers avec des professionnels qualifiés, fiables et passionnés. Chaque prestation est une occasion de créer de la confiance et de valoriser le savoir-faire local.</p>
            <p className="text-gray-600 leading-relaxed mb-7">Nous croyons que chaque foyer mérite un service de qualité, accessible et transparent. C'est pourquoi nous vérifions chaque prestataire et garantissons votre satisfaction.</p>
            <div className="flex gap-8 flex-wrap">
              {[['300+', 'Prestataires'], ['1 500+', 'Clients satisfaits'], ['4.8/5', 'Note moyenne']].map(([v, l]) => (
                <div key={l} className="text-center">
                  <p className="text-2xl font-bold text-[#3A9E3A] mb-0.5">{v}</p>
                  <p className="text-xs text-gray-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=700&q=80&fit=crop" alt="Mission" className="w-full h-80 object-cover" />
          </div>
        </div>
      </section>

      
      <section className="py-20 px-5 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Nos valeurs</h2>
            <div className="section-divider mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {valeurs.map((v, i) => (
              <div key={i} className="card text-center p-6 border-t-4 border-[#3A9E3A] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${v.bg} flex items-center justify-center mx-auto mb-4`}>
                  <Icon name={v.icon} size={26} color={v.tc} />
                </div>
                <h3 className="font-bold text-[#1B3A6B] mb-2">{v.titre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title">Notre équipe</h2>
            <div className="section-divider mx-auto" />
            <p className="text-gray-500">Les visages derrière Teranga Service</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((m, i) => (
              <div key={i} className="card overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center">
                <img src={m.img} alt={m.nom} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-[#1B3A6B]">{m.nom}</h3>
                  <p className="text-gray-400 text-xs mt-1">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
