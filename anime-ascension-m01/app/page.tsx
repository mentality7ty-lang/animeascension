'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { loadPlayer, savePlayer, type PlayerSave } from '@/lib/storage';

type Screen = 'boot' | 'creator' | 'world';

const hairOptions = ['Obsidian', 'Crimson', 'Silver', 'Midnight Blue'];
const eyeOptions = ['Slate', 'Amber', 'Emerald', 'Violet'];
const outfitOptions = ['Rookie Black', 'Ash Wrap', 'Field Grey', 'Night Scout'];

export default function Home() {
  const [screen, setScreen] = useState<Screen>('boot');
  const [name, setName] = useState('Ari');
  const [hair, setHair] = useState(hairOptions[0]);
  const [eyes, setEyes] = useState(eyeOptions[0]);
  const [outfit, setOutfit] = useState(outfitOptions[0]);
  const [power, setPower] = useState(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = loadPlayer();
    if (existing) {
      setName(existing.name);
      setHair(existing.hair);
      setEyes(existing.eyes);
      setOutfit(existing.outfit);
      setPower(existing.power);
      setScreen('world');
    }
  }, []);

  const player = useMemo<PlayerSave>(() => ({
    name: name.trim() || 'Ari',
    hair,
    eyes,
    outfit,
    power,
    createdAt: new Date().toISOString()
  }), [name, hair, eyes, outfit, power]);

  function enterWorld() {
    const fresh = { ...player, power: 1, createdAt: new Date().toISOString() };
    setPower(1);
    savePlayer(fresh);
    setScreen('world');
  }

  function train() {
    const nextPower = power + 1;
    setPower(nextPower);
    savePlayer({ ...player, power: nextPower });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 900);
  }

  return (
    <main className="game-shell">
      <div className="noise" />
      <div className="vignette" />

      <AnimatePresence mode="wait">
        {screen === 'boot' && (
          <motion.section
            key="boot"
            className="screen boot-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="orb"
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 1.15, 1], opacity: 1 }}
              transition={{ duration: 1.8 }}
            />
            <motion.p className="eyebrow" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
              EVERY LEGEND STARTS WITH NOTHING.
            </motion.p>
            <motion.h1 initial={{ letterSpacing: '0.55em', opacity: 0 }} animate={{ letterSpacing: '0.13em', opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}>
              ANIME ASCENSION
            </motion.h1>
            <motion.p className="tagline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
              YOURS STARTS NOW.
            </motion.p>
            <motion.button className="primary" onClick={() => setScreen('creator')} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }}>
              BEGIN
            </motion.button>
          </motion.section>
        )}

        {screen === 'creator' && (
          <motion.section key="creator" className="screen creator-screen" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
            <div className="creator-copy">
              <p className="eyebrow">ORIGIN // HUMAN</p>
              <h2>Create the one who will ascend.</h2>
              <p className="muted">No aura. No bloodline. No destiny yet.</p>

              <label>
                NAME
                <input value={name} maxLength={14} onChange={(e) => setName(e.target.value)} />
              </label>

              <OptionRow label="HAIR" value={hair} options={hairOptions} onChange={setHair} />
              <OptionRow label="EYES" value={eyes} options={eyeOptions} onChange={setEyes} />
              <OptionRow label="OUTFIT" value={outfit} options={outfitOptions} onChange={setOutfit} />

              <button className="primary" onClick={enterWorld}>ENTER THE WORLD</button>
            </div>

            <motion.div className="character-card" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="character-glow" />
              <div className="avatar-head" data-hair={hair}>
                <div className="hair-shape" />
                <div className="eyes"><span /><span /></div>
              </div>
              <div className="avatar-body" />
              <div className="character-meta">
                <strong>{name || 'Ari'}</strong>
                <span>HUMAN · POWER 1</span>
              </div>
            </motion.div>
          </motion.section>
        )}

        {screen === 'world' && (
          <motion.section key="world" className="screen world-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mountains" />
            <div className="mist mist-a" />
            <div className="mist mist-b" />
            <motion.div className="world-copy" initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
              <p className="eyebrow">NINJA WORLD // OUTSKIRTS</p>
              <h2>You feel... ordinary.</h2>
              <p className="muted">There is nothing special about you. Yet.</p>
            </motion.div>

            <div className="hud">
              <div><span>STATUS</span><strong>HUMAN</strong></div>
              <div><span>POWER</span><motion.strong key={power} initial={{ scale: 1.35 }} animate={{ scale: 1 }}>{power}</motion.strong></div>
            </div>

            <div className="training-panel">
              <span className="quest-label">CURRENT OBJECTIVE</span>
              <h3>TRAIN YOUR BODY</h3>
              <p>Every legend has a first rep.</p>
              <motion.button whileTap={{ scale: 0.96 }} whileHover={{ y: -2 }} className="train-button" onClick={train}>
                TRAIN
              </motion.button>
              <AnimatePresence>{saved && <motion.span className="saved" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>PROGRESS SAVED</motion.span>}</AnimatePresence>
            </div>

            <div className="character-silhouette">
              <div className="head" />
              <div className="torso" />
              <motion.div className="training-ring" key={power} initial={{ scale: 0.6, opacity: 0.85 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.55 }} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

function OptionRow({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const index = options.indexOf(value);
  const next = () => onChange(options[(index + 1) % options.length]);
  const prev = () => onChange(options[(index - 1 + options.length) % options.length]);

  return (
    <div className="option-row">
      <span>{label}</span>
      <div>
        <button onClick={prev} aria-label={`Previous ${label}`}>‹</button>
        <strong>{value}</strong>
        <button onClick={next} aria-label={`Next ${label}`}>›</button>
      </div>
    </div>
  );
}
