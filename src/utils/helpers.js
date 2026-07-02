// Formater un montant en FCFA
export const formatCFA = (amount) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

// Formater une date en français
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Formater date + heure
export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Tronquer un texte
export const truncate = (text, max = 100) => {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '...' : text
}

// Obtenir les initiales d'un nom
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Badge couleur selon statut réservation
export const getStatutColor = (statut) => {
  const map = {
    confirmé:  { bg: 'bg-green-100',  text: 'text-green-700' },
    en_cours:  { bg: 'bg-amber-100',  text: 'text-amber-700' },
    terminé:   { bg: 'bg-gray-100',   text: 'text-gray-600'  },
    annulé:    { bg: 'bg-red-100',    text: 'text-red-600'   },
    en_attente:{ bg: 'bg-blue-100',   text: 'text-blue-700'  },
  }
  return map[statut] || { bg: 'bg-gray-100', text: 'text-gray-600' }
}
