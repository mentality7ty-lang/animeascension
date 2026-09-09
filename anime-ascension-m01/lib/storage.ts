export type PlayerSave = {
  name: string;
  hair: string;
  eyes: string;
  outfit: string;
  power: number;
  createdAt: string;
};

const KEY = 'anime-ascension-player-v1';

export function savePlayer(player: PlayerSave) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(player));
}

export function loadPlayer(): PlayerSave | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PlayerSave;
  } catch {
    return null;
  }
}
