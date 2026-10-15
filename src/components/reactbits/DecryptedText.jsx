import { useEffect, useState, useRef } from 'react';

const DecryptedText = ({
  text,
  speed = 45,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  animateOn = 'hover',
  ...props
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrolledIntoView, setIsScrolledIntoView] = useState(false);
  const hasAnimated = useRef(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let interval;
    let currentIteration = 0;

    const getNextChar = (originalChar) => {
      if (originalChar === ' ') return ' ';
      if (useOriginalCharsOnly) {
        const chars = text.replace(/\s/g, '');
        return chars[Math.floor(Math.random() * chars.length)];
      }
      return characters[Math.floor(Math.random() * characters.length)];
    };

    const triggerAnimation = () => {
      currentIteration = 0;
      clearInterval(interval);

      interval = setInterval(() => {
        setDisplayText(() => {
          return text
            .split('')
            .map((char, i) => {
              if (char === ' ') return ' ';
              if (currentIteration >= maxIterations) return char;

              if (sequential) {
                if (revealDirection === 'start') {
                  if (i < (currentIteration / maxIterations) * text.length) {
                    return char;
                  }
                } else if (revealDirection === 'end') {
                  if (text.length - 1 - i < (currentIteration / maxIterations) * text.length) {
                    return char;
                  }
                }
              }

              return getNextChar(char);
            })
            .join('');
        });

        currentIteration++;
        if (currentIteration > maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
        }
      }, speed);
    };

    if (animateOn === 'view' && isScrolledIntoView && !hasAnimated.current) {
      triggerAnimation();
      hasAnimated.current = true;
    } else if (animateOn === 'hover' && isHovering) {
      triggerAnimation();
    }

    return () => clearInterval(interval);
  }, [
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    characters,
    useOriginalCharsOnly,
    isHovering,
    isScrolledIntoView,
    animateOn,
  ]);

  useEffect(() => {
    if (animateOn !== 'view') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsScrolledIntoView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [animateOn]);

  return (
    <span
      ref={containerRef}
      className={`inline-block ${parentClassName}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <span className={className}>{displayText}</span>
    </span>
  );
};

export default DecryptedText;
