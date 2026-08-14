'use client'

import React, { useEffect, useRef, useState } from 'react'

export const BauhausCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isFinePointer, setIsFinePointer] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)')
    setIsFinePointer(media.matches)

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsFinePointer(e.matches)
    }

    if (media.addEventListener) {
      media.addEventListener('change', handleMediaChange)
    } else {
      // Fallback for older browsers
      media.addListener(handleMediaChange)
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', handleMediaChange)
      } else {
        media.removeListener(handleMediaChange)
      }
    }
  }, [])

  useEffect(() => {
    if (!isFinePointer) return

    const cursor = cursorRef.current
    if (!cursor) return

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`
      cursor.style.top = `${e.clientY}px`

      if (!cursor.classList.contains('active')) {
        cursor.classList.add('active')
      }
    }

    const interactiveSelectors =
      'a, button, input, select, textarea, [role="button"], [tabindex="0"], label, summary, .cursor-pointer, .interactive, .interactive-card'

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.closest(interactiveSelectors)) {
        cursor.classList.add('hovering')
      }
    }

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.closest(interactiveSelectors)) {
        cursor.classList.remove('hovering')
      }
    }

    const handleMouseDown = () => cursor.classList.add('clicking')
    const handleMouseUp = () => cursor.classList.remove('clicking')
    const handleMouseLeave = () => cursor.classList.remove('active')
    const handleMouseEnter = () => cursor.classList.add('active')

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
    }
  }, [isFinePointer])

  if (!isFinePointer) return null

  return (
    <div
      ref={cursorRef}
      id="bauhausCursor"
      className="bauhaus-cursor"
      aria-hidden="true"
    >
      <div className="cursor-dot" />
      <div className="cursor-ring" />
    </div>
  )
}
