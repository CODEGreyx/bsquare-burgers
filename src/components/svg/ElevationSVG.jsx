import React from 'react'

/**
 * Line-art elevation of the NØRTHLINE residence, traced against
 * residence-complete.webp (viewBox matches the photo frame, so the
 * drawing overlays the photograph 1:1). Layers are ordered the way a
 * building is actually built and are addressed by [data-layer] from the
 * construction timeline:
 *
 *   ground → grid → columns → slabs → volume-left → volume-upper
 *   → fins → glazing → landscape → dims
 */

export const VIEWBOX = { w: 1200, h: 670 }

/* Window panes of the completed photo (used by ExteriorScene for the
   lights-on mask reveal). Coordinates in the same viewBox space. */
export const WINDOW_RECTS = [
  { x: 795, y: 110, w: 245, h: 225 }, // upper cantilever glazing
  { x: 470, y: 360, w: 200, h: 175 }, // ground floor glass, left half
  { x: 680, y: 360, w: 215, h: 175 }, // ground floor glass, right half
  { x: 385, y: 205, w: 78, h: 330 }, // connector glazing
  { x: 100, y: 190, w: 150, h: 280 }, // travertine fin glow
]

const L = {
  main: 'rgba(196,205,216,0.75)',
  mid: 'rgba(196,205,216,0.45)',
  faint: 'rgba(196,205,216,0.22)',
  warm: 'rgba(201,160,106,0.55)',
}

const gridV = [180, 360, 466, 660, 830, 1050]
const gridH = [95, 355, 540]
const finLines = Array.from({ length: 11 }, (_, i) => 104 + i * 14)
const groundMullions = [510, 550, 590, 630, 700, 740, 780, 860, 900, 940, 985, 1020]
const upperMullions = [838, 882, 926, 970, 1008]
const connectorMullions = [402, 424, 446]

export default function ElevationSVG({ className, style, opacity = 1 }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      opacity={opacity}
    >
      {/* ---------- construction grid ---------- */}
      <g data-layer="grid" stroke={L.faint} strokeWidth="1">
        {gridV.map((x) => (
          <line key={`gv${x}`} x1={x} y1={40} x2={x} y2={600} />
        ))}
        {gridH.map((y) => (
          <line key={`gh${y}`} x1={40} y1={y} x2={1160} y2={y} />
        ))}
        {gridV.map((x, i) => (
          <g key={`gb${x}`} stroke={L.mid}>
            <circle cx={x} cy={28} r={11} fill="none" />
            <text
              x={x}
              y={32}
              fill={L.mid}
              stroke="none"
              fontSize="11"
              fontFamily="Inter, sans-serif"
              textAnchor="middle"
              letterSpacing="1"
            >
              {String.fromCharCode(65 + i)}
            </text>
          </g>
        ))}
      </g>

      {/* ---------- ground / site ---------- */}
      <g data-layer="ground" stroke={L.main} strokeWidth="2">
        <line x1={30} y1={540} x2={1170} y2={540} />
        <polygon
          points="330,548 1150,543 1195,650 295,650"
          stroke={L.mid}
          strokeWidth="1.5"
        />
        <line x1={60} y1={560} x2={30} y2={590} stroke={L.faint} strokeWidth="1" />
        <line x1={100} y1={560} x2={70} y2={590} stroke={L.faint} strokeWidth="1" />
        <line x1={140} y1={560} x2={110} y2={590} stroke={L.faint} strokeWidth="1" />
      </g>

      {/* ---------- structural columns ---------- */}
      <g data-layer="columns" stroke={L.main} strokeWidth="3">
        <line x1={660} y1={355} x2={660} y2={540} data-rise="1" />
        <line x1={830} y1={355} x2={830} y2={540} data-rise="1" />
        <line x1={470} y1={200} x2={470} y2={540} data-rise="1" strokeWidth="2" />
        <line x1={95} y1={180} x2={95} y2={540} data-rise="1" strokeWidth="2" />
        <line x1={358} y1={165} x2={358} y2={540} data-rise="1" strokeWidth="2" />
      </g>

      {/* ---------- floor slabs ---------- */}
      <g data-layer="slabs" stroke={L.main} strokeWidth="2.5">
        <g data-slab="ground">
          <line x1={80} y1={540} x2={1085} y2={538} />
        </g>
        <g data-slab="level1">
          <line x1={466} y1={355} x2={1052} y2={348} />
          <line x1={1052} y1={348} x2={1085} y2={342} strokeWidth="1.5" />
        </g>
        <g data-slab="roof-right">
          <line x1={466} y1={95} x2={1050} y2={78} />
          <line x1={1050} y1={78} x2={1085} y2={96} strokeWidth="1.5" />
        </g>
        <g data-slab="roof-left">
          <line x1={90} y1={180} x2={360} y2={166} />
        </g>
      </g>

      {/* ---------- left volume (travertine tower) ---------- */}
      <g data-layer="volume-left" stroke={L.main} strokeWidth="2">
        <polygon points="95,180 358,166 358,540 95,540" />
        <line x1={252} y1={172} x2={252} y2={540} stroke={L.mid} strokeWidth="1.5" />
      </g>

      {/* ---------- upper cantilevered volume ---------- */}
      <g data-layer="volume-upper" stroke={L.main} strokeWidth="2">
        <polygon points="466,95 1050,78 1050,348 466,355" />
        <polyline points="1050,78 1085,96 1085,342 1050,348" stroke={L.mid} />
        <line x1={466} y1={130} x2={1050} y2={114} stroke={L.faint} strokeWidth="1" data-beam="1" />
        <line x1={790} y1={90} x2={790} y2={350} stroke={L.mid} strokeWidth="1.5" data-beam="1" />
        <line x1={466} y1={320} x2={1050} y2={312} stroke={L.faint} strokeWidth="1" data-beam="1" />
      </g>

      {/* ---------- connector glazing box ---------- */}
      <g data-layer="volume-upper" stroke={L.mid} strokeWidth="1.5">
        <polygon points="358,205 466,200 466,540 358,540" />
      </g>

      {/* ---------- travertine fins ---------- */}
      <g data-layer="fins" stroke={L.warm} strokeWidth="2">
        {finLines.map((x) => (
          <line key={`fin${x}`} x1={x} y1={190} x2={x} y2={470} />
        ))}
        <line x1={98} y1={470} x2={250} y2={470} stroke={L.mid} strokeWidth="1.5" />
      </g>

      {/* ---------- glazing mullions ---------- */}
      <g data-layer="glazing" stroke={L.mid} strokeWidth="1.5">
        {/* ground-floor glass wall */}
        <rect x={470} y={358} width={578} height={180} stroke={L.main} />
        {groundMullions.map((x) => (
          <line key={`gm${x}`} x1={x} y1={358} x2={x} y2={538} />
        ))}
        {/* upper glazing */}
        <rect x={795} y={108} width={247} height={228} stroke={L.main} />
        {upperMullions.map((x) => (
          <line key={`um${x}`} x1={x} y1={110} x2={x} y2={334} />
        ))}
        <line x1={797} y1={300} x2={1040} y2={296} stroke={L.faint} strokeWidth="1" />
        {/* connector */}
        {connectorMullions.map((x) => (
          <line key={`cm${x}`} x1={x} y1={205} x2={x} y2={538} />
        ))}
      </g>

      {/* ---------- landscape ---------- */}
      <g data-layer="landscape" strokeWidth="1.5">
        {/* specimen tree marker — drawn as a survey symbol, not a sketch */}
        <g stroke={L.mid}>
          <line x1={310} y1={540} x2={310} y2={396} strokeWidth="1" />
          <circle cx={310} cy={366} r={30} stroke={L.faint} />
          <line x1={296} y1={366} x2={324} y2={366} strokeWidth="1" stroke={L.faint} />
          <line x1={310} y1={352} x2={310} y2={380} strokeWidth="1" stroke={L.faint} />
        </g>
        {/* grasses */}
        <g stroke={L.faint}>
          {[120, 150, 178, 420, 445, 468, 492].map((x) => (
            <path key={`gr${x}`} d={`M${x},540 q4,-18 -2,-30 M${x + 8},540 q-2,-14 6,-24`} />
          ))}
        </g>
        {/* pool waterline */}
        <line x1={335} y1={552} x2={1148} y2={547} stroke={L.mid} />
      </g>

      {/* ---------- dimensions & technical labels ---------- */}
      <g data-layer="dims" stroke={L.mid} strokeWidth="1">
        <g>
          <line x1={466} y1={62} x2={1050} y2={46} />
          <line x1={466} y1={54} x2={466} y2={70} />
          <line x1={1050} y1={38} x2={1050} y2={54} />
          <text x={758} y={44} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" letterSpacing="2">
            18.40 M
          </text>
        </g>
        <g>
          <line x1={1120} y1={78} x2={1120} y2={540} />
          <line x1={1112} y1={78} x2={1128} y2={78} />
          <line x1={1112} y1={540} x2={1128} y2={540} />
          <text x={1138} y={315} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" letterSpacing="2" transform="rotate(90 1138 315)">
            9.60 M
          </text>
        </g>
        <g>
          <line x1={95} y1={615} x2={358} y2={615} />
          <line x1={95} y1={607} x2={95} y2={623} />
          <line x1={358} y1={607} x2={358} y2={623} />
          <text x={226} y={636} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" letterSpacing="2">
            8.20 M
          </text>
        </g>
        <text x={912} y={372} fill={L.faint} stroke="none" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="3">
          CANTILEVER +9.6
        </text>
        <text x={112} y={168} fill={L.faint} stroke="none" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="3">
          TRAVERTINE FINS
        </text>
        <text x={620} y={575} fill={L.faint} stroke="none" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="3">
          REFLECTING POOL
        </text>
      </g>
    </svg>
  )
}
