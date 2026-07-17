import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import './MonolithCursor.css'

/**
 * Restrained custom cursor: a 4 px dot that tracks instantly and a thin
 * ring that follows with a breath of lag; the ring opens over links and
 * form fields. Desktop pointers only; disabled for reduced motion.
 */
export default function MonolithCursor() {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return undefined

    const root = ref.current
    root.style.display = 'block'
    document.documentElement.classList.add('has-cursor')
    const dot = root.querySelector('.cur-dot')
    const ring = root.querySelector('.cur-ring')

    const setDotX = gsap.quickSetter(dot, 'x', 'px')
    const setDotY = gsap.quickSetter(dot, 'y', 'px')
    const rx = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3.out' })
    const ry = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3.out' })

    const move = (e) => {
      setDotX(e.clientX)
      setDotY(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
      root.classList.add('cur-live')
    }
    const over = (e) => {
      const hot = e.target.closest('a, button, input, textarea, label')
      root.classList.toggle('cur-hot', !!hot)
    }
    const leave = () => root.classList.remove('cur-live')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div className="cur" ref={ref} aria-hidden="true">
      <span className="cur-dot" />
      <span className="cur-ring" />
    </div>
  )
}
