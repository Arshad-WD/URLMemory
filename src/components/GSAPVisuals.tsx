
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function GSAPVisuals() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const ctx = gsap.context(() => {
            // Scanning line animation
            gsap.to('.scanning-line', {
                top: '100%',
                duration: 8,
                repeat: -1,
                ease: 'none',
                opacity: 0,
                stagger: {
                    each: 4,
                    repeat: -1
                }
            })

            // Mouse track for subtle skew/tilt
            const handleMouseMove = (e: MouseEvent) => {
                const { clientX, clientY } = e
                const xPos = (clientX / window.innerWidth - 0.5) * 20
                const yPos = (clientY / window.innerHeight - 0.5) * 20

                gsap.to('.technical-grid', {
                    rotateX: -yPos,
                    rotateY: xPos,
                    duration: 1,
                    ease: 'power2.out'
                })
            }

            window.addEventListener('mousemove', handleMouseMove)
            return () => window.removeEventListener('mousemove', handleMouseMove)
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none -z-10 overflow-hidden perspective-[1000px]">
            <div className="technical-grid absolute inset-[-10%] opacity-[0.05] dark:opacity-[0.1] border-2 border-primary/20" 
                 style={{ backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
            
            <div className="scanning-line absolute top-[-10%] left-0 w-full h-[30vh] bg-gradient-to-b from-transparent via-primary/20 to-transparent pointer-events-none" />
            
            {/* Ambient vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-background)_100%)] opacity-80" />
        </div>
    )
}
