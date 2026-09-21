import { useRef, useEffect, useState, useMemo } from 'react';

interface ScrollTextRevealProps {
  text: string;
  className?: string;
  staggerDelay?: number; // ms per character
  threshold?: number;
}

/**
 * Per-letter reveal for section headings. Everything it renders is a <span>, so it
 * is valid inside an <h2> or a <p>; the caller labels the real element (aria-label)
 * and hides this one, because letter-by-letter spans read badly aloud.
 */
const ScrollTextReveal = ({
  text,
  className = '',
  staggerDelay = 30,
  threshold = 0.3,
}: ScrollTextRevealProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const words = useMemo(() => {
    const result: { chars: string[]; startIndex: number }[] = [];
    let idx = 0;
    for (const word of text.split(' ')) {
      if (word.length === 0) continue;
      result.push({ chars: [...word], startIndex: idx });
      idx += word.length;
    }
    return result;
  }, [text]);

  return (
    <span ref={ref} className="inline-block">
      <span className={className}>
        {words.map((word, wi) => (
          <span key={wi}>
            {wi > 0 && ' '}
            <span className="inline-block whitespace-nowrap">
              {word.chars.map((char, ci) => {
                const charIdx = word.startIndex + ci;
                return (
                  <span
                    key={ci}
                    className="inline-block"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
                      transition: `opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${charIdx * staggerDelay}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${charIdx * staggerDelay}ms`,
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
};

export default ScrollTextReveal;
