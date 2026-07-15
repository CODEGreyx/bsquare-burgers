import { createContext, useContext } from 'react'

/**
 * Filming Mode state is owned by <FilmingMode/> and shared through this
 * context: { filming, toggleFilming, paused, togglePaused, reset }.
 * Keyboard shortcuts (handled in FilmingMode.jsx):
 *   F — toggle Filming Mode        R — reset to start
 *   M — toggle sound               Space — pause/resume animation clock
 */
export const FilmingContext = createContext({
  filming: false,
  paused: false,
  toggleFilming: () => {},
  togglePaused: () => {},
  reset: () => {},
})

export const useFilmingMode = () => useContext(FilmingContext)
