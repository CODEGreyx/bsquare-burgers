import React from 'react'

/**
 * Ground-floor plan of the residence — the Scene 1 blueprint. Drawn in
 * authentic architectural drawing language: grid bubbles, wall poché as
 * double lines, door swings, stair run, dimension chains, room labels.
 *
 * Layer order for the draw-on choreography:
 *   origin → axes → footprint → walls → openings → fixtures
 *   → landscape → labels → dims → titleblock
 */

const L = {
  main: 'rgba(196,205,216,0.8)',
  mid: 'rgba(196,205,216,0.45)',
  faint: 'rgba(196,205,216,0.2)',
}

const gridV = [300, 470, 620, 830, 1050]
const gridH = [180, 330, 480, 560]

export default function FloorPlanSVG({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 1200 800"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* ---------- origin point + crosshair ---------- */}
      <g data-layer="origin">
        <circle data-dot="1" cx={600} cy={400} r={4} fill={L.main} stroke="none" />
        <line x1={600} y1={380} x2={600} y2={420} stroke={L.mid} strokeWidth="1" />
        <line x1={580} y1={400} x2={620} y2={400} stroke={L.mid} strokeWidth="1" />
      </g>

      {/* ---------- grid axes ---------- */}
      <g data-layer="axes" stroke={L.faint} strokeWidth="1">
        {gridV.map((x, i) => (
          <g key={`av${x}`}>
            <line x1={x} y1={120} x2={x} y2={700} />
            <circle cx={x} cy={104} r={13} stroke={L.mid} />
            <text x={x} y={109} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle">
              {String.fromCharCode(65 + i)}
            </text>
          </g>
        ))}
        {gridH.map((y, i) => (
          <g key={`ah${y}`}>
            <line x1={240} y1={y} x2={1110} y2={y} />
            <circle cx={222} cy={y} r={13} stroke={L.mid} />
            <text x={222} y={y + 5} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle">
              {i + 1}
            </text>
          </g>
        ))}
      </g>

      {/* ---------- footprint ---------- */}
      <g data-layer="footprint" stroke={L.main} strokeWidth="2.5">
        <polygon points="300,180 830,180 830,560 470,560 470,480 300,480" />
      </g>

      {/* ---------- internal walls (double-line poché) ---------- */}
      <g data-layer="walls" stroke={L.main} strokeWidth="1.5">
        {/* travertine wing / services */}
        <line x1={470} y1={186} x2={470} y2={474} />
        <line x1={478} y1={186} x2={478} y2={474} strokeWidth="1" stroke={L.mid} />
        {/* living / kitchen divider */}
        <line x1={620} y1={336} x2={620} y2={554} />
        <line x1={628} y1={336} x2={628} y2={554} strokeWidth="1" stroke={L.mid} />
        {/* study wall */}
        <line x1={306} y1={330} x2={464} y2={330} />
        <line x1={306} y1={338} x2={464} y2={338} strokeWidth="1" stroke={L.mid} />
        {/* core */}
        <rect x={484} y={330} width={130} height={110} stroke={L.mid} />
      </g>

      {/* ---------- openings: doors + stair ---------- */}
      <g data-layer="openings" stroke={L.mid} strokeWidth="1.5">
        {/* entry door swing */}
        <line x1={390} y1={480} x2={390} y2={432} />
        <path d="M390,432 A48,48 0 0 1 438,480" stroke={L.faint} />
        {/* living door */}
        <line x1={620} y1={300} x2={572} y2={300} data-skip="1" />
        {/* stair run in core */}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`st${i}`} x1={492 + i * 14} y1={338} x2={492 + i * 14} y2={432} stroke={L.faint} strokeWidth="1" />
        ))}
        <line x1={490} y1={385} x2={608} y2={385} stroke={L.mid} strokeWidth="1" />
        <path d="M598,378 L608,385 L598,392" stroke={L.mid} strokeWidth="1" />
      </g>

      {/* ---------- fixtures: glazing line, kitchen island ---------- */}
      <g data-layer="fixtures" stroke={L.mid} strokeWidth="1.5">
        {/* south glass wall shown as thin triple line */}
        <line x1={480} y1={556} x2={826} y2={556} stroke={L.main} strokeWidth="1" />
        <line x1={480} y1={552} x2={826} y2={552} stroke={L.faint} strokeWidth="1" />
        {/* island */}
        <rect x={660} y={380} width={120} height={36} />
        {/* sofa hint */}
        <rect x={680} y={470} width={110} height={44} stroke={L.faint} rx={2} />
      </g>

      {/* ---------- landscape: terrace + pool ---------- */}
      <g data-layer="landscape" stroke={L.mid} strokeWidth="1.5">
        <rect x={470} y={560} width={580} height={48} stroke={L.faint} />
        <rect x={560} y={630} width={490} height={92} stroke={L.main} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={`w${i}`} x1={575 + i * 8} y1={638} x2={575 + i * 8} y2={714} stroke={L.faint} strokeWidth="1" data-skip="1" />
        ))}
        {/* pine */}
        <circle cx={385} cy={640} r={38} stroke={L.faint} />
        <circle data-dot="1" cx={385} cy={640} r={4} fill={L.mid} stroke="none" />
      </g>

      {/* ---------- room labels ---------- */}
      <g data-layer="labels" fontFamily="Inter, sans-serif" fontSize="13" letterSpacing="4" fill={L.mid}>
        <text x={700} y={270}>LIVING</text>
        <text x={330} y={260}>STUDY</text>
        <text x={330} y={420}>ENTRY</text>
        <text x={700} y={445} fontSize="11" letterSpacing="3">KITCHEN</text>
        <text x={520} y={390} fontSize="10" letterSpacing="2" fill={L.faint}>CORE</text>
        <text x={720} y={592} fontSize="11" letterSpacing="3" fill={L.faint}>TERRACE</text>
        <text x={770} y={682}>POOL</text>
        <text x={505} y={215} fontSize="10" letterSpacing="2" fill={L.faint}>TRAVERTINE WALL</text>
      </g>

      {/* ---------- dimension chains ---------- */}
      <g data-layer="dims" stroke={L.mid} strokeWidth="1">
        <g>
          <line x1={300} y1={148} x2={830} y2={148} />
          <line x1={300} y1={140} x2={300} y2={156} />
          <line x1={830} y1={140} x2={830} y2={156} />
          <text x={565} y={138} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" textAnchor="middle" letterSpacing="2">
            18.40 M
          </text>
        </g>
        <g>
          <line x1={880} y1={180} x2={880} y2={560} />
          <line x1={872} y1={180} x2={888} y2={180} />
          <line x1={872} y1={560} x2={888} y2={560} />
          <text x={900} y={374} fill={L.mid} stroke="none" fontSize="12" fontFamily="Inter, sans-serif" letterSpacing="2" transform="rotate(90 900 374)">
            13.20 M
          </text>
        </g>
        <g>
          <line x1={268} y1={180} x2={268} y2={480} />
          <line x1={260} y1={180} x2={276} y2={180} />
          <line x1={260} y1={480} x2={276} y2={480} />
          <text x={252} y={334} fill={L.mid} stroke="none" fontSize="11" fontFamily="Inter, sans-serif" letterSpacing="2" transform="rotate(-90 252 334)">
            10.40 M
          </text>
        </g>
        {/* north arrow */}
        <g stroke={L.mid}>
          <circle cx={1090} cy={160} r={22} />
          <path d="M1090,176 L1090,146 M1083,153 L1090,144 L1097,153" />
          <text x={1090} y={200} fill={L.faint} stroke="none" fontSize="10" fontFamily="Inter, sans-serif" textAnchor="middle" letterSpacing="3">
            N
          </text>
        </g>
      </g>

      {/* ---------- title block ---------- */}
      <g data-layer="titleblock" fontFamily="Inter, sans-serif" fill={L.mid}>
        <rect x={906} y={640} width={230} height={92} fill="none" stroke={L.mid} strokeWidth="1" />
        <line x1={906} y1={668} x2={1136} y2={668} stroke={L.faint} strokeWidth="1" />
        <line x1={906} y1={700} x2={1136} y2={700} stroke={L.faint} strokeWidth="1" />
        <text x={920} y={660} fontSize="12" letterSpacing="4">NØRTHLINE RESIDENCES</text>
        <text x={920} y={688} fontSize="10" letterSpacing="2" fill={L.faint}>GROUND FLOOR PLAN · BLN-01</text>
        <text x={920} y={720} fontSize="10" letterSpacing="2" fill={L.faint}>SCALE 1:100 · SHEET A-101</text>
      </g>
    </svg>
  )
}
