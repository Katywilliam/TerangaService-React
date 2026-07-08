import { Link } from 'react-router-dom';
import Icon from './Icons';
import logo from '../pages/public/images/logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#1B3A6B] text-white pt-7 pb-4 mt-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-5">

          <div>
            <img src={logo} alt="Teranga Service" className="h-10 mb-2 object-contain" />
            <p className="text-gray-400 text-sm leading-relaxed mb-2">La plateforme qui simplifie votre quotidien à Dakar.</p>
            <div className="space-y-1">
              <p className="text-gray-400 text-xs flex items-center gap-2">
                <Icon name="mail" size={13} color="#3A9E3A" />
                contact@terangaservice.sn
              </p>
              <p className="text-gray-400 text-xs flex items-center gap-2">
                <Icon name="phone" size={13} color="#3A9E3A" />
                +221 77 000 00 00
              </p>
              <p className="text-gray-400 text-xs flex items-center gap-2">
                <Icon name="mappin" size={13} color="#3A9E3A" />
                Dakar, Sénégal
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Icon name="link" size={14} color="#3A9E3A" />
              Liens utiles
            </h3>
            <ul className="space-y-1">
              {[
                { to: '/a-propos', label: 'À propos', icon: 'info' },
                { to: '/mentions-legales', label: 'Mentions légales', icon: 'file' },
                { to: '/confidentialite', label: 'Confidentialité', icon: 'lock' },
                { to: '/cgu', label: 'CGU', icon: 'file' },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-2 no-underline">
                    <Icon name={item.icon} size={13} color="currentColor" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Icon name="tool" size={14} color="#3A9E3A" />
              Nos services
            </h3>
            <ul className="space-y-1">
              {['Électricité', 'Plomberie', 'Ménage', 'Cuisine à domicile', 'Climatisation', 'Informatique'].map(s => (
                <li key={s} className="text-gray-400 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#3A9E3A] rounded-full flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Icon name="mail" size={14} color="#3A9E3A" />
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm mb-2">Recevez nos offres par email.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-3 py-2 rounded-lg text-sm text-gray-800 outline-none border-none font-[Poppins] min-w-0"
              />
              <button className="bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1">
                <Icon name="send" size={13} color="white" />
              </button>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 mb-3" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs flex items-center gap-1">
            <Icon name="info" size={12} />
            2026 Teranga Service · Tous droits réservés
          </p>
          <div className="flex gap-4">
            {['/mentions-legales', '/confidentialite', '/cgu'].map((to, i) => (
              <Link key={to} to={to} className="text-gray-500 text-xs hover:text-gray-300 no-underline transition-colors">
                {['Mentions légales', 'Confidentialité', 'CGU'][i]}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}