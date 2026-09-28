import { useEffect, useRef } from 'react';
import { createScene } from './scene.js';

export default function Hero3D({ risk, theme, pulse }) {
  const ref = useRef(null);
  const sc = useRef(null);

  useEffect(() => {
    sc.current = createScene(ref.current);
    return () => {
      if (sc.current) sc.current.dispose();
      sc.current = null;
    };
  }, []);
  useEffect(() => { if (sc.current) sc.current.setTheme(theme); }, [theme]);
  useEffect(() => { if (sc.current) sc.current.setRisk(risk); }, [risk]);
  useEffect(() => { if (pulse && sc.current) sc.current.pulse(); }, [pulse]);

  return <canvas id="iris" ref={ref} aria-label="3D iris visual of live traffic" />;
}
