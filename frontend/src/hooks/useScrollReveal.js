import { useEffect, useRef } from 'react';

/**
 * Ajoute la classe "visible" à l'élément dès qu'il entre dans le viewport.
 * Usage :
 *   const ref = useScrollReveal();
 *   <div ref={ref} className="reveal"> ... </div>
 */
const useScrollReveal = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el); // une seule fois
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
};

export default useScrollReveal;
