import { Link } from 'react-router-dom';
import Icon from '../../components/Icons';

export default function ResetPassword() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5 py-12 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="w-full max-w-md">
        <div className="card p-9 border-t-4 border-amber-400 shadow-xl text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Icon name="tool" size={28} color="#D97706" />
          </div>

          <h2 className="text-xl font-bold text-[#1B3A6B] mb-2">Fonctionnalité en maintenance</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            La réinitialisation de mot de passe en ligne n'est pas encore disponible.
            Contacte-nous directement, on s'occupe de toi rapidement.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5 mb-6 text-left">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Icon name="mail" size={14} color="#3A9E3A" />
              contact@terangaservice.sn
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Icon name="phone" size={14} color="#3A9E3A" />
              +221 77 000 00 00
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Icon name="mappin" size={14} color="#3A9E3A" />
              Dakar, Sénégal
            </p>
          </div>

          <Link to="/connexion" className="text-[#3A9E3A] text-sm font-semibold no-underline hover:underline">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}