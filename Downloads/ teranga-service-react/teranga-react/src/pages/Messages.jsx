import { useState, useRef } from 'react';
import Icon from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

const CONVS = [
  { id: 1, nom: 'Mamadou Sow', service: 'Ménage complet', lastMsg: 'Je serai chez vous demain à 8h.', time: 'Il y a 2h', unread: 2, online: true },
  { id: 2, nom: 'Support Teranga', service: 'Support', lastMsg: 'Votre demande a bien été prise en compte.', time: 'Hier', unread: 0, online: true },
  { id: 3, nom: 'Omar Badji', service: 'Plomberie', lastMsg: 'Merci pour votre confiance !', time: 'Il y a 3 jours', unread: 0, online: false },
];
const MSGS = {
  1: [{ id:1, from:'other', text:'Bonjour ! Je confirme votre réservation pour demain.', time:'09:00' },{ id:2, from:'me', text:'Parfait, merci !', time:'09:05' },{ id:3, from:'other', text:'Je serai chez vous demain à 8h.', time:'10:30' }],
  2: [{ id:1, from:'other', text:'Bonjour, comment puis-je vous aider ?', time:'08:00' },{ id:2, from:'me', text:"J'ai une question.", time:'08:05' },{ id:3, from:'other', text:'Votre demande a été prise en compte.', time:'08:10' }],
  3: [{ id:1, from:'other', text:'La réparation est terminée.', time:'Lun' },{ id:2, from:'me', text:'Merci !', time:'Lun' },{ id:3, from:'other', text:'Merci pour votre confiance !', time:'Lun' }],
};
function initials(n){ return (n||'').split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2); }

export default function Messages() {
  const [selected, setSelected] = useState(1);
  const [messages, setMessages] = useState(MSGS[1]);
  const [newMsg, setNewMsg] = useState('');
  const endRef = useRef(null);
  const conv = CONVS.find(c=>c.id===selected);

  const send = () => {
    if (!newMsg.trim()) return;
    setMessages(p=>[...p,{id:Date.now(),from:'me',text:newMsg.trim(),time:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}]);
    setNewMsg('');
    setTimeout(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),100);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-[Poppins]">
      <h1 className="text-xl font-bold text-[#1B3A6B] flex items-center gap-2 mb-6">
        <Icon name="chat" size={22} color="#1B3A6B" /> Messages
        <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{height:'70vh'}}>
        <div className="card overflow-hidden flex flex-col border-t-4 border-[#1B3A6B]">
          <div className="p-4 border-b border-gray-100">
            <input type="text" placeholder="Rechercher..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#3A9E3A]" />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {CONVS.map(c=>(
              <div key={c.id} onClick={()=>{setSelected(c.id);setMessages(MSGS[c.id]||[]);}}
                className={`flex items-start gap-3 p-4 cursor-pointer ${selected===c.id?'bg-blue-50 border-l-4 border-l-[#1B3A6B]':'hover:bg-gray-50'}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-sm font-bold">{initials(c.nom)}</div>
                  {c.online&&<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-0.5"><span className="font-semibold text-sm text-[#1B3A6B] truncate">{c.nom}</span><span className="text-xs text-gray-400 ml-1">{c.time}</span></div>
                  <p className="text-xs text-gray-400 mb-0.5">{c.service}</p>
                  <p className="text-xs text-gray-500 truncate">{c.lastMsg}</p>
                </div>
                {c.unread>0&&<span className="bg-[#3A9E3A] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{c.unread}</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 card overflow-hidden flex flex-col border-t-4 border-[#3A9E3A]">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-sm font-bold">{initials(conv?.nom||'')}</div>
            <div>
              <p className="font-bold text-sm text-[#1B3A6B]">{conv?.nom}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${conv?.online?'bg-green-500':'bg-gray-300'}`}></span>
                {conv?.online?'En ligne':'Hors ligne'} · {conv?.service}
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.from==='me'?'justify-end':'justify-start'}`}>
                {m.from==='other'&&<div className="w-7 h-7 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-xs font-bold mr-2 self-end flex-shrink-0">{initials(conv?.nom||'')}</div>}
                <div>
                  <div className={`px-4 py-2.5 rounded-2xl max-w-xs text-sm ${m.from==='me'?'bg-[#1B3A6B] text-white rounded-br-none':'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'}`}>{m.text}</div>
                  <p className={`text-xs text-gray-400 mt-1 ${m.from==='me'?'text-right':'text-left'}`}>{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={endRef}/>
          </div>
          <div className="px-5 py-4 border-t border-gray-100 bg-white flex gap-3">
            <input type="text" value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
              placeholder="Écrivez votre message…"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#3A9E3A] font-[Poppins]"/>
            <button onClick={send} disabled={!newMsg.trim()} className="w-10 h-10 bg-[#3A9E3A] hover:bg-[#2d8a2d] disabled:opacity-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="send" size={16} color="white"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
