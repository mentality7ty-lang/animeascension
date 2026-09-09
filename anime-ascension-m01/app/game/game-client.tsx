'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
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
type Screen = 'boot' | 'creator' | 'world' | 'combat' | 'awakening';
type AwakeningPhase = 'stillness' | 'signal' | 'collapse' | 'spark' | 'awakened';

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

const selectFields = 'id,name,power,strength,speed,endurance,focus,stamina,rank,world';

export default function GameClient({ userId, initialCharacter }: { userId: string; initialCharacter: Character | null }) {
  const db = createClient();
  const [screen, setScreen] = useState<Screen>(initialCharacter ? 'world' : 'boot');
  const [name, setName] = useState(initialCharacter?.name ?? 'Ari');
  const [h, setH] = useState(hair[0]);
  const [e, setE] = useState(eyes[0]);
  const [o, setO] = useState(outfits[0]);
  const [character, setCharacter] = useState<Character | null>(initialCharacter);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeExercise, setActiveExercise] = useState<ExerciseId | 'rest' | null>(null);
  const [message, setMessage] = useState('Choose a training method.');

  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(60);
  const [combatText, setCombatText] = useState('A training opponent steps forward.');
  const [incoming, setIncoming] = useState(false);
  const [combatLocked, setCombatLocked] = useState(false);
  const [enemyDefeated, setEnemyDefeated] = useState(false);
  const [perfectFlash, setPerfectFlash] = useState(false);
  const attackStartedAt = useRef(0);
  const attackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [awakeningPhase, setAwakeningPhase] = useState<AwakeningPhase>('stillness');
  const [chakra, setChakra] = useState(initialCharacter?.rank?.toLowerCase().includes('chakra') ? 100 : 0);

  const cleanName = useMemo(() => name.trim() || 'Ari', [name]);
  const missionUnlocked = (character?.power ?? 0) >= 7;
  const awakeningUnlocked = (character?.power ?? 0) >= 12 && !(character?.rank?.toLowerCase().includes('chakra'));
  const awakened = character?.rank?.toLowerCase().includes('chakra') ?? false;

  async function enter() {
    setBusy(true);
    const { data, error } = await db.from('characters').insert({ user_id: userId, name: cleanName }).select(selectFields).single();
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
      .update({ [exercise.stat]: nextStat, power: nextPower, stamina: nextStamina, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select(selectFields)
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
    const nextStamina = Math.min(100, character.stamina + 30);
    const { data, error } = await db.from('characters').update({ stamina: nextStamina, updated_at: new Date().toISOString() }).eq('user_id', userId).select(selectFields).single();
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

  function startMission() {
    if (!missionUnlocked) return;
    resetCombat();
    setScreen('combat');
  }

  function resetCombat() {
    if (attackTimer.current) clearTimeout(attackTimer.current);
    setPlayerHp(100);
    setEnemyHp(60);
    setIncoming(false);
    setCombatLocked(false);
    setEnemyDefeated(false);
    setPerfectFlash(false);
    setCombatText('Defeat the Training Opponent. Strike, then read the counterattack.');
  }

  function strike() {
    if (!character || combatLocked || incoming || enemyDefeated) return;
    setCombatLocked(true);
    const damage = Math.max(8, 7 + character.strength * 2);
    const nextEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(nextEnemyHp);
    setCombatText(`STRIKE · ${damage} DAMAGE`);
    if (nextEnemyHp <= 0) {
      void finishCombat();
      return;
    }
    window.setTimeout(beginEnemyAttack, 480);
  }

  function chakraStrike() {
    if (!awakened || chakra < 25 || !character || combatLocked || incoming || enemyDefeated) return;
    setCombatLocked(true);
    const damage = 18 + character.focus * 2;
    const nextEnemyHp = Math.max(0, enemyHp - damage);
    setEnemyHp(nextEnemyHp);
    setChakra(current => Math.max(0, current - 25));
    setCombatText(`CHAKRA STRIKE · ${damage} DAMAGE`);
    if (nextEnemyHp <= 0) {
      void finishCombat();
      return;
    }
    window.setTimeout(beginEnemyAttack, 520);
  }

  function beginEnemyAttack() {
    setCombatLocked(false);
    setIncoming(true);
    attackStartedAt.current = Date.now();
    setCombatText('ATTACK INCOMING — GUARD!');
    attackTimer.current = setTimeout(() => resolveEnemyAttack(false, false), 800);
  }

  function guard() {
    if (!incoming || combatLocked) return;
    const elapsed = Date.now() - attackStartedAt.current;
    const perfect = elapsed >= 420 && elapsed <= 700;
    if (attackTimer.current) clearTimeout(attackTimer.current);
    resolveEnemyAttack(true, perfect);
  }

  function resolveEnemyAttack(guarded: boolean, perfect: boolean) {
    if (!incoming && !guarded) return;
    setIncoming(false);
    setCombatLocked(true);
    if (perfect) {
      setPerfectFlash(true);
      setCombatText('PERFECT GUARD · NO DAMAGE');
      window.setTimeout(() => setPerfectFlash(false), 650);
      window.setTimeout(() => setCombatLocked(false), 500);
      return;
    }

    const enduranceReduction = character ? Math.min(6, Math.floor(character.endurance / 2)) : 0;
    const base = 16;
    const damage = guarded ? Math.max(2, Math.floor((base - enduranceReduction) * 0.35)) : Math.max(7, base - enduranceReduction);
    const nextHp = Math.max(0, playerHp - damage);
    setPlayerHp(nextHp);
    setCombatText(guarded ? `GUARD · ${damage} DAMAGE TAKEN` : `HIT · ${damage} DAMAGE TAKEN`);
    if (nextHp <= 0) {
      setCombatText('DEFEATED · RETRY THE TRAINING FIGHT');
      window.setTimeout(() => setCombatLocked(false), 450);
      return;
    }
    window.setTimeout(() => setCombatLocked(false), 500);
  }

  async function finishCombat() {
    if (!character) return;
    setEnemyDefeated(true);
    setIncoming(false);
    setCombatLocked(true);
    setCombatText('MISSION COMPLETE · +5 POWER');
    const { data } = await db.from('characters').update({ power: character.power + 5, updated_at: new Date().toISOString() }).eq('user_id', userId).select(selectFields).single();
    if (data) {
      setCharacter(data as Character);
      flashSaved();
    }
  }

  function beginAwakening() {
    if (!awakeningUnlocked || busy) return;
    setScreen('awakening');
    setAwakeningPhase('stillness');
    window.setTimeout(() => setAwakeningPhase('signal'), 1500);
    window.setTimeout(() => setAwakeningPhase('collapse'), 3100);
    window.setTimeout(() => setAwakeningPhase('spark'), 4700);
    window.setTimeout(() => void completeAwakening(), 6500);
  }

  async function completeAwakening() {
    if (!character) return;
    setAwakeningPhase('awakened');
    setChakra(100);
    const { data, error } = await db
      .from('characters')
      .update({ rank: 'Chakra Student', power: character.power + 10, focus: character.focus + 2, stamina: 100, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select(selectFields)
      .single();
    if (data) {
      setCharacter(data as Character);
      flashSaved();
    } else if (error) {
      setMessage(`Awakening save failed: ${error.message}`);
    }
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
    <main className={`game-shell ${screen === 'awakening' ? 'awakening-shell' : ''}`}>
      <div className="noise" />
      <div className="vignette" />
      {screen !== 'awakening' && <button className="account-button" onClick={signOut}>SIGN OUT</button>}

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
          <motion.section key="world" className="screen world-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mountains" /><div className="mist mist-a" /><div className="mist mist-b" />
            <div className="world-copy">
              <p className="eyebrow">NINJA WORLD // OUTSKIRTS</p>
              <h2>{awakened ? 'Something inside you is finally awake.' : 'Your body is your first weapon.'}</h2>
              <p className="muted">{awakened ? 'The world feels different now. Energy moves where silence used to be.' : 'Train until someone finally notices you.'}</p>
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
              {awakened && <div className="chakra-world-meter"><span>CHAKRA</span><strong>{chakra}/100</strong><div><motion.i animate={{ width: `${chakra}%` }} /></div></div>}
            </div>

            <div className="training-panel training-panel-v2">
              <div className="training-head">
                <div><span className="quest-label">MILESTONE 0.4</span><h3>{awakened ? 'CHAKRA INITIATE' : 'PHYSICAL TRAINING'}</h3></div>
                <span className="cloud-indicator">{saved ? 'CLOUD SAVED ✓' : 'ONLINE SAVE'}</span>
              </div>
              <p className="training-message">{message}</p>
              <div className="exercise-grid">
                {exercises.map(exercise => (
                  <motion.button key={exercise.id} className={`exercise-card ${activeExercise === exercise.id ? 'is-active' : ''}`} disabled={busy} whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} onClick={() => train(exercise)}>
                    <span className="exercise-icon">{exercise.icon}</span>
                    <span className="exercise-copy"><strong>{exercise.title}</strong><small>{exercise.subtitle}</small></span>
                    <span className="exercise-cost">-{exercise.staminaCost}</span>
                  </motion.button>
                ))}
              </div>
              <div className="training-actions">
                <button className="recover-button" disabled={busy || character.stamina >= 100} onClick={recover}>{activeExercise === 'rest' ? 'RECOVERING...' : 'REST · +30 STAMINA'}</button>
                <button className={`mission-button ${missionUnlocked ? 'unlocked' : ''}`} disabled={!missionUnlocked} onClick={startMission}>{missionUnlocked ? 'MISSION · PROVE YOURSELF' : 'MISSION LOCKED · REACH POWER 7'}</button>
              </div>
              {!awakened && (
                <button className={`awakening-button ${awakeningUnlocked ? 'ready' : ''}`} disabled={!awakeningUnlocked} onClick={beginAwakening}>
                  {awakeningUnlocked ? 'MEDITATE · LISTEN WITHIN' : '??? · SOMETHING IS STILL QUIET'}
                </button>
              )}
            </div>

            <motion.div className={`character-silhouette ${activeExercise ? `training-${activeExercise}` : ''} ${awakened ? 'chakra-active' : ''}`} animate={activeExercise ? { y: [0, -7, 0], scale: [1, 1.015, 1] } : {}} transition={{ duration: 0.5 }}>
              {awakened && <div className="chakra-aura" />}
              <div className="head" /><div className="torso" />
              <AnimatePresence>{activeExercise && <motion.div className="training-ring" initial={{ scale: 0.5, opacity: 0.9 }} animate={{ scale: 1.9, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.65 }} />}</AnimatePresence>
            </motion.div>
          </motion.section>
        )}

        {screen === 'combat' && character && (
          <motion.section key="combat" className="screen combat-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="combat-sky" /><div className="combat-ground" />
            {perfectFlash && <motion.div className="perfect-flash" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 0.65 }}>PERFECT</motion.div>}
            <div className="combat-topline"><span>MISSION // PROVE YOURSELF</span><strong>{combatText}</strong></div>
            <div className="fighter-health player-health"><label>{character.name}</label><div><motion.i animate={{ width: `${playerHp}%` }} /></div><span>{playerHp} HP</span></div>
            <div className="fighter-health enemy-health"><label>TRAINING OPPONENT</label><div><motion.i animate={{ width: `${(enemyHp / 60) * 100}%` }} /></div><span>{enemyHp} HP</span></div>
            {awakened && <div className="combat-chakra"><label>CHAKRA</label><div><motion.i animate={{ width: `${chakra}%` }} /></div><span>{chakra}/100</span></div>}
            <motion.div className="fighter player-fighter" animate={incoming ? { x: [0, -6, 0] } : {}}><div className="fighter-head" /><div className="fighter-body" />{awakened && <div className="fighter-aura" />}</motion.div>
            <motion.div className={`fighter enemy-fighter ${incoming ? 'incoming' : ''}`} animate={incoming ? { x: [0, -14, 0] } : {}}><div className="fighter-head" /><div className="fighter-body" /></motion.div>
            {incoming && <motion.div className="attack-cue" initial={{ scale: 0.4, opacity: 1 }} animate={{ scale: 2.2, opacity: 0 }} transition={{ duration: 0.8 }} />}
            <div className="combat-actions">
              {playerHp <= 0 ? (
                <button onClick={resetCombat}>RETRY</button>
              ) : enemyDefeated ? (
                <button onClick={() => { setScreen('world'); resetCombat(); }}>RETURN TO WORLD</button>
              ) : (
                <>
                  <button disabled={combatLocked || incoming} onClick={strike}>STRIKE</button>
                  <button className={incoming ? 'guard-ready' : ''} disabled={!incoming || combatLocked} onClick={guard}>GUARD</button>
                  {awakened && <button className="chakra-strike-button" disabled={combatLocked || incoming || chakra < 25} onClick={chakraStrike}>CHAKRA STRIKE · 25</button>}
                </>
              )}
            </div>
          </motion.section>
        )}

        {screen === 'awakening' && character && (
          <motion.section key="awakening" className={`screen awakening-screen phase-${awakeningPhase}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="awakening-dark" />
            <div className="awakening-pulse" />
            <motion.div className="awakening-character" animate={awakeningPhase === 'spark' || awakeningPhase === 'awakened' ? { scale: [1, 1.04, 1], y: [0, -4, 0] } : {}} transition={{ repeat: Infinity, duration: 1.2 }}>
              <div className="awakening-aura" /><div className="awakening-head" /><div className="awakening-body" />
            </motion.div>
            <div className="awakening-copy">
              {awakeningPhase === 'stillness' && <><p>BREATH IN.</p><h2>Silence.</h2><span>For the first time, you stop trying to become stronger.</span></>}
              {awakeningPhase === 'signal' && <><p>UNKNOWN ENERGY DETECTED</p><h2>Something answers.</h2><span>A pressure moves beneath your skin. It does not feel like stamina.</span></>}
              {awakeningPhase === 'collapse' && <><p>HEART RATE // CRITICAL</p><h2>Your body rejects it.</h2><span>The world narrows to one heartbeat.</span></>}
              {awakeningPhase === 'spark' && <><p>ENERGY PATHWAY // OPEN</p><h2>Hold it.</h2><span>Do not push it away.</span></>}
              {awakeningPhase === 'awakened' && <><p>NEW ENERGY ACQUIRED</p><h2>CHAKRA AWAKENED</h2><span>Rank updated: CHAKRA STUDENT · +10 Power · +2 Focus</span><button className="awakening-continue" onClick={() => setScreen('world')}>OPEN YOUR EYES</button></>}
            </div>
            {(awakeningPhase === 'spark' || awakeningPhase === 'awakened') && <div className="chakra-particles">{Array.from({ length: 18 }).map((_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}</div>}
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
  return <div className="option-row"><span>{label}</span><div><button onClick={() => set(values[(i - 1 + values.length) % values.length])}>‹</button><strong>{value}</strong><button onClick={() => set(values[(i + 1) % values.length])}>›</button></div></div>;
}
