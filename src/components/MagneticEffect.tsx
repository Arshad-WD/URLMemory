
'use client'

import { useEffect, useRef, ReactNode } from 'react'
import gsap from 'gsap'

interface MagneticEffectProps {
    children: ReactNode
    strength?: number
}

export default function MagneticEffect({ children, strength = 0.3 }: MagneticEffectProps) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!ref.current) return

        const currentRef = ref.current
        
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e
            const { left, top, width, height } = currentRef.getBoundingClientRect()
            
            const centerX = left + width / 2
            const centerY = top + height / 2
            
            const x = clientX - centerX
            const y = clientY - centerY
            
            gsap.to(currentRef, {
                x: x * strength,
                y: y * strength,
                duration: 0.6,
                ease: 'power2.out'
            })
        }

        const handleMouseLeave = () => {
            gsap.to(currentRef, {
                x: 0,
                y: 0,
                duration: 0.8,
                ease: 'elastic.out(1, 0.5)'
            })
        }

        currentRef.addEventListener('mousemove', handleMouseMove)
        currentRef.addEventListener('mouseleave', handleMouseLeave)

        return () => {
            currentRef.removeEventListener('mousemove', handleMouseMove)
            currentRef.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [strength])

    return <div ref={ref} className="inline-block">{children}</div>
}
