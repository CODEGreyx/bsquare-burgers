/**
 * Central asset registry.
 *
 * Every visual asset the experience uses is declared here. Components read
 * from this file only — swap a file on disk (same path) or update a path
 * here and no animation code needs to change.
 *
 * `video` entries may be null: when a video is missing the scene falls back
 * to its still + code-driven motion (slow scale/pan, light sweeps). Drop a
 * real Higgsfield render at the listed path and set the property to the
 * path string to activate it. Prompts for every asset live in
 * HIGGSFIELD-PROMPTS.md.
 */

export const stills = {
  /** Completed residence, hero dusk angle — the master reference. */
  residenceComplete: '/assets/exterior/residence-complete.webp',
  /** Same angle, raw structural skeleton (columns, slabs, core). */
  residenceStructure: '/assets/construction/residence-structure.webp',
  /** Same angle, mid construction (concrete done, glazing partial). */
  residenceConstruction: '/assets/construction/residence-construction.webp',
  /** Ground-floor living space of the same residence. */
  interiorLiving: '/assets/interior/interior-living.webp',
  /** Reverse angle of the same living room, toward the glazing + pool. */
  interiorLiving2: '/assets/interior/interior-living-2.webp',
}

export const videos = {
  /**
   * THE BUILD. A single locked-camera construction clip: bare plot →
   * structural frame → concrete → glass → warm light at dusk. When set,
   * BuildScene scrubs this video's timeline directly to scroll position
   * (it builds as you scroll, reverses as you scroll up) instead of the
   * code-driven stage reveal. Encode with dense keyframes for smooth
   * seeking — see HIGGSFIELD-PROMPTS.md (video V0).
   */
  buildTimelapse: '/assets/video/build-timelapse.mp4', // Pexels 7025003, 4K day→dusk works timelapse

  /** Slow cinematic push toward the residence at dusk. */
  exteriorApproach: null, // '/assets/video/exterior-approach.mp4'
  /** Slow drift across glass / water / wet concrete reflections. */
  exteriorReflection: null, // '/assets/video/exterior-reflection.mp4'
  /** Light moving across interior stone. */
  interiorLight: null, // '/assets/video/interior-light.mp4'
  /** Macro material sequence: stone, oak, metal, glass. */
  materialMacro: null, // '/assets/video/material-macro.mp4'
  /** Elevated Berlin atmosphere matching the grade. */
  berlinAtmosphere: null, // '/assets/video/berlin-atmosphere.mp4'
}

/** Reserved for macro material photography (see HIGGSFIELD-PROMPTS.md).
 *  Not currently displayed — the material-panel beat was replaced by the
 *  lights-on reveal — but kept so future scenes can wire them in. */
export const materials = {
  stone: null, // '/assets/materials/material-stone.webp'
  oak: null, // '/assets/materials/material-oak.webp'
  metal: null, // '/assets/materials/material-metal.webp'
  glass: null, // '/assets/materials/material-glass.webp'
}
