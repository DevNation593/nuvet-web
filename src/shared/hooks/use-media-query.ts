import { useEffect, useState } from 'react';

/**
 * Hook para detectar media queries
 * @param query - Media query CSS (e.g., "(min-width: 768px)")
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        
        // Set initial value
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        // Listen for changes
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}

/**
 * Hook para detectar si estamos en dispositivo móvil
 */
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook para detectar si estamos en tablet
 */
export function useIsTablet(): boolean {
    return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook para detectar si estamos en desktop
 */
export function useIsDesktop(): boolean {
    return useMediaQuery('(min-width: 1024px)');
}
