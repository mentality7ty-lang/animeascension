'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Character = {
  id: string;
  name: string;
  power: number;
  strength: number;
  speed: number;
  endurance: number;
  focus: number;
  stamina: number;
  rank: string;
  world: string;
};

type TrainableStat = 'strength' | 'speed' | 'endurance' | 'focus';
type ExerciseId = 'pushups' | 'sprints' | 'run' | 'meditate';

type Exercise = {
  id: ExerciseId;
  title: string;
  subtitle: string;
  stat: TrainableStat;
  gain: number;
  powerGain: number;
  staminaCost: number;
  icon: string;
};

const hair = ['Obsidian', 'Crimson', 'Silver', 'Midnight Blue'];
const eyes = ['Slate', 'Amber', 'Emerald', 'Violet'];
const outfits = ['Rookie Black', 'Ash Wrap', 'Field Grey', 'Night Scout'];

const exercises: Exercise[] = [
  { id: 'pushups', title: 'PUSH-UPS', subtitle: 'Build raw force.', stat: 'strength', gain: 1, powerGain: 2, staminaCost: 12, icon: 'STR' },
  { id: 'sprints', title: 'SPRINTS', subtitle: 'Explode off the line.', stat: 'speed', gain: 1, powerGain: 2, staminaCost: 14, icon: 'SPD' },
  { id: 'run', title: 'ENDURANCE RUN', subtitle: 'Keep moving when it hurts.', stat: 'endurance', gain: 1, powerGain: 2, staminaCost: 16, icon: 'END' },
  { id: 'meditate', title: 'MEDITATE', subtitle: 'Control breath and intent.', stat: 'focus', gain: 1, powerGain: 2, staminaCost: 10, icon: 'FOC' },
];

export default function GameClient({ userId, initialCharacter }: { userId: string; initialCharacter: Character | null }) {
  const db = createClient();
  const [screen, setScreen] = useState(initialCharacter ? 'world' : 'boot');
  const [name, setName] = useState(initialCharacter?.name ?? 'Ari');
  const [h, setH] = useState(hair[0]);
  const [e, setE] = useState(eyes[0]);
  const [o, setO] = useState(outfits[0]);
  const [character, setCharacter] = useState<Character | null>(initialCharacter);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeExercise, setActiveExercise] = useState<ExerciseId | 'rest' | null>(null);
  const [message, setMessage] = useState('Choose a training method.');

  const cleanName = useMemo(() => name.trim() || 'Ari', [name]);

  async function enter() {
    setBusy(true);
    const { data, error } = await db
      .from('characters')
      .insert({ user_id: userId, name: cleanName })
      .select('id,name,power,strength,speed,endurance,focus,stamina,rank,world')
      .single();

    if (data) {
      setCharacter(data as Character);
      setScreen('world');
    } else if (error) {
      setMessage(error.message);
    }
    setBusy(false);
  }

  async function train(exercise: Exercise) {
    if (!character || busy) return;
    if (character.stamina < exercise.staminaCost) {
      setMessage('Not enough stamina. Recover before training again.');
      return;
    }

    setBusy(true);
    setActiveExercise(exercise.id);
    setMessage(`${exercise.title}...`);

    const nextStat = character[exercise.stat] + exercise.gain;
    const nextPower = character.power + exercise.powerGain;
    const nextStamina = Math.max(0, character.stamina - exercise.staminaCost);

    const { data, error } = await db
      .from('characters')
      .update({
        [exercise.stat]: nextStat,
        power: nextPower,
        stamina: nextStamina,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('id,name,power,strength,speed,endurance,focus,stamina,rank,world')
      .single();

    if (data) {
      setCharacter(data as Character);
      setMessage(`+${exercise.gain} ${exercise.stat.toUpperCase()} · +${exercise.powerGain} POWER`);
      flashSaved();
    } else if (error) {
      setMessage(`Save failed: ${error.message}`);
    }

    window.setTimeout(() => setActiveExercise(null), 650);
    setBusy(false);
  }

  async function recover() {
    if (!character || busy || character.stamina >= 100) return;
    setBusy(true);
    setActiveExercise('rest');
    setMessage('Recovering...');

    const nextStamina = Math.min(100, character.stamina + 30);
    const { data, error } = await db
      .from('characters')
      .update({ stamina: nextStamina, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select('id,name,power,strength,speed,endurance,focus,stamina,rank,world')
      .single();

    if (data) {
      setCharacter(data as Character);
      setMessage(`STAMINA RECOVERED · ${nextStamina}/100`);
      flashSaved();
    } else if (error) {
      setMessage(`Save failed: ${error.message}`);
    }

    window.setTimeout(() => setActiveExercise(null), 650);
    setBusy(false);
  }

  function flashSaved() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1000);
  }

  async function signOut() {
    await db.auth.signOut();
    location.href = '/login';
  }

  return (
    <main className="game-shell">
      <div className="noise" />
      <div className="vignette" />
      <button className="account-button" onClick={signOut}>SIGN OUT</button>

      <AnimatePresence mode="wait">
        {screen === 'boot' && (
          <motion.section key="boot" className="screen boot-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="orb" initial={{ scale: 0.1 }} animate={{ scale: 1 }} />
            <p className="eyebrow">EVERY LEGEND STARTS WITH NOTHING.</p>
            <h1>ANIME ASCENSION</h1>
            <p className="tagline">YOURS STARTS NOW.</p>
            <button className="primary" onClick={() => setScreen('creator')}>BEGIN</button>
          </motion.section>
        )}

        {screen === 'creator' && (
          <motion.section key="creator" className="screen creator-screen" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <div className="creator-copy">
              <p className="eyebrow">ORIGIN // HUMAN</p>
              <h2>Create the one who will ascend.</h2>
              <p className="muted">No aura. No bloodline. No destiny yet.</p>
              <label>NAME<input value={name} maxLength={14} onChange={x => setName(x.target.value)} /></label>
              <Row label="HAIR" value={h} values={hair} set={setH} />
              <Row label="EYES" value={e} values={eyes} set={setE} />
              <Row label="OUTFIT" value={o} values={outfits} set={setO} />
              <button className="primary" disabled={busy} onClick={enter}>{busy ? 'CREATING...' : 'ENTER THE WORLD'}</button>
            </div>
            <div className="character-card">
              <div className="character-glow" />
              <div className="avatar-head"><div className="hair-shape" /><div className="eyes"><span /><span /></div></div>
              <div className="avatar-body" />
              <div className="character-meta"><strong>{cleanName}</strong><span>HUMAN · POWER 1</span></div>
            </div>
          </motion.section>
        )}

        {screen === 'world' && character && (
          <motion.section key="world" className="screen world-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mountains" />
            <div className="mist mist-a" />
            <div className="mist mist-b" />

            <div className="world-copy">
              <p className="eyebrow">NINJA WORLD // OUTSKIRTS</p>
              <h2>Your body is your first weapon.</h2>
              <p className="muted">Before chakra, before techniques, there is discipline.</p>
            </div>

            <div className="hud">
              <div><span>STATUS</span><strong>{character.rank.toUpperCase()}</strong></div>
              <div><span>POWER</span><motion.strong key={character.power} initial={{ scale: 1.35 }} animate={{ scale: 1 }}>{character.power}</motion.strong></div>
            </div>

            <div className="stat-grid">
              <Stat label="STRENGTH" value={character.strength} />
              <Stat label="SPEED" value={character.speed} />
              <Stat label="ENDURANCE" value={character.endurance} />
              <Stat label="FOCUS" value={character.focus} />
            </div>

            <div className="stamina-wrap">
              <div className="stamina-line"><span>STAMINA</span><strong>{character.stamina}/100</strong></div>
              <div className="stamina-track"><motion.div className="stamina-fill" animate={{ width: `${character.stamina}%` }} /></div>
            </div>

            <div className="training-panel training-panel-v2">
              <div className="training-head">
                <div><span className="quest-label">MILESTONE 0.2</span><h3>PHYSICAL TRAINING</h3></div>
                <span className="cloud-indicator">{saved ? 'CLOUD SAVED ✓' : 'ONLINE SAVE'}</span>
              </div>
              <p className="training-message">{message}</p>

              <div className="exercise-grid">
                {exercises.map(exercise => (
                  <motion.button
                    key={exercise.id}
                    className={`exercise-card ${activeExercise === exercise.id ? 'is-active' : ''}`}
                    disabled={busy}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => train(exercise)}
                  >
                    <span className="exercise-icon">{exercise.icon}</span>
                    <span className="exercise-copy"><strong>{exercise.title}</strong><small>{exercise.subtitle}</small></span>
                    <span className="exercise-cost">-{exercise.staminaCost}</span>
                  </motion.button>
                ))}
              </div>

              <button className="recover-button" disabled={busy || character.stamina >= 100} onClick={recover}>
                {activeExercise === 'rest' ? 'RECOVERING...' : 'REST · +30 STAMINA'}
              </button>
            </div>

            <motion.div
              className={`character-silhouette ${activeExercise ? `training-${activeExercise}` : ''}`}
              animate={activeExercise ? { y: [0, -7, 0], scale: [1, 1.015, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              <div className="head" />
              <div className="torso" />
              <AnimatePresence>{activeExercise && <motion.div className="training-ring" initial={{ scale: 0.5, opacity: 0.9 }} animate={{ scale: 1.9, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.65 }} />}</AnimatePresence>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="stat-card"><span>{label}</span><motion.strong key={value} initial={{ y: -5, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }}>{value}</motion.strong></div>;
}

function Row({ label, value, values, set }: { label: string; value: string; values: string[]; set: (v: string) => void }) {
  const i = values.indexOf(value);
  return (
    <div className="option-row">
      <span>{label}</span>
      <div>
        <button onClick={() => set(values[(i - 1 + values.length) % values.length])}>‹</button>
        <strong>{value}</strong>
        <button onClick={() => set(values[(i + 1) % values.length])}>›</button>
      </div>
    </div>
  );
}
