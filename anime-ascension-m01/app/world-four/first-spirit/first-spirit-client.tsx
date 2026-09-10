'use client';
import Link from 'next/link';
import {useState} from 'react';
import {createClient} from '@/lib/supabase/client';

type C={name:string;power:number;strength:number;speed:number;endurance:number;focus:number;rank:string;world:string};
type Phase='meeting'|'pressure'|'lesson'|'done';

export default function FirstSpiritClient({userId,character:c}:{userId:string;character:C}){
  const db=createClient();
  const complete=c.rank.toLowerCase().includes('spirit anchored');
  const [phase,setPhase]=useState<Phase>(complete?'done':'meeting');
  const [pressure,setPressure]=useState(0);
  const [anchor,setAnchor]=useState(100);
  const [busy,setBusy]=useState(false);
  const [log,setLog]=useState(complete?'SPIRIT ANCHOR · STABLE':'UNKNOWN SIGNATURE · APPROACHING');

  function approach(){setPhase('pressure');setLog('HOSTILE PRESSURE · NOT AN ATTACK');}
  function endure(){
    if(busy)return;
    setBusy(true);
    const next=Math.min(100,pressure+20);
    setPressure(next);
    setAnchor(a=>Math.max(0,a-(next>=80?22:12)));
    setLog(next<100?'KEEP YOUR IDENTITY SEPARATE FROM THE PRESSURE':'PRESSURE LIMIT · SURVIVED');
    setTimeout(()=>{setBusy(false);if(next>=100)setPhase('lesson');},280);
  }
  function breathe(){if(busy)return;setAnchor(a=>Math.min(100,a+28));setLog('CORE ANCHOR · RECOVERING');}
  async function learn(){
    if(busy)return;
    setBusy(true);
    const {error}=await db.from('characters').update({
      power:c.power+50,
      endurance:c.endurance+3,
      focus:c.focus+4,
      rank:`${c.rank} · Spirit Anchored`,
      updated_at:new Date().toISOString()
    }).eq('user_id',userId);
    setBusy(false);
    if(error){setLog('SAVE FAILED · TRY AGAIN');return;}
    setPhase('done');setLog('SPIRIT ANCHOR · STABLE');
  }

  return <main className="spirit-encounter"><div className="spirit-haze"/><header><span>WORLD 04 // FIRST CONTACT</span><strong>{log}</strong></header>
    {phase==='meeting'&&<section className="spirit-panel"><span>ROOFTOP // 02:14</span><h1>“You’re loud.”</h1><p>A figure lands behind you without disturbing the roof. You sensed the pressure before the movement.</p><blockquote>KAEL // “Four energy signatures in one body. That should not be possible.”</blockquote><button onClick={approach}>FACE KAEL</button></section>}
    {phase==='pressure'&&<section className="spirit-panel"><span>PRESSURE TEST</span><h1>DON'T<br/>KNEEL.</h1><p>Kael releases a fraction of his Spiritual Pressure. It does not strike your body. It tries to overwhelm your sense of self.</p><div className="spirit-bars"><label>PRESSURE <b>{pressure}%</b><i><em style={{width:`${pressure}%`}}/></i></label><label>CORE ANCHOR <b>{anchor}%</b><i><em style={{width:`${anchor}%`}}/></i></label></div>{anchor<=0?<><p className="danger">Your energy systems collapse into each other.</p><button onClick={()=>{setPressure(0);setAnchor(100);}}>RESET STANCE</button></>:<><button disabled={busy} onClick={endure}>ENDURE PRESSURE</button><button disabled={busy} onClick={breathe}>ANCHOR BREATH</button></>}</section>}
    {phase==='lesson'&&<section className="spirit-panel"><span>KAEL // OBSERVATION</span><h1>Pressure is not power.</h1><p>Kael explains that every spirit leaves weight on the world. The first discipline is not projecting that weight — it is preventing another spirit from rewriting yours.</p><blockquote>KAEL // “Before you learn to release pressure, learn to remain yourself inside mine.”</blockquote><button disabled={busy} onClick={learn}>FORM SPIRIT ANCHOR</button></section>}
    {phase==='done'&&<section className="spirit-panel result"><span>FOUNDATION LEARNED</span><h1>SPIRIT<br/>ANCHOR</h1><p>You still cannot weaponize Spiritual Pressure, but hostile pressure can no longer freely crush your other energy systems.</p><strong>+50 POWER · +3 ENDURANCE · +4 FOCUS</strong><blockquote>KAEL // “Now we find out whether you can make the world feel you back.”</blockquote><button disabled>PRESSURE RELEASE · NEXT MILESTONE</button><Link href="/world-four">RETURN TO WORLD 04 →</Link></section>}
  </main>;
}
