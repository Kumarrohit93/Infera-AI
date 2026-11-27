import { useEffect, useState } from "react";
import inferaLogo from "../assets/InferaAI_Logo1.svg";

const ANIMATION_DURATION = 3000;
export const LOGIN_SPLASH_EVENT = "infera:login-splash";

export function triggerLoginSplash() {
  window.dispatchEvent(new Event(LOGIN_SPLASH_EVENT));
}

export default function PageTransitionLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let hideTimer = null;

    const handleLoginSplash = () => {
      const reducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const duration = reducedMotion ? 0 : ANIMATION_DURATION;

      setVisible(true);
      if (hideTimer) window.clearTimeout(hideTimer);

      hideTimer = window.setTimeout(() => {
        setVisible(false);
      }, duration);
    };

    window.addEventListener(LOGIN_SPLASH_EVENT, handleLoginSplash);

    return () => {
      window.removeEventListener(LOGIN_SPLASH_EVENT, handleLoginSplash);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Infera AI"
      className="infera-loader-root fixed inset-0 z-[9999] grid place-items-center overflow-hidden text-[#5E232B] backdrop-blur-md"
      style={{
        background:
          "radial-gradient(ellipse at 50% 42%, rgba(255, 255, 255, 0.97) 0%, rgba(253, 246, 246, 0.92) 42%, rgba(248, 229, 232, 0.9) 100%)",
        animation: `inferaLifetime ${ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) both`,
      }}
    >
      {/* Background Halo Rings */}
      <span
        aria-hidden="true"
        className="infera-halo-outer pointer-events-none absolute aspect-square w-[min(76vw,680px)] rounded-full border border-[#9E4752]/10"
      />
      <span
        aria-hidden="true"
        className="infera-halo-inner pointer-events-none absolute aspect-square w-[min(58vw,500px)] rounded-full border border-[#9E4752]/[0.06]"
      />

      {/* Center Panel */}
      <div
        className="infera-panel relative z-10 flex w-[min(90vw,340px)] flex-col items-center text-center"
        style={{
          animation: "inferaArrive 900ms cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        {/* Emblem */}
        <div
          aria-hidden="true"
          className="relative mb-[22px] grid h-[112px] w-[112px] place-items-center"
        >
          {/* Outer Orbit */}
          <span
            className="infera-orbit-outer absolute inset-[2px] rounded-full border border-[#9E4752]/25 border-r-[#9E4752]/[0.08] border-t-[#9E4752]"
          />

          {/* Inner Orbit */}
          <span
            className="infera-orbit-inner absolute inset-[13px] rounded-full border border-dashed border-[#D7A781]/70"
          />

          {/* Particles */}
          <span
            className="infera-particle-one absolute top-[13px] left-[25px] h-[7px] w-[7px] rounded-full border border-white bg-[#D7A781] shadow-[0_0_12px_rgba(215,167,129,0.72)]"
          />
          <span
            className="infera-particle-two absolute right-[12px] bottom-[36px] h-[5px] w-[5px] rounded-full border border-white bg-[#D7A781] shadow-[0_0_12px_rgba(215,167,129,0.72)]"
          />
          <span
            className="infera-particle-three absolute bottom-[15px] left-[39px] h-[4px] w-[4px] rounded-full border border-white bg-[#D7A781] shadow-[0_0_12px_rgba(215,167,129,0.72)]"
          />

          {/* Center Core */}
          <span
            className="infera-core grid h-[60px] w-[60px] place-items-center rounded-[22px] border border-[#9E4752]/15 shadow-[0_9px_28px_rgba(114,47,55,0.16),inset_0_1px_rgba(255,255,255,0.8)]"
            style={{
              background: "linear-gradient(145deg, #ffffff, #f8f4e7)",
            }}
          >
            <img
              src={inferaLogo}
              alt=""
              className="block h-[36px] w-[43px] object-contain"
            />
          </span>
        </div>

        {/* Brand & Text */}
        <p className="m-0 text-[28px] font-bold tracking-[-0.055em] text-[#5E232B]">
          Infera <span className="text-[#9E4752]">AI</span>
        </p>

        <p className="mt-[7px] mb-[20px] text-[13px] tracking-[0.015em] text-[#8C6268]">
          Preparing your workspace
        </p>

        {/* Progress Bar */}
        <div
          aria-hidden="true"
          className="h-[3px] w-[164px] overflow-hidden rounded-full bg-[#9E4752]/15"
        >
          <span
            className="infera-progress-bar block h-full w-[42%] rounded-full shadow-[0_0_12px_rgba(158,71,82,0.4)]"
            style={{
              background: "linear-gradient(90deg, #d7a781, #9e4752)",
              animation: `inferaProgress ${ANIMATION_DURATION}ms cubic-bezier(0.45, 0, 0.25, 1) both`,
            }}
          />
        </div>

        <p className="mt-[13px] mb-0 text-[9px] font-bold tracking-[0.24em] text-[#8C6268]/85">
          INTELLIGENCE IN MOTION
        </p>
      </div>

      <style>{`
        .infera-orbit-outer {
          animation: inferaOrbit 5s linear infinite;
        }
        .infera-orbit-inner {
          animation: inferaOrbit 12s linear infinite reverse;
        }
        .infera-core {
          animation: inferaCore 2.2s ease-in-out infinite;
        }
        .infera-particle-one {
          animation: inferaParticle 2.4s ease-in-out infinite;
        }
        .infera-particle-two {
          animation: inferaParticle 2.4s ease-in-out -800ms infinite;
        }
        .infera-particle-three {
          animation: inferaParticle 2.4s ease-in-out -1600ms infinite;
        }
        .infera-halo-outer {
          animation: inferaHalo 5s ease-in-out infinite;
        }
        .infera-halo-inner {
          animation: inferaHalo 5s ease-in-out -2.5s infinite reverse;
        }

        @keyframes inferaLifetime {
          0%, 82% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes inferaArrive {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes inferaOrbit {
          to { transform: rotate(360deg); }
        }
        @keyframes inferaCore {
          0%, 100% {
            transform: scale(0.96);
            box-shadow: 0 7px 22px rgba(114, 47, 55, 0.12), inset 0 1px rgba(255, 255, 255, 0.8);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 10px 32px rgba(114, 47, 55, 0.22), inset 0 1px rgba(255, 255, 255, 0.9);
          }
        }
        @keyframes inferaParticle {
          0%, 100% { opacity: 0.45; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        @keyframes inferaHalo {
          0%, 100% { opacity: 0.35; transform: scale(0.97); }
          50% { opacity: 0.75; transform: scale(1.03); }
        }
        @keyframes inferaProgress {
          from { transform: translateX(-120%); }
          to { transform: translateX(250%); }
        }

        @media (prefers-reduced-motion: reduce) {
          .infera-loader-root,
          .infera-loader-root * {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}