'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FieldMission(){
 const router=useRouter();
 const [hp,setHp]=useState(100),[enemyHp,setEnemyHp]=useState(120),[chakra,setChakra]=useState(100),[combo,setCombo]=useState(0),[text,setText]=useState('A rogue scout blocks the forest road.'),[locked,setLocked]=useState(false),[won,setWon]=useState(false);
 function enemyTurn(){setLocked(true);setTimeout(()=>{const dmg=12+Math.floor(Math.random()*7);setHp(v=>Math.max(0,v-dmg));setCombo(0);setText(`ROGUE COUNTER · ${dmg} DAMAGE`);setLocked(false)},520)}
 function hit(dmg:number,label:string,cost=0){if(locked||won||hp<=0||chakra<cost)return;if(cost)setChakra(v=>v-cost);const bonus=Math.min(combo*2,10);const total=dmg+bonus;const next=Math.max(0,enemyHp-total);setEnemyHp(next);setCombo(v=>v+1);setText(`${label} · ${total} DAMAGE · COMBO x${combo+1}`);if(next<=0){setWon(true);setText('FIELD MISSION COMPLETE · THE ROAD IS CLEAR');return}enemyTurn()}
 function guard(){if(locked||won||hp<=0)return;setLocked(true);setText('GUARDING · CHAKRA FOCUSED');setTimeout(()=>{setHp(v=>Math.max(0,v-4));setChakra(v=>Math.min(100,v+15));setText('GUARD SUCCESS · 4 DAMAGE · +15 CHAKRA');setLocked(false)},650)}
 function retry(){setHp(100);setEnemyHp(120);setChakra(100);setCombo(0);setWon(false);setLocked(false);setText('A rogue scout blocks the forest road.')}
 return <main className="field-mission"><div className="field-fog"/><header><span>FIELD MISSION // FOREST ROAD</span><strong>{text}</strong></header><section className="field-hud"><div><label>YOU</label><b>{hp} HP</b><i><em style={{width:`${hp}%`}}/></i></div><div><label>ROGUE SCOUT</label><b>{enemyHp} HP</b><i><em style={{width:`${enemyHp/120*100}%`}}/></i></div></section><div className="field-chakra"><span>CHAKRA {chakra}/100</span><i><em style={{width:`${chakra}%`}}/></i></div><motion.div className="field-player" animate={locked?{x:[0,8,0]}:{}}><div/><span/></motion.div><motion.div className="field-enemy" animate={locked?{x:[0,-14,0]}:{}}><div/><span/></motion.div><div className="combo-readout">COMBO <strong>x{combo}</strong></div><nav>{hp<=0?<button onClick={retry}>RETRY MISSION</button>:won?<><button onClick={()=>router.push('/')}>RETURN TO WORLD</button><button onClick={retry}>REPLAY</button></>:<><button disabled={locked} onClick={()=>hit(12,'STRIKE')}>STRIKE</button><button disabled={locked} onClick={guard}>GUARD</button><button disabled={locked||chakra<25} onClick={()=>hit(24,'CHAKRA STRIKE',25)}>CHAKRA STRIKE · 25</button><button disabled={locked||chakra<40} onClick={()=>hit(38,'CHAKRA BURST',40)}>CHAKRA BURST · 40</button></>}</nav><button className="field-exit" onClick={()=>router.push('/')}>ABANDON</button></main>
}
