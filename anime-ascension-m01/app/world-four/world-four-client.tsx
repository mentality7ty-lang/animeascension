'use client';
import Link from 'next/link';
import {useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type Character={name:string;power:number;strength:number;speed:number;endurance:number;focus:number;rank:string;world:string};
type Phase='gate'|'transit'|'arrival'|'awakened';

export default function WorldFourClient({userId,character}:{userId:string;character:Character}){
  const db=createClient();
  const rank=character.rank.toLowerCase();
  const already=rank.includes('spirit sensed');
  const anchored=rank.includes('spirit anchored');
  const [phase,setPhase]=useState<Phase>(already?'awakened':'gate');
  const [resonance,setResonance]=useState(0);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState(anchored?'SPIRIT ANCHOR · STABLE':already?'SPIRITUAL PRESSURE · DETECTED':'ROUTING KEY · 100%');

  async function enter(){setBusy(true);setMessage('CUSTODIAN ROUTE · OPENING');await db.from('characters').update({world:'spirit'}).eq('user_id',userId);setTimeout(()=>{setPhase('transit');setBusy(false);},500);}
  function stabilize(){if(busy)return;setBusy(true);setMessage('FOUR ENERGY SYSTEMS · INTERFERENCE');setTimeout(()=>{setPhase('arrival');setBusy(false);},700);}
  async function sense(){if(busy)return;const next=Math.min(100,resonance+20);setResonance(next);setMessage(next<100?'UNKNOWN PRESSURE · CLOSING IN':'PRESSURE SOURCE · EVERYWHERE');if(next<100)return;setBusy(true);const {error}=await db.from('characters').update({power:character.power+60,focus:character.focus+3,endurance:character.endurance+2,rank:`${character.rank} · Spirit Sensed`,world:'spirit',updated_at:new Date().toISOString()}).eq('user_id',userId);setBusy(false);if(error){setMessage('SAVE FAILED · TRY AGAIN');return;}setPhase('awakened');}

  return <main className="w4-shell"><div className="w4-moon"/><div className="w4-city"/><div className="w4-ash"/><header><span>WORLD 04 // ROUTE AUTHORIZED</span><strong>{message}</strong></header>
    {phase==='gate'&&<section className="w4-card gate"><span>CUSTODIAN TOKEN ACCEPTED</span><h1>OPEN<br/>WORLD 04</h1><p>The missing route is complete. This destination carries an energy signature unlike Chakra, Cursed Energy or Life Aura.</p><button disabled={busy} onClick={enter}>INITIATE TRANSIT</button></section>}
    {phase==='transit'&&<section className="w4-card"><span>BETWEEN WORLDS</span><h1>Something notices you.</h1><p>Three familiar energies pull in different directions. A fourth pressure passes through all of them without behaving like any of them.</p><div className="w4-energy"><b>CHAKRA</b><b>CURSED ENERGY</b><b>LIFE AURA</b><b className="unknown">???</b></div><button onClick={stabilize}>STABILIZE CORE</button></section>}
    {phase==='arrival'&&<section className="w4-card"><span>UNKNOWN CITY // NIGHT</span><h1>The air has weight.</h1><p>You arrive above a silent city washed in pale light. Human silhouettes move below — but several signatures are impossible to read as ordinary life.</p><div className="pressure"><i style={{width:`${resonance}%`}}/><b>{resonance}%</b></div><button disabled={busy} onClick={sense}>SENSE THE PRESSURE</button></section>}
    {phase==='awakened'&&<section className="w4-card result"><span>{anchored?'FOUNDATION STABLE':'NEW ENERGY DISCOVERED'}</span><h1>{anchored?'SPIRIT ANCHOR':'SPIRITUAL PRESSURE'}</h1><p>{anchored?'Kael taught you to preserve your identity under hostile Spiritual Pressure. The next discipline is projection.':'You cannot control it yet. You can only perceive it — and now that you can, the city is no longer empty.'}</p><div className="w4-energy"><b>CHAKRA · ACTIVE</b><b>CURSED ENERGY · ACTIVE</b><b>LIFE AURA · ACTIVE</b><b className="unknown">SPIRITUAL PRESSURE · {anchored?'ANCHORED':'SENSED'}</b></div>{anchored?<button disabled>PRESSURE RELEASE · NEXT MILESTONE</button>:<Link href="/world-four/first-spirit">FIRST SPIRIT ENCOUNTER →</Link>}<Link href="/life-frontier">RETURN TO LIFE FRONTIER →</Link></section>}
  </main>;
}
