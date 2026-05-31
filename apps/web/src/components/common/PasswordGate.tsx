import { useState, type ReactNode } from "react";

// Change this to whatever password you want
const CORRECT_PASSWORD = "phd@2026";

type Props = {
  storageKey: string;   // unique key per protected page
  children: ReactNode;
};

export function PasswordGate({ storageKey, children }: Props) {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(storageKey) === "1"
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      sessionStorage.setItem(storageKey, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 600);
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div
        className={`w-full max-w-sm rounded-3xl border border-white/10 bg-white/6 p-10 backdrop-blur-xl shadow-glow
          ${shake ? "animate-shake" : ""}`}
      >
        {/* Lock icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10">
            <svg className="h-7 w-7 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 10.5V7.5a4.5 4.5 0 00-9 0v3M6 10.5h12a1.5 1.5 0 011.5 1.5v7.5A1.5 1.5 0 0118 21H6a1.5 1.5 0 01-1.5-1.5V12A1.5 1.5 0 016 10.5z" />
            </svg>
          </div>
        </div>

        <h2 className="text-center text-xl font-semibold text-white">Restricted access</h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          This document is password protected.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Enter password"
            autoFocus
            className={`w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-slate-500 outline-none
              bg-white/5 backdrop-blur transition
              ${error
                ? "border-rose-400/60 focus:border-rose-400"
                : "border-white/10 focus:border-cyan-400/60"
              }`}
          />

          {error && (
            <p className="text-center text-xs text-rose-400">Incorrect password — try again.</p>
          )}

          <button
            type="submit"
            className="rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-slate-950
              transition hover:bg-cyan-400 active:scale-[0.98]"
          >
            Unlock
          </button>
        </form>
      </div>

      {/* shake animation */}
      <style>{`
        @keyframes shake {
          0%,100%{ transform:translateX(0) }
          20%{ transform:translateX(-8px) }
          40%{ transform:translateX(8px) }
          60%{ transform:translateX(-5px) }
          80%{ transform:translateX(5px) }
        }
        .animate-shake{ animation:shake 0.5s ease; }
      `}</style>
    </div>
  );
}
