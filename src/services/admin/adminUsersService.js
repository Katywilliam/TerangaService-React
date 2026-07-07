import { supabase } from '../supabase';

/**
 * Crée un nouveau compte administrateur via l'Edge Function sécurisée.
 * L'Edge Function vérifie elle-même que l'appelant est un admin authentifié
 * avant d'utiliser la clé service_role côté serveur.
 */
export async function createAdmin({ email, password, nom, prenom, telephone }) {
  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body: { email, password, nom, prenom, telephone },
  });

  if (error) {
    // supabase-js met le corps de la réponse d'erreur dans error.context
    let message = error.message || "Erreur lors de la création du compte.";
    try {
      const parsed = await error.context?.json?.();
      if (parsed?.error) message = parsed.error;
    } catch {
      // corps non-JSON ou déjà consommé, on garde le message par défaut
    }
    throw new Error(message);
  }

  if (data?.error) throw new Error(data.error);
  return data;
}

/** Génère un mot de passe temporaire lisible à communiquer au nouvel admin. */
export function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}