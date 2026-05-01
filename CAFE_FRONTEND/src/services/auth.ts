import { AuthUser } from '../types';

const AUTH_USER_KEY = 'user';

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const storeUser = (user: AuthUser) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem('token');
};
