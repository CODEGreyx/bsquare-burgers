import React, { useEffect, useState } from 'react'
import { sound } from '../lib/sound'
import './SoundControl.css'

/**
 * Refined mute toggle. Audio is opt-in: the first click unlocks the
 * WebAudio engine (a user gesture) and unmutes. `M` toggles from the
 * keyboard. The experience is designed to be complete with sound off.
 */
export default function SoundControl() {
  const [on, setOn] = useState(false)

  const toggle = () => {
    sound.unlock()
    setOn((prev) => {
      sound.setMuted(prev)
      return !prev
    })
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'm' || e.key === 'M') toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <button
      className={`soundctl ${on ? 'is-on' : ''}`}
      onClick={toggle}
      aria-label={on ? 'Mute sound' : 'Enable sound'}
      title={on ? 'Sound on (M)' : 'Sound off (M)'}
    >
      <span className="soundctl-bar" />
      <span className="soundctl-bar" />
      <span className="soundctl-bar" />
      <span className="t-tech soundctl-label">{on ? 'Sound' : 'Muted'}</span>
    </button>
  )
}
