/*
 * Profile Tune player — synthesises short cultural motifs with Web Audio so the
 * prototype has real, controllable sound without shipping audio files.
 * Playback only ever starts from a user gesture (browser autoplay rules).
 */
export const TUNES: Record<string, { notes: [number, number, number][]; wave: OscillatorType; tempo: number }> = {
  // [frequency Hz, start beat, length beats]
  'Talking Drum — Dùndún call': { wave: 'sine', tempo: 0.18, notes: [[196, 0, 1], [174, 1, 0.5], [220, 1.5, 0.5], [196, 2, 1], [147, 3, 1], [196, 4, 0.5], [233, 4.5, 0.5], [196, 5, 1.5], [174, 7, 1]] },
  'Kora morning': { wave: 'triangle', tempo: 0.16, notes: [[523, 0, 1], [659, 1, 1], [784, 2, 1], [659, 3, 1], [587, 4, 1], [523, 5, 1], [440, 6, 1], [523, 7, 2]] },
  'Highlife guitar riff': { wave: 'square', tempo: 0.14, notes: [[392, 0, 1], [440, 1, 1], [494, 2, 1], [587, 3, 2], [494, 5, 1], [440, 6, 1], [392, 7, 2]] },
  'Mbira lullaby': { wave: 'sine', tempo: 0.22, notes: [[330, 0, 1], [392, 1, 1], [330, 2, 1], [294, 3, 1], [262, 4, 2], [294, 6, 1], [330, 7, 2]] },
}

let ctx: AudioContext | null = null
let stopFn: (() => void) | null = null

export function playTune(name: string, volume = 60, onEnd?: () => void): () => void {
  stopTune()
  const t = TUNES[name] ?? TUNES['Talking Drum — Dùndún call']
  ctx = ctx ?? new AudioContext()
  const master = ctx.createGain()
  master.gain.value = Math.max(0, Math.min(1, volume / 100)) * 0.35
  master.connect(ctx.destination)
  const start = ctx.currentTime + 0.05
  const oscs: OscillatorNode[] = []
  let end = start
  t.notes.forEach(([f, b, l]) => {
    const o = ctx!.createOscillator()
    const g = ctx!.createGain()
    o.type = t.wave
    o.frequency.value = f
    const s = start + b * t.tempo * 2
    const e = s + l * t.tempo * 2
    g.gain.setValueAtTime(0, s)
    g.gain.linearRampToValueAtTime(1, s + 0.015)
    g.gain.exponentialRampToValueAtTime(0.001, e)
    o.connect(g).connect(master)
    o.start(s)
    o.stop(e + 0.05)
    oscs.push(o)
    end = Math.max(end, e)
  })
  const timer = setTimeout(() => {
    stopFn = null
    onEnd?.()
  }, (end - ctx.currentTime) * 1000 + 100)
  stopFn = () => {
    clearTimeout(timer)
    oscs.forEach((o) => {
      try {
        o.stop()
      } catch {
        /* already stopped */
      }
    })
    master.disconnect()
  }
  return stopTune
}

export function stopTune() {
  stopFn?.()
  stopFn = null
}
