import { Link } from 'react-router-dom';
import Icon from '../components/Icons';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5 text-center">
      <div>
        <div className="text-8xl font-bold text-[#1B3A6B] opacity-10 mb-4">404</div>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Icon name="info" size={30} color="#EF4444" />
        </div>
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-2">Page introuvable</h1>
        <p className="text-gray-500 mb-6">La page que vous cherchez n'existe pas ou a été déplacée.</p>
        <Link to="/" className="btn-primary">
          <Icon name="home" size={16} color="white" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

function LegalPage({ title, content }) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-3xl font-bold text-[#1B3A6B] mb-2">{title}</h1>
      <div className="section-divider" />
      <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-4 mt-6">
        {content.map((p, i) => (
          typeof p === 'string'
            ? <p key={i}>{p}</p>
            : <><h2 key={i} className="font-bold text-[#1B3A6B] text-lg mt-6">{p.h}</h2></>
        ))}
      </div>
    </div>
  );
}

export function Legal() {
  return <LegalPage title="Mentions légales" content={[
    { h: "Éditeur du site" },
    "Teranga Service est une plateforme éditée par la société Teranga Service SARL, immatriculée au registre du commerce de Dakar (Sénégal).",
    { h: "Hébergement" },
    "Le site est hébergé sur des serveurs situés au Sénégal.",
    { h: "Propriété intellectuelle" },
    "Tous les contenus présents sur ce site (textes, images, logos) sont protégés par le droit de la propriété intellectuelle.",
    { h: "Contact" },
    "Pour toute question : contact@terangaservice.sn | +221 77 000 00 00",
  ]} />;
}

export function Privacy() {
  return <LegalPage title="Politique de confidentialité" content={[
    { h: "Données collectées" },
    "Teranga Service collecte des données personnelles nécessaires au fonctionnement de la plateforme : nom, email, téléphone, adresse.",
    { h: "Utilisation des données" },
    "Les données sont utilisées pour gérer votre compte, vos réservations et améliorer nos services.",
    { h: "Vos droits" },
    "Conformément à la loi sénégalaise sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.",
    { h: "Contact DPO" },
    "Pour exercer vos droits : privacy@terangaservice.sn",
  ]} />;
}

export function Terms() {
  return <LegalPage title="Conditions Générales d'Utilisation" content={[
    { h: "Objet" },
    "Les présentes CGU régissent l'utilisation de la plateforme Teranga Service, accessible à l'adresse terangaservice.sn.",
    { h: "Inscription" },
    "L'inscription est gratuite et ouverte à toute personne physique majeure résidant au Sénégal.",
    { h: "Responsabilités" },
    "Teranga Service agit comme intermédiaire entre clients et prestataires. La responsabilité de la qualité des prestations incombe aux prestataires.",
    { h: "Paiements" },
    "Les paiements sont sécurisés. Teranga Service prélève une commission sur chaque transaction.",
  ]} />;
}
