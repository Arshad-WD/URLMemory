'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function GSAPVisuals() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        const ctx = gsap.context(() => {
            // Floating Auras
            gsap.to('.aura-1', {
                x: '15vw',
                y: '10vh',
                duration: 15,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            })

            gsap.to('.aura-2', {
                x: '-10vw',
                y: '-15vh',
                duration: 20,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            })

            // Mouse track for subtle skew/tilt
            const handleMouseMove = (e: MouseEvent) => {
                const { clientX, clientY } = e
                const xPos = (clientX / window.innerWidth - 0.5) * 15
                const yPos = (clientY / window.innerHeight - 0.5) * 15

                gsap.to('.technical-grid', {
                    rotateX: -yPos,
                    rotateY: xPos,
                    duration: 1.5,
                    ease: 'power2.out'
                })
            }

            window.addEventListener('mousemove', handleMouseMove)
            return () => window.removeEventListener('mousemove', handleMouseMove)
        }, containerRef)

        return () => ctx.revert()
    }, [])

    return (
        <div ref={containerRef} className="fixed inset-0 pointer-events-none -z-10 overflow-hidden perspective-[1200px]">
            {/* Base Grid */}
            <div className="technical-grid absolute inset-[-20%] opacity-[0.03] dark:opacity-[0.07]" 
                 style={{ 
                     backgroundImage: 'linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)', 
                     backgroundSize: '100px 100px',
                     transformStyle: 'preserve-3d'
                 }} />
            
            {/* Dynamic Auras */}
            <div className="aura-1 absolute top-[10%] left-[10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px]" />
            <div className="aura-2 absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-accent/5 rounded-full blur-[100px]" />
            
            {/* Ambient Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Dark Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-background)_100%)] opacity-60" />
        </div>
    )
}
