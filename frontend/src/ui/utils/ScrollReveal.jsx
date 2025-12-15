import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({ children, className, delay = 0 }) => {
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                element,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: delay,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: element,
                        start: 'top 85%', // Animate when top of element hits 85% of viewport height
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }, elementRef);

        return () => ctx.revert();
    }, [delay]);

    return (
        <div ref={elementRef} className={className}>
            {children}
        </div>
    );
};

export default ScrollReveal;
