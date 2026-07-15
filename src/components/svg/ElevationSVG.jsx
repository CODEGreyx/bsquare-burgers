import React from 'react'

/**
 * Line-art elevation of the NØRTHLINE residence, traced coordinate-by-
 * coordinate against the structural photograph (residence-structure.webp,
 * same framing as the completed hero). The viewBox aspect matches the
 * photos' 2752×1536 frame, so with `preserveAspectRatio="slice"` the
 * drawing overlays the photography 1:1 at any viewport — the wireframe
 * reads as an x-ray of the real building.
 *
 * Layers are ordered the way a building is actually built and are
 * addressed by [data-layer] from the construction timeline:
 *
 *   ground → grid → columns → slabs → volume-left → volume-upper
 *   → fins → glazing → landscape → dims
 */

export const VIEWBOX = { w: 1200, h: 670 }

const L = {
  main: 'rgba(196,205,216,0.75)',
  mid: 'rgba(196,205,216,0.45)',
  faint: 'rgba(196,205,216,0.22)',
  warm: 'rgba(201,160,106,0.55)',
}

/* measured structural lines (see structure photo trace) */
const gridV = [85, 330, 467, 718, 930, 1064]
const gridH = [166, 347, 540]
const finLines = Array.from({ length: 11 }, (_, i) => 98 + i * 13)
const groundMullions = [512, 556, 600, 644, 688, 732, 776, 820, 864, 908, 952]
const upperMullions = [905, 943, 981, 1019]
const connectorMullions = [425, 445]

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
          <line key={`gv${x}`} x1={x} y1={40} x2={x} y2={620} />
        ))}
        {gridH.map((y) => (
          <line key={`gh${y}`} x1={30} y1={y} x2={1170} y2={y} />
        ))}
        {gridV.map((x, i) => (
          <g key={`gb${x}`} stroke={L.mid}>
            <circle cx={x} cy={26} r={11} fill="none" />
            <text
              x={x}
              y={30}
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
        <line x1={65} y1={540} x2={1145} y2={505} />
        {/* terrace slab edge */}
        <line x1={425} y1={551} x2={1113} y2={513} stroke={L.mid} strokeWidth="1.5" />
        {/* excavated pool basin */}
        <polygon
          points="676,556 1198,516 1198,668 613,668"
          stroke={L.mid}
          strokeWidth="1.5"
        />
        <line x1={95} y1={560} x2={65} y2={592} stroke={L.faint} strokeWidth="1" />
        <line x1={135} y1={558} x2={105} y2={590} stroke={L.faint} strokeWidth="1" />
        <line x1={175} y1={556} x2={145} y2={588} stroke={L.faint} strokeWidth="1" />
      </g>

      {/* ---------- structural columns ---------- */}
      <g data-layer="columns" stroke={L.main} strokeWidth="3">
        <line x1={545} y1={368} x2={545} y2={545} data-rise="1" />
        <line x1={718} y1={351} x2={718} y2={534} data-rise="1" />
        <line x1={930} y1={330} x2={930} y2={518} data-rise="1" />
        <line x1={406} y1={225} x2={406} y2={548} data-rise="1" strokeWidth="2" />
        <line x1={85} y1={240} x2={85} y2={532} data-rise="1" strokeWidth="2" />
        <line x1={330} y1={215} x2={330} y2={512} data-rise="1" strokeWidth="2" />
      </g>

      {/* ---------- floor slabs ---------- */}
      <g data-layer="slabs" stroke={L.main} strokeWidth="2.5">
        <g data-slab="ground">
          <line x1={85} y1={532} x2={1113} y2={498} />
        </g>
        <g data-slab="level1">
          {/* cantilever soffit: front face then receding right face */}
          <line x1={467} y1={376} x2={764} y2={347} />
          <line x1={764} y1={347} x2={1064} y2={316} strokeWidth="2" />
        </g>
        <g data-slab="roof-right">
          <line x1={467} y1={166} x2={764} y2={44} />
          <line x1={764} y1={44} x2={1064} y2={120} strokeWidth="2" />
        </g>
        <g data-slab="roof-left">
          <line x1={85} y1={240} x2={330} y2={215} />
        </g>
      </g>

      {/* ---------- left volume (travertine tower) ---------- */}
      <g data-layer="volume-left" stroke={L.main} strokeWidth="2">
        <polygon points="85,240 330,215 330,512 85,532" />
        {/* receding right face toward the connector */}
        <polyline points="330,215 452,208 452,500 330,512" stroke={L.mid} />
        <line x1={240} y1={224} x2={240} y2={522} stroke={L.mid} strokeWidth="1.5" />
      </g>

      {/* ---------- upper cantilevered volume ---------- */}
      <g data-layer="volume-upper" stroke={L.main} strokeWidth="2">
        {/* front-left face */}
        <polygon points="467,166 764,44 764,347 467,376" />
        {/* receding right face */}
        <polyline points="764,44 1064,120 1064,316 764,347" />
        {/* structural hint lines */}
        <line x1={615} y1={105} x2={615} y2={362} stroke={L.faint} strokeWidth="1" data-beam="1" />
        <line x1={467} y1={210} x2={764} y2={95} stroke={L.faint} strokeWidth="1" data-beam="1" />
        <line x1={914} y1={82} x2={914} y2={331} stroke={L.faint} strokeWidth="1" data-beam="1" />
      </g>

      {/* ---------- connector: steel + glazing box ---------- */}
      <g data-layer="volume-upper" stroke={L.mid} strokeWidth="1.5">
        <polygon points="406,225 467,220 467,505 406,510" />
        <line x1={388} y1={218} x2={465} y2={212} />
        <line x1={388} y1={234} x2={465} y2={229} />
      </g>

      {/* ---------- travertine fins ---------- */}
      <g data-layer="fins" stroke={L.warm} strokeWidth="2">
        {finLines.map((x) => (
          <line key={`fin${x}`} x1={x} y1={252} x2={x} y2={500} />
        ))}
        <line x1={98} y1={500} x2={228} y2={492} stroke={L.mid} strokeWidth="1.5" />
      </g>

      {/* ---------- glazing mullions ---------- */}
      <g data-layer="glazing" stroke={L.mid} strokeWidth="1.5">
        {/* ground-floor glass wall */}
        <polygon points="469,382 982,340 982,524 469,548" stroke={L.main} />
        {groundMullions.map((x) => {
          const t = (x - 469) / (982 - 469)
          const y1 = 382 - t * 42
          const y2 = 548 - t * 24
          return <line key={`gm${x}`} x1={x} y1={y1} x2={x} y2={y2} />
        })}
        {/* upper glazing, right face */}
        <polygon points="867,125 1047,168 1047,305 867,300" stroke={L.main} />
        {upperMullions.map((x) => {
          const t = (x - 867) / (1047 - 867)
          const y1 = 125 + t * 43
          const y2 = 300 + t * 5
          return <line key={`um${x}`} x1={x} y1={y1} x2={x} y2={y2} />
        })}
        {/* connector */}
        {connectorMullions.map((x) => (
          <line key={`cm${x}`} x1={x} y1={228} x2={x} y2={506} />
        ))}
      </g>

      {/* ---------- landscape ---------- */}
      <g data-layer="landscape" strokeWidth="1.5">
        {/* specimen pine marker — survey symbol at the planted position */}
        <g stroke={L.mid}>
          <line x1={376} y1={545} x2={376} y2={442} strokeWidth="1" />
          <circle cx={376} cy={410} r={32} stroke={L.faint} />
          <line x1={361} y1={410} x2={391} y2={410} strokeWidth="1" stroke={L.faint} />
          <line x1={376} y1={395} x2={376} y2={425} strokeWidth="1" stroke={L.faint} />
        </g>
        {/* grasses */}
        <g stroke={L.faint}>
          {[130, 165, 198, 460, 488].map((x) => (
            <path key={`gr${x}`} d={`M${x},538 q4,-18 -2,-30 M${x + 8},538 q-2,-14 6,-24`} />
          ))}
        </g>
        {/* waterline in the filled pool */}
        <line x1={680} y1={560} x2={1194} y2={521} stroke={L.mid} />
      </g>

      {/* ---------- dimensions & technical labels ---------- */}
      <g data-layer="dims" stroke={L.mid} strokeWidth="1">
        <g>
          <line x1={467} y1={30} x2={1064} y2={30} />
          <line x1={467} y1={22} x2={467} y2={38} />
          <line x1={1064} y1={22} x2={1064} y2={38} />
          <text x={766} y={22} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" letterSpacing="2">
            18.40 M
          </text>
        </g>
        <g>
          <line x1={1120} y1={120} x2={1120} y2={505} />
          <line x1={1112} y1={120} x2={1128} y2={120} />
          <line x1={1112} y1={505} x2={1128} y2={505} />
          <text x={1140} y={318} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" letterSpacing="2" transform="rotate(90 1140 318)">
            9.60 M
          </text>
        </g>
        <g>
          <line x1={85} y1={618} x2={330} y2={618} />
          <line x1={85} y1={610} x2={85} y2={626} />
          <line x1={330} y1={610} x2={330} y2={626} />
          <text x={207} y={640} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" letterSpacing="2">
            8.20 M
          </text>
        </g>
        <text x={790} y={378} fill={L.faint} stroke="none" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="3">
          CANTILEVER +9.6
        </text>
        <text x={98} y={230} fill={L.faint} stroke="none" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="3">
          TRAVERTINE FINS
        </text>
        <text x={800} y={648} fill={L.faint} stroke="none" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="3">
          REFLECTING POOL
        </text>
      </g>
    </svg>
  )
}
