/**
 * Procedural sound design — no audio files required.
 *
 * Everything is synthesized with WebAudio: a low architectural room tone,
 * filtered-noise "assembly" impacts, a swell for the completed-house
 * reveal and a final brand tone. Nothing autoplays: `unlock()` must be
 * called from a user gesture. Replace or augment with real recordings by
 * dropping files into /public/assets/audio and wiring them here.
 */

class SoundEngine {
  constructor() {
    this.ctx = null
    this.master = null
    this.muted = true
    this.unlocked = false
    this._lastImpact = 0
  }

  unlock() {
    if (this.unlocked) return
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    this.ctx = new AC()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(this.ctx.destination)
    this._startRoomTone()
    this.unlocked = true
  }

  setMuted(muted) {
    this.muted = muted
    if (!this.ctx) return
    if (this.ctx.state === 'suspended') this.ctx.resume()
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setTargetAtTime(muted ? 0 : 0.5, t, 0.4)
  }

  /* Deep, quiet room tone: brown noise through a slow-breathing lowpass. */
  _startRoomTone() {
    const ctx = this.ctx
    const len = ctx.sampleRate * 4
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let last = 0
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 110
    lp.Q.value = 0.4

    const g = ctx.createGain()
    g.gain.value = 0.16

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.06
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 30
    lfo.connect(lfoGain)
    lfoGain.connect(lp.frequency)

    // faint airy layer
    const air = ctx.createBufferSource()
    air.buffer = buf
    air.loop = true
    air.playbackRate.value = 1.7
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 620
    bp.Q.value = 0.6
    const airGain = ctx.createGain()
    airGain.gain.value = 0.015

    src.connect(lp).connect(g).connect(this.master)
    air.connect(bp).connect(airGain).connect(this.master)
    src.start()
    air.start()
    lfo.start()
  }

  /* Soft concrete/metal assembly impact. Rate-limited so scrubbing the
     scroll never machine-guns it. */
  impact(strength = 1) {
    if (!this.ctx || this.muted) return
    const now = performance.now()
    if (now - this._lastImpact < 260) return
    this._lastImpact = now

    const ctx = this.ctx
    const t = ctx.currentTime
    const dur = 0.5

    const len = ctx.sampleRate * dur
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 300 + strength * 240
    const ng = ctx.createGain()
    ng.gain.value = 0.11 * strength

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(88, t)
    osc.frequency.exponentialRampToValueAtTime(34, t + 0.32)
    const og = ctx.createGain()
    og.gain.setValueAtTime(0.14 * strength, t)
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)

    noise.connect(lp).connect(ng).connect(this.master)
    osc.connect(og).connect(this.master)
    noise.start(t)
    osc.start(t)
    osc.stop(t + 0.5)
  }

  /* Restrained swell for the completed-residence reveal. */
  swell() {
    if (!this.ctx || this.muted) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const freqs = [55, 110, 164.81] // A1, A2, E3
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = f
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05 / (i + 1), t + 1.6)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 5)
      osc.connect(g).connect(this.master)
      osc.start(t)
      osc.stop(t + 5.2)
    })
  }

  /* Final brand tone: a single soft fifth. */
  brandTone() {
    if (!this.ctx || this.muted) return
    const ctx = this.ctx
    const t = ctx.currentTime
    ;[220, 329.63].forEach((f, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = f
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t + i * 0.12)
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.5 + i * 0.12)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4)
      osc.connect(g).connect(this.master)
      osc.start(t + i * 0.12)
      osc.stop(t + 4.2)
    })
  }
}

export const sound = new SoundEngine()
