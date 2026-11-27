import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import inferaLogo from '../assets/InferaAI_Logo1.svg';
import './PageTransitionLoader.css';

const ANIMATION_DURATION = 3000;

export default function PageTransitionLoader() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(
      () => setVisible(false),
      reducedMotion ? 0 : ANIMATION_DURATION
    );

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="infera-loader infera-loader--admin"
      role="status"
      aria-live="polite"
      aria-label="Loading Infera AI"
    >
      <div className="infera-loader__panel">
        <div className="infera-loader__emblem" aria-hidden="true">
          <span className="infera-loader__orbit infera-loader__orbit--outer" />
          <span className="infera-loader__orbit infera-loader__orbit--inner" />
          <span className="infera-loader__particle infera-loader__particle--one" />
          <span className="infera-loader__particle infera-loader__particle--two" />
          <span className="infera-loader__particle infera-loader__particle--three" />
          <span className="infera-loader__core">
            <img src={inferaLogo} alt="" />
          </span>
        </div>
        <p className="infera-loader__brand">
          Infera <span>AI</span>
        </p>
        <p className="infera-loader__message">Preparing your workspace</p>
        <div className="infera-loader__progress" aria-hidden="true">
          <span />
        </div>
        <p className="infera-loader__caption">INTELLIGENCE IN MOTION</p>
      </div>
    </div>
  );
}
