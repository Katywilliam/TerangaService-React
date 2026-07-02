import { useState, useEffect } from 'react'
import {
  getReservationsClient,
  getReservationsPrestataire,
  createReservation,
  updateStatutReservation,
  deleteReservation,
} from '../services/reservationsService'
import { useAuth } from '../contexts/AuthContext'

export const useReservations = () => {
  const { user, userRole } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReservations = async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      let data
      if (userRole === 'prestataire') {
        data = await getReservationsPrestataire(user.id)
      } else {
        data = await getReservationsClient(user.id)
      }
      setReservations(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [user])

  const ajouter = async (reservation) => {
    const data = await createReservation({ ...reservation, client_id: user.id })
    setReservations((prev) => [data, ...prev])
    return data
  }

  const updateStatut = async (id, statut) => {
    const data = await updateStatutReservation(id, statut)
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, statut: data.statut } : r))
    )
    return data
  }

  const supprimer = async (id) => {
    await deleteReservation(id)
    setReservations((prev) => prev.filter((r) => r.id !== id))
  }

  return {
    reservations,
    loading,
    error,
    ajouter,
    updateStatut,
    supprimer,
    refetch: fetchReservations,
  }
}
