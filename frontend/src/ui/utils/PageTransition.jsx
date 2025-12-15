import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

const PageTransition = ({ children }) => {
    const location = useLocation();
    const elementRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                elementRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
        }, elementRef);

        return () => ctx.revert();
    }, [location.pathname]);

    return <div ref={elementRef}>{children}</div>;
};

export default PageTransition;
