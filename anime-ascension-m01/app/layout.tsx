import type { Metadata } from 'next';
import './globals.css';
import './auth.css';
import './combat.css';
import './chakra.css';
import './chakra-training.css';
import './mission/mission.css';
import './village/village.css';
import './stolen-supplies/stolen-supplies.css';
import MissionLauncher from './mission/mission-launcher';

export const metadata: Metadata = { title: 'Anime Ascension', description: 'Begin with nothing. Ascend beyond worlds.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}<MissionLauncher /></body></html>; }
