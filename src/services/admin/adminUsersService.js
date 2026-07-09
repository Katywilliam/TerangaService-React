import { supabase } from '../supabase';

export async function createAdmin({ email, password, nom, prenom, telephone }) {
  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body: { email, password, nom, prenom, telephone },
  });

  if (error) {
    let message = error.message || "Erreur lors de la création du compte.";
    try {
      const parsed = await error.context?.json?.();
      if (parsed?.error) message = parsed.error;
    } catch {
    }
    throw new Error(message);
  }

  if (data?.error) throw new Error(data.error);
  return data;
}

export function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}