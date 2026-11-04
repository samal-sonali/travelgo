import React, { Suspense, lazy } from 'react';

// Lottie (and its ~300 KB player) only loads the first time a loader is shown.
const LottiePlayer = lazy(async () => {
  const [{ default: Lottie }, { default: animationData }] = await Promise.all([import('lottie-react'), import('../assets/loader.json')]);
  return { default: (props) => <Lottie animationData={animationData} loop {...props} /> };
});

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function LottieLoader({ size = 96, label = 'Loading' }) {
  const fallback = <span className="lottie-fallback" style={{ width: size, height: size }} />;
  return <span className="lottie-loader" role="status" aria-label={label}>
    {reducedMotion() ? fallback : <Suspense fallback={fallback}><LottiePlayer style={{ width: size, height: size }} /></Suspense>}
  </span>;
}
