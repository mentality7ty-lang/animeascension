'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

type Character={name:string;power:number;focus:number;rank:string};

type Panel='mentor'|'missions'|'techniques';

export default function VillageClient({character}:{character:Character}){
  const [panel,setPanel]=useState<Panel>('mentor');
  const [dialogue,setDialogue]=useState(0);
  const mentorLines=[
    `${character.name}, raw chakra is useless if your mind arrives after your body.`,
    'A shinobi wins before the first strike: position, timing, intent.',
    'Your next lesson is simple. Stop chasing power. Learn to move without wasting it.',
    'Complete field work. Return stronger. Then I will teach you your first real technique.'
  ];

  return <main className="village-shell">
    <div className="village-sky"/><div className="village-ridge"/><div className="village-roofs"/><div className="village-haze"/>
    <header className="village-header">
      <div><span>NINJA WORLD // HIDDEN VILLAGE</span><h1>The gates are finally open.</h1><p>You are no longer training alone.</p></div>
      <div className="village-status"><span>{character.rank.toUpperCase()}</span><strong>POWER {character.power}</strong><small>FOCUS {character.focus}</small></div>
    </header>

    <section className="village-map">
      <motion.button whileHover={{y:-4}} className={`village-place mentor-place ${panel==='mentor'?'active':''}`} onClick={()=>setPanel('mentor')}><span>01</span><strong>MENTOR COURTYARD</strong><small>Learn what strength is for.</small></motion.button>
      <motion.button whileHover={{y:-4}} className={`village-place mission-place ${panel==='missions'?'active':''}`} onClick={()=>setPanel('missions')}><span>02</span><strong>MISSION BOARD</strong><small>Take work beyond the walls.</small></motion.button>
      <motion.button whileHover={{y:-4}} className={`village-place technique-place ${panel==='techniques'?'active':''}`} onClick={()=>setPanel('techniques')}><span>03</span><strong>TRAINING HALL</strong><small>Your first real techniques await.</small></motion.button>
    </section>

    <section className="village-panel">
      {panel==='mentor'&&<div className="mentor-panel"><div className="mentor-portrait"><div className="mentor-head"/><div className="mentor-body"/></div><div><span>MENTOR // KAIRO</span><h2>“Control comes before spectacle.”</h2><p>{mentorLines[dialogue]}</p><button onClick={()=>setDialogue(v=>(v+1)%mentorLines.length)}>CONTINUE LESSON</button></div></div>}

      {panel==='missions'&&<div className="mission-board"><div className="board-head"><span>ACTIVE CONTRACTS</span><strong>FIELD ASSIGNMENTS</strong></div><div className="contract-grid"><Link href="/mission" className="contract open"><span>D-RANK</span><strong>FOREST ROAD</strong><p>Intercept the rogue scout moving outside the village perimeter.</p><small>AVAILABLE →</small></Link><div className="contract locked"><span>D-RANK</span><strong>STOLEN SUPPLIES</strong><p>Track a thief through the eastern ravine.</p><small>LOCKED · NEXT MILESTONE</small></div><div className="contract locked"><span>C-RANK</span><strong>NIGHT SIGNAL</strong><p>Investigate an unknown chakra signature after sunset.</p><small>LOCKED</small></div></div></div>}

      {panel==='techniques'&&<div className="technique-panel"><span>TECHNIQUE PATH</span><h2>Chakra is becoming a toolkit.</h2><div className="technique-tree"><div className="tech-node learned"><small>LEARNED</small><strong>CHAKRA STRIKE</strong><p>Focused chakra reinforcement.</p></div><div className="tech-link"/><div className="tech-node learned"><small>LEARNED</small><strong>CHAKRA BURST</strong><p>High-output impact release.</p></div><div className="tech-link"/><div className="tech-node next"><small>NEXT</small><strong>FLASH STEP</strong><p>Explosive chakra-assisted movement.</p></div></div><p className="mentor-note">Mentor Kairo will unlock Flash Step after your next field assignment.</p></div>}
    </section>

    <Link className="village-return" href="/">RETURN TO OUTSKIRTS</Link>
  </main>
}
