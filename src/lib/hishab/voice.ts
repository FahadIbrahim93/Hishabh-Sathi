interface SpeechResultList {
  [index: number]: { [index: number]: { transcript: string } };
}

interface SpeechEvent {
  results: SpeechResultList;
}

interface SpeechRec {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function Recog(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canListen(): boolean {
  return Recog() != null;
}

export function listenBangla(): Promise<string> {
  const Ctor = Recog();
  if (!Ctor) return Promise.reject(new Error("no-mic"));
  return new Promise((resolve, reject) => {
    const rec = new Ctor();
    rec.lang = "bn-BD";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let settled = false;
    rec.onresult = (event) => {
      settled = true;
      resolve(event.results[0]?.[0]?.transcript ?? "");
    };
    rec.onerror = () => {
      if (!settled) reject(new Error("mic"));
    };
    rec.onend = () => {
      if (!settled) reject(new Error("mic"));
    };
    try {
      rec.start();
    } catch {
      reject(new Error("mic"));
    }
  });
}

export function speakBangla(text: string): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "bn-BD";
  window.speechSynthesis.speak(utter);
  return true;
}
