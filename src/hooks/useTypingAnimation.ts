import { useState, useEffect, useRef } from "react";

export function useTypingAnimation(
  words: string[],
  typeSpeed = 80,
  pauseDuration = 1500,
  deleteSpeed = 40
) {
  const [displayText, setDisplayText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let currentWord = words[indexRef.current];
    let charIndex = 0;
    let isDeleting = false;

    function tick() {
      if (!isDeleting) {
        // Typing
        charIndex++;
        setDisplayText(currentWord.slice(0, charIndex));
        if (charIndex === currentWord.length) {
          // Pause before deleting
          timeout = setTimeout(() => {
            isDeleting = true;
            tick();
          }, pauseDuration);
          return;
        }
        timeout = setTimeout(tick, typeSpeed);
      } else {
        // Deleting
        charIndex--;
        setDisplayText(currentWord.slice(0, charIndex));
        if (charIndex === 0) {
          isDeleting = false;
          indexRef.current = (indexRef.current + 1) % words.length;
          currentWord = words[indexRef.current];
          timeout = setTimeout(tick, typeSpeed);
          return;
        }
        timeout = setTimeout(tick, deleteSpeed);
      }
    }

    tick();

    return () => clearTimeout(timeout);
  }, [words, typeSpeed, pauseDuration, deleteSpeed]);

  return displayText;
}
