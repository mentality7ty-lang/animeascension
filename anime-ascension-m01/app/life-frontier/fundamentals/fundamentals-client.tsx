'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Character = {
  name: string;
  power: number;
  strength: number;
  speed: number;
  endurance: number;
  focus: number;
  rank: string;
  world: string;
};

type Drill = 'guard' | 'flow' | 'burst';

export default function FundamentalsClient({ userId, character }: { userId: string; character: Character }) {
  const db = createClient();
  const mastered = character.rank.toLowerCase().includes('aura fundamentals');
  const [drill, setDrill] = useState<Drill>('guard');
  const [guard, setGuard] = useState(mastered ? 100 : 0);
  const [flow, setFlow] = useState(mastered ? 100 : 0);
  const [burst, setBurst] = useState(mastered ? 100 : 0);
  const [aura, setAura] = useState(100);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(mastered);
  const [message, setMessage] = useState(mastered ? 'AURA FUNDAMENTALS · MASTERED' : 'Riven: “Aura is a body skill before it is a weapon.”');

  const current = drill === 'guard' ? guard : drill === 'flow' ? flow : burst;

  function train() {
    if (busy || complete) return;
    setBusy(true);
    const relevant = drill === 'guard' ? character.endurance : drill === 'flow' ? character.focus : character.strength;
    const gain = Math.min(40, 20 + Math.floor(relevant / 4) + Math.floor(Math.random() * 8));
    const cost = drill === 'guard' ? 12 : drill === 'flow' ? 9 : 18;
    const nextAura = Math.max(0, aura - cost);
    const next = Math.min(100, current + gain);
    setAura(nextAura);

    if (drill === 'guard') setGuard(next);
    if (drill === 'flow') setFlow(next);
    if (drill === 'burst') setBurst(next);

    setMessage(drill === 'guard' ? 'AURA COATS THE BODY · IMPACT DISPERSED' : drill === 'flow' ? 'WASTE REDUCED · CIRCULATION STABILIZED' : 'AURA RELEASED · FORCE AMPLIFIED');

    setTimeout(() => {
      setBusy(false);
      if (next >= 100) {
        if (drill === 'guard') {
          setDrill('flow');
          setMessage('GUARD LEARNED · NOW KEEP AURA MOVING');
        } else if (drill === 'flow') {
          setDrill('burst');
          setMessage('FLOW LEARNED · NOW RELEASE IT ON IMPACT');
        } else {
          void finish();
        }
      }
    }, 450);
  }

  function recover() {
    if (busy || aura >= 100) return;
    setAura((value) => Math.min(100, value + 30));
    setMessage('CONTROLLED BREATHING · AURA RECOVERED');
  }

  async function finish() {
    if (mastered) {
      setComplete(true);
      return;
    }
    setBusy(true);
    const { error } = await db
      .from('characters')
      .update({
        power: character.power + 45,
        strength: character.strength + 2,
        endurance: character.endurance + 3,
        focus: character.focus + 3,
        rank: `${character.rank} · Aura Fundamentals`,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      setMessage('SAVE FAILED · TRY AGAIN');
      setBusy(false);
      return;
    }

    setComplete(true);
    setBusy(false);
    setMessage('AURA FUNDAMENTALS · MASTERED');
  }

  return (
    <main className="fund-shell">
      <header>
        <span>LIFE FRONTIER // RIVEN'S CAMP</span>
        <strong>{message}</strong>
      </header>

      {!complete ? (
        <section className="fund-card">
          <span>FUNDAMENTAL {drill === 'guard' ? '01' : drill === 'flow' ? '02' : '03'} // {drill.toUpperCase()}</span>
          <h1>{drill === 'guard' ? 'Keep life close.' : drill === 'flow' ? 'Waste nothing.' : 'Release on impact.'}</h1>
          <p>
            {drill === 'guard'
              ? 'Wrap Life Aura around the body. It does not make you invulnerable; it gives incoming force another layer to cross.'
              : drill === 'flow'
                ? 'Circulate Aura continuously instead of leaking it. Efficient control determines how long you can fight.'
                : 'Compress the circulating Aura for an instant and release it with a physical strike. Timing matters more than raw output.'}
          </p>

          <div className="fund-meter"><small>MASTERY</small><strong>{current}%</strong><i><em style={{ width: `${current}%` }} /></i></div>
          <div className="fund-meter aura"><small>LIFE AURA</small><strong>{aura}%</strong><i><em style={{ width: `${aura}%` }} /></i></div>

          <div className="fund-actions">
            <button disabled={busy || aura < (drill === 'burst' ? 18 : drill === 'guard' ? 12 : 9)} onClick={train}>TRAIN {drill.toUpperCase()}</button>
            <button className="secondary" disabled={busy || aura >= 100} onClick={recover}>CONTROLLED BREATH</button>
          </div>

          <div className="fund-track">
            <b className={guard >= 100 ? 'learned' : ''}>AURA GUARD</b>
            <b className={flow >= 100 ? 'learned' : ''}>AURA FLOW</b>
            <b className={burst >= 100 ? 'learned' : ''}>AURA BURST</b>
          </div>
        </section>
      ) : (
        <section className="fund-card complete">
          <span>ENERGY SYSTEM 03 // COMBAT READY</span>
          <h1>LIFE AURA FUNDAMENTALS</h1>
          <p>Riven finally allows you to use Life Aura deliberately in combat. It is now a finite resource: guard consumes it, efficient circulation preserves it, and burst converts it into physical force.</p>
          <strong>+45 POWER · +2 STRENGTH · +3 ENDURANCE · +3 FOCUS</strong>
          <div className="fund-track">
            <b className="learned">AURA GUARD</b><b className="learned">AURA FLOW</b><b className="learned">AURA BURST</b>
          </div>
          <blockquote>Riven: “Good. Now I can hit you for real.”</blockquote>
          <button disabled>RIVEN SPARRING TEST · NEXT MILESTONE</button>
          <Link href="/life-frontier">RETURN TO FRONTIER →</Link>
        </section>
      )}
    </main>
  );
}
