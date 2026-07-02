import { useEffect, useRef } from 'react';

export function useHeaderInView(onHeaderInView) {
    const callbackRef = useRef(onHeaderInView);
    callbackRef.current = onHeaderInView;

    useEffect(() => {
        const headers = Array.from(
            document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        );

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callbackRef.current(entry.target);
                }
            });
        }, observerOptions);

        headers.forEach((header) => observer.observe(header));

        return () => {
            observer.disconnect();
        };
    }, []); // mount/unmount only — IntersectionObserver fires on scroll
}
