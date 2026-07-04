import { useState } from 'react';
import Icon from '../../components/Icons';

export default function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: 'Question sur un service', message: '' });
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  }

  return (
    <div>
      
      <section className="bg-gradient-to-br from-[#1B3A6B] to-[#142d55] text-white py-16 px-5 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="phone" size={26} color="white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 text-white">Nous contacter</h1>
          <p className="text-blue-200 text-base">Une question ? N'hésitez pas à nous écrire.</p>
        </div>
      </section>

      <section className="py-14 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

          
          <div className="card p-7 border-t-4 border-[#3A9E3A]">
            <h2 className="text-xl font-bold text-[#1B3A6B] mb-6 flex items-center gap-2">
              <Icon name="mail" size={20} color="#3A9E3A" />
              Envoyez-nous un message
            </h2>

            {sent && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
                <Icon name="check" size={16} color="#16A34A" />
                Message envoyé avec succès ! Nous vous répondrons sous 24h.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Nom complet</label>
                <input type="text" className="form-input" placeholder="Votre nom" value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))} required />
              </div>
              <div>
                <label className="form-label">Adresse email</label>
                <input type="email" className="form-input" placeholder="votre@email.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
              </div>
              <div>
                <label className="form-label">Sujet</label>
                <select className="form-input cursor-pointer" value={form.sujet} onChange={e => setForm(p => ({...p, sujet: e.target.value}))}>
                  <option>Question sur un service</option>
                  <option>Problème technique</option>
                  <option>Devenir prestataire</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="form-label">Message</label>
                <textarea rows={5} className="form-input resize-none" placeholder="Votre message..." value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} required />
              </div>
              <button type="submit" className="w-full btn-primary justify-center py-3">
                <Icon name="send" size={16} color="white" />
                Envoyer le message
              </button>
            </form>
          </div>

          
          <div className="space-y-5">
            <div className="card p-7 border-t-4 border-[#3A9E3A]">
              <h2 className="text-xl font-bold text-[#1B3A6B] mb-5 flex items-center gap-2">
                <Icon name="mappin" size={20} color="#3A9E3A" />
                Nos coordonnées
              </h2>
              <div className="space-y-4">
                {[
                  { icon: 'mail', text: 'contact@terangaservice.sn' },
                  { icon: 'phone', text: '+221 77 000 00 00' },
                  { icon: 'mappin', text: 'Dakar, Sénégal' },
                  { icon: 'clock', text: 'Lun - Dim : 7h00 - 20h00' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={item.icon} size={18} color="#3A9E3A" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-7">
              <h3 className="font-semibold text-[#1B3A6B] mb-4 flex items-center gap-2">
                <Icon name="users" size={16} color="#3A9E3A" />
                Suivez-nous
              </h3>
              <div className="flex gap-3">
                {['Facebook', 'Instagram', 'Twitter', 'LinkedIn'].map(s => (
                  <a key={s} href="#" className="w-10 h-10 bg-[#1B3A6B] text-white rounded-lg flex items-center justify-center text-xs font-bold hover:bg-[#3A9E3A] transition-colors no-underline">
                    {s[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
