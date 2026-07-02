import { useState } from 'react';
import Icon from './Icons';

const responses = {
  default: "Bonjour ! Comment puis-je vous aider ? Posez-moi vos questions sur nos services, tarifs ou réservations.",
  tarifs: "Nos tarifs débutent à 2 500 FCFA/heure pour la garde d'enfants, jusqu'à 5 500 FCFA/intervention pour l'électricité. Consultez notre page Tarifs pour tous les détails.",
  services: "Nous proposons : Ménage, Plomberie, Cuisine à domicile, Électricité, Climatisation, Informatique, Jardinage et Garde d'enfants.",
  reservation: "Pour réserver, choisissez votre service, sélectionnez un prestataire disponible et choisissez votre créneau. C'est simple et rapide !",
  contact: "Contactez-nous : contact@terangaservice.sn | +221 77 000 00 00 | Lun-Dim 7h-20h",
};

function getResponse(msg) {
  const m = msg.toLowerCase();
  if (m.includes('tarif') || m.includes('prix') || m.includes('coût')) return responses.tarifs;
  if (m.includes('service') || m.includes('ménage') || m.includes('plomb')) return responses.services;
  if (m.includes('réserv') || m.includes('book') || m.includes('rendez')) return responses.reservation;
  if (m.includes('contact') || m.includes('appel') || m.includes('téléphone')) return responses.contact;
  return responses.default;
}

export default function Support() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'support', text: responses.default }
  ]);
  const [input, setInput] = useState('');

  function send() {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    const reply = { from: 'support', text: getResponse(input) };
    setMessages(prev => [...prev, userMsg, reply]);
    setInput('');
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: 420 }}>
          <div className="bg-[#1B3A6B] px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3A9E3A] rounded-full flex items-center justify-center text-white text-xs font-bold">TS</div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Support Teranga</p>
              <p className="text-green-300 text-xs mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />En ligne
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <Icon name="x" size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50" style={{ maxHeight: 280 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-[#3A9E3A] text-white rounded-tr-sm'
                    : 'bg-white text-gray-700 border border-gray-200 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Votre question..."
              className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#3A9E3A] font-[Poppins] min-w-0"
            />
            <button onClick={send} className="bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white p-2 rounded-lg transition-colors">
              <Icon name="send" size={15} color="white" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-[#3A9E3A] hover:bg-[#2d8a2d] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label="Support"
      >
        <Icon name={open ? 'x' : 'chat'} size={22} color="white" />
      </button>
    </div>
  );
}
