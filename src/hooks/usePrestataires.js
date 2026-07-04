import { useState, useEffect } from 'react'
import { getPrestataires } from '../services/public/prestatairesService'

export const usePrestataires = (filters = {}) => {
  const [prestataires, setPrestataires] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPrestataires = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPrestataires(filters)
      setPrestataires(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrestataires()
  }, [filters.ville, filters.service, filters.note_min, filters.prix_max])

  return { prestataires, loading, error, refetch: fetchPrestataires }
}
