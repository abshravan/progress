"use client";

import { loadSoundEnabled } from "./storage";

const AudioCtx = typeof window !== "undefined" ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext : null;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function play(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.12) {
  if (!loadSoundEnabled()) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export function playQuestComplete() {
  play(660, 0.12, "sine", 0.1);
  setTimeout(() => play(880, 0.15, "sine", 0.1), 80);
}

export function playQuestUndo() {
  play(440, 0.1, "sine", 0.06);
}

export function playLevelUp() {
  play(523, 0.15, "sine", 0.12);
  setTimeout(() => play(659, 0.15, "sine", 0.12), 100);
  setTimeout(() => play(784, 0.15, "sine", 0.12), 200);
  setTimeout(() => play(1047, 0.25, "sine", 0.14), 300);
}

export function playBonusXP() {
  play(880, 0.1, "triangle", 0.1);
  setTimeout(() => play(1100, 0.1, "triangle", 0.1), 60);
  setTimeout(() => play(1320, 0.15, "triangle", 0.12), 120);
}

export function playClick() {
  play(600, 0.05, "sine", 0.04);
}

export function playExport() {
  play(520, 0.1, "sine", 0.08);
  setTimeout(() => play(780, 0.15, "sine", 0.08), 80);
}
