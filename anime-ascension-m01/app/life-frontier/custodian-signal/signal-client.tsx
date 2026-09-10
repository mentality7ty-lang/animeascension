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

type Channel = 'chakra' | 'curse' | 'aura';

export default function CustodianSignalClient({ userId, character }: { userId: string; character: Character }) {
  const db = createClient();
  const alreadyDone = character.rank.toLowerCase().includes('custodian ping');

  const [phase, setPhase] = useState<'incoming' | 'handshake' | 'challenge' | 'done'>(alreadyDone ? 'done' : 'incoming');
  const [integrity, setIntegrity] = useState(100);
  const [trace, setTrace] = useState(0);
  const [locks, setLocks] = useState<Record<Channel, boolean>>({ chakra: false, curse: false, aura: false });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(alreadyDone ? 'CUSTODIAN ROUTE · PARTIALLY EXPOSED' : 'UNKNOWN NETWORK PACKET · PRIORITY OVERRIDE');

  function acceptSignal() {
    setPhase('handshake');
    setMessage('NETWORK CUSTODIAN · ACTIVE HANDSHAKE');
  }

  function stabilize(channel: Channel) {
    if (busy || locks[channel]) return;
    setBusy(true);

    const penalty = 8 + Math.floor(Math.random() * 8);
    const gain = 26 + Math.floor(character.focus / 5) + Math.floor(Math.random() * 8);

    setIntegrity((value) => Math.max(0, value - penalty));
    setTrace((value) => Math.min(100, value + gain));
    setLocks((value) => ({ ...value, [channel]: true }));
    setMessage(`${channel.toUpperCase()} CHANNEL · AUTH TOKEN CAPTURED`);

    setTimeout(() => {
      setBusy(false);
      const nextLocks = { ...locks, [channel]: true };
      if (Object.values(nextLocks).every(Boolean)) setPhase('challenge');
    }, 360);
  }

  async function completeChallenge() {
    if (busy) return;
    setBusy(true);
    setMessage('CUSTODIAN PACKET · DECRYPTING');

    const { error } = await db
      .from('characters')
      .update({
        power: character.power + 45,
        focus: character.focus + 3,
        endurance: character.endurance + 2,
        rank: `${character.rank} · Custodian Ping`,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      setMessage('SAVE FAILED · TRY AGAIN');
      setBusy(false);
      return;
    }

    setPhase('done');
    setMessage('CUSTODIAN ROUTE · PARTIALLY EXPOSED');
    setBusy(false);
  }

  return (
    <main className="cust-shell">
      <div className="cust-grid" />
      <header>
        <span>WORLD 03 // CUSTODIAN SIGNAL</span>
        <strong>{message}</strong>
      </header>

      {phase === 'incoming' && (
        <section className="cust-card incoming">
          <span>UNSOLICITED NETWORK TRAFFIC</span>
          <h1>The network is calling you by name.</h1>
          <p>
            The signal is not coming from Life Frontier. It is being injected directly into the relay layer that links the worlds.
          </p>
          <div className="packet">
            <small>SENDER</small>
            <b>NETWORK CUSTODIAN</b>
            <small>SUBJECT</small>
            <b>UNAUTHORIZED ASCENDER</b>
          </div>
          <button onClick={acceptSignal}>ACCEPT HANDSHAKE</button>
          <Link href="/life-frontier">IGNORE SIGNAL</Link>
        </section>
      )}

      {phase === 'handshake' && (
        <section className="cust-card">
          <span>COUNTER-TRACE PROTOCOL</span>
          <h1>Stay connected long enough to trace it.</h1>
          <p>
            The Custodian is probing all three energy signatures. Lock each channel before connection integrity collapses.
          </p>

          <div className="cust-bars">
            <div>
              <small>CONNECTION INTEGRITY</small>
              <strong>{integrity}%</strong>
              <i><em style={{ width: `${integrity}%` }} /></i>
            </div>
            <div>
              <small>COUNTER-TRACE</small>
              <strong>{trace}%</strong>
              <i><em style={{ width: `${trace}%` }} /></i>
            </div>
          </div>

          <div className="cust-channels">
            <button disabled={busy || locks.chakra || integrity <= 0} onClick={() => stabilize('chakra')}>
              <small>WORLD 01</small>
              <b>{locks.chakra ? 'CHAKRA LOCKED' : 'LOCK CHAKRA'}</b>
            </button>
            <button disabled={busy || locks.curse || integrity <= 0} onClick={() => stabilize('curse')}>
              <small>WORLD 02</small>
              <b>{locks.curse ? 'CURSED LOCKED' : 'LOCK CURSED'}</b>
            </button>
            <button disabled={busy || locks.aura || integrity <= 0} onClick={() => stabilize('aura')}>
              <small>WORLD 03</small>
              <b>{locks.aura ? 'AURA LOCKED' : 'LOCK AURA'}</b>
            </button>
          </div>

          {integrity <= 0 && <button onClick={() => window.location.reload()}>RESTART HANDSHAKE</button>}
        </section>
      )}

      {phase === 'challenge' && (
        <section className="cust-card challenge">
          <span>RETURN PACKET CAPTURED</span>
          <h1>It wants to test whether you belong here.</h1>
          <blockquote>
            NETWORK CUSTODIAN // “ACCESS TO THE FOURTH ROUTE REQUIRES CUSTODIAN VALIDATION.”
          </blockquote>
          <p>
            The packet contains a partial route signature. The missing 25% of World 04 is not hidden in another relay. It is protected behind a validation gate controlled by the Custodian itself.
          </p>
          <div className="route-fragment">
            <small>WORLD 04 ROUTE</small>
            <b>75% KNOWN</b>
            <em>25% CUSTODIAN-LOCKED</em>
          </div>
          <button disabled={busy} onClick={completeChallenge}>SAVE TRACE DATA</button>
        </section>
      )}

      {phase === 'done' && (
        <section className="cust-card done">
          <span>CUSTODIAN CONTACT // COMPLETE</span>
          <h1>World 04 cannot be forced open.</h1>
          <p>
            The final route fragment is generated only after a Custodian validation. The system is now actively watching your character across the relay network.
          </p>
          <strong>+45 POWER · +3 FOCUS · +2 ENDURANCE</strong>
          <div className="route-fragment">
            <small>NEXT OBJECTIVE</small>
            <b>CUSTODIAN VALIDATION</b>
            <em>ACCESS TRIAL REQUIRED</em>
          </div>
          <p className="cust-warning">A temporary validation arena has been opened outside normal world coordinates.</p>
          <button disabled>CUSTODIAN TRIAL · NEXT MILESTONE</button>
          <Link href="/life-frontier">RETURN TO FRONTIER →</Link>
        </section>
      )}
    </main>
  );
}
