import { UserProfile, TaxonomyHistoryItem, FullAnalysisResult, UserRole } from '../types';

const USER_STORAGE_KEY = 'semantico_user_profile';
const HISTORY_STORAGE_KEY = 'semantico_taxonomy_history';

export const DEFAULT_USER: UserProfile = {
  uid: 'user-semantico-superadmin',
  displayName: 'Alex Rodrigues',
  email: 'alexrodrigues43@gmail.com',
  role: 'admin',
  status: 'active',
  plan: 'lifetime',
  usageCount: 14,
  notes: 'Super Admin',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

export function getStoredUser(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_USER, ...parsed };
    }
  } catch (e) {
    console.warn('Erro ao carregar usuário:', e);
  }
  return DEFAULT_USER;
}

export function saveStoredUser(user: UserProfile): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Erro ao salvar usuário:', e);
  }
}

export function getStoredHistory(): TaxonomyHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao carregar histórico:', e);
  }
  return [];
}

export function saveHistoryItem(data: FullAnalysisResult): TaxonomyHistoryItem[] {
  try {
    const current = getStoredHistory();
    // Check if duplicate topic exists recently
    const filtered = current.filter((item) => item.topic.toLowerCase() !== data.topic.toLowerCase());

    const newItem: TaxonomyHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      topic: data.topic,
      domain: data.domain,
      subcategoriesCount: data.taxonomy.subcategories?.length || 0,
      facetsCount: data.facets?.facets?.length || 0,
      data,
    };

    const updated = [newItem, ...filtered].slice(0, 30); // keep up to 30 items
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Erro ao salvar item no histórico:', e);
    return [];
  }
}

export function deleteHistoryItem(id: string): TaxonomyHistoryItem[] {
  try {
    const current = getStoredHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Erro ao deletar item do histórico:', e);
    return [];
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.warn('Erro ao limpar histórico:', e);
  }
}
