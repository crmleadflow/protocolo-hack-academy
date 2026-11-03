// Datos que el visitante dejó en el formulario, guardados mientras entra con Google.
const KEY = "ph_join_community";

export interface PendingJoin {
  full_name: string;
  email: string;
  phone: string;
}

export const savePendingJoin = (data: PendingJoin) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* sin almacenamiento: el flujo sigue pidiendo los datos en /login */
  }
};

export const readPendingJoin = (): PendingJoin | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PendingJoin) : null;
  } catch {
    return null;
  }
};

export const clearPendingJoin = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada que limpiar */
  }
};
