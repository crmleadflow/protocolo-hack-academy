import { useState, useEffect, useCallback, useRef } from "react";

interface SpeechVoice {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
}

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<SpeechVoice[]>([]);
  const [spanishVoices, setSpanishVoices] = useState<SpeechVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const formattedVoices: SpeechVoice[] = availableVoices.map((voice) => ({
        voice,
        name: voice.name,
        lang: voice.lang,
      }));

      setVoices(formattedVoices);

      // Filter Spanish voices
      const spanish = formattedVoices.filter(
        (v) => v.lang.startsWith("es") || v.lang.includes("ES")
      );

      // Common male Spanish voice name patterns
      const maleNamePatterns = [
        "jorge", "diego", "pablo", "carlos", "juan", "miguel", 
        "andrés", "andres", "antonio", "enrique", "rodrigo",
        "male", "hombre", "masculino", "man", "guy"
      ];

      // Filter for male voices based on name patterns
      const maleSpanish = spanish.filter((v) => {
        const nameLower = v.name.toLowerCase();
        return maleNamePatterns.some((pattern) => nameLower.includes(pattern));
      });

      // Use male voices if available, otherwise show all Spanish voices
      const voicesToUse = maleSpanish.length > 0 ? maleSpanish : spanish;
      setSpanishVoices(voicesToUse);

      // Set default Spanish male voice if available
      if (voicesToUse.length > 0 && !selectedVoice) {
        // Prefer male voices from Spain or Mexico
        const preferredVoice = voicesToUse.find(
          (v) => v.lang === "es-ES" || v.lang === "es-MX"
        ) || voicesToUse[0];
        setSelectedVoice(preferredVoice);
      }
    };

    // Load voices immediately
    loadVoices();

    // Chrome loads voices asynchronously
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  const speak = useCallback((text: string) => {
    if (!isSupported || !selectedVoice) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text from markdown
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
      .replace(/\*(.*?)\*/g, "$1") // Italic
      .replace(/`(.*?)`/g, "$1") // Code
      .replace(/#{1,6}\s/g, "") // Headers
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
      .replace(/\n+/g, ". "); // New lines to pauses

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = selectedVoice.voice;
    utterance.lang = selectedVoice.lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice]);

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const selectVoice = useCallback((voiceName: string) => {
    const voice = spanishVoices.find((v) => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [spanishVoices]);

  return {
    voices,
    spanishVoices,
    selectedVoice,
    selectVoice,
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
  };
}
