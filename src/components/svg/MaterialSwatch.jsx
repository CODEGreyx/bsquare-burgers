import React, { useId } from 'react'
import { materials } from '../../data/assets'

/**
 * Procedural material surfaces (SVG turbulence) used by the MATERIAL beat
 * in Scene 3. If a real macro photograph exists in data/assets.js
 * (materials.stone etc.) it is used instead — no other code changes.
 */

const SPECS = {
  stone: {
    label: 'Travertine',
    base: '#565149',
    tint: '#847d6e',
    freq: '0.008 0.045',
    octaves: 4,
    opacity: 0.55,
  },
  oak: {
    label: 'Smoked oak',
    base: '#2b2018',
    tint: '#4a3826',
    freq: '0.004 0.11',
    octaves: 5,
    opacity: 0.5,
  },
  metal: {
    label: 'Patinated bronze',
    base: '#26241f',
    tint: '#57503f',
    freq: '0.002 0.28',
    octaves: 3,
    opacity: 0.4,
  },
  glass: {
    label: 'Low-iron glass',
    base: '#141a20',
    tint: '#31414e',
    freq: '0.012 0.006',
    octaves: 2,
    opacity: 0.5,
  },
}

export const MATERIAL_KEYS = Object.keys(SPECS)
export const materialLabel = (kind) => SPECS[kind].label

export default function MaterialSwatch({ kind }) {
  const spec = SPECS[kind]
  const id = useId().replace(/:/g, '')

  if (materials[kind]) {
    return (
      <img
        className="img-cover"
        src={materials[kind]}
        alt={`${spec.label} macro texture`}
        loading="lazy"
      />
    )
  }

  return (
    <svg
      className="img-cover"
      viewBox="0 0 400 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id={`n${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={spec.freq}
            numOctaves={spec.octaves}
            seed="7"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope={spec.opacity} intercept="0" />
          </feComponentTransfer>
        </filter>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={spec.base} />
          <stop offset="0.55" stopColor={spec.tint} />
          <stop offset="1" stopColor={spec.base} />
        </linearGradient>
        <linearGradient id={`sheen${id}`} x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0.35" stopColor="rgba(232,228,220,0)" />
          <stop offset="0.5" stopColor="rgba(232,228,220,0.1)" />
          <stop offset="0.65" stopColor="rgba(232,228,220,0)" />
        </linearGradient>
      </defs>
      <rect width="400" height="900" fill={`url(#g${id})`} />
      <rect width="400" height="900" filter={`url(#n${id})`} />
      <rect width="400" height="900" fill={`url(#sheen${id})`} />
    </svg>
  )
}
