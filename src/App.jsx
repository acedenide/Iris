import { useEffect, useState } from 'react';
import Hero3D from './Hero3D.jsx';
import { useSim } from './useSim.js';
import { TYPES as T } from './data.js';

const pct = (x) => Math.round(x * 100);
const clock = () => new Date().toLocaleTimeString([], { hour12: false });

const NAV = [
  ['ov', 'Overview'],
  ['alerts-card', 'Live alerts'],
  ['timeline', 'Attack timeline'],
  ['mitre', 'MITRE ATT&CK'],
  ['models', 'AI models']
];

function Clock() {
  const [t, setT] = useState(clock);
  useEffect(() => {
    const i = setInterval(() => setT(clock()), 1000);
    return () => clearInterval(i);
  }, []);
  return <span>{t}</span>;
}

function Bar({ label, val, max, text }) {
  return (
    <div className="bar">
      <span>{label}</span>
      <i><u style={{ width: (max ? (val / max) * 100 : 0) + '%' }} /></i>
      <em>{text ?? val}</em>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState('light'); // always opens in light mode
  const [active, setActive] = useState('ov');
  const { view, hot, select } = useSim();
  const { S, cnt, bins, alerts, src, models, sel, fps, pulse } = view;
  const { mp, np, risk } = models;

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const lvl = risk >= 75 ? ['Critical', 'hi'] : risk >= 50 ? ['Elevated', 'med'] : ['Low', ''];
  const riskColor = risk >= 75 ? 'var(--red)' : risk >= 50 ? 'var(--amber)' : 'var(--ok)';
  const maxCnt = Math.max(...cnt) || 1;
  const topSrc = Object.keys(src).sort((a, b) => src[b] - src[a]).slice(0, 5);

  return (
    <div className="app">
      <aside className="side">
        <div className="logo">IRIS</div>
        <nav>
          {NAV.map(([id, label]) => (
            <a key={id} href={'#' + id} className={active === id ? 'on' : ''} onClick={() => setActive(id)}>{label}</a>
          ))}
        </nav>
        <div className="node">
          <b>Sensor</b>eth1 · mirror port<br />Zeek + Snort<br />Wazuh · MISP<br />
          <span className="ok">7 of 7 containers healthy</span>
        </div>
      </aside>

      <div className="main">
        <header className="top">
          <h1>Security overview</h1>
          <span className="live">● Live</span>
          <span>{fps} flows/s</span>
          <Clock />
          <button
            className="theme"
            type="button"
            aria-pressed={theme === 'dark'}
            aria-label="Toggle dark mode"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
            )}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </header>

        <div className="grid">
          <section className="card c5 hero3d" id="ov">
            <Hero3D risk={risk} theme={theme} pulse={pulse} />
            <div className="score">
              <small>Network risk score</small>
              <b style={{ color: riskColor }}>{risk}</b>
              <span className={'pill ' + lvl[1]}>{lvl[0]}</span>
            </div>
          </section>

          <section className="card c3 tiles">
            <div><b>{S.f.toLocaleString()}</b>Flows analyzed</div>
            <div><b>{S.t}</b>Threats flagged</div>
            <div><b>{S.s}</b>False alarms suppressed</div>
            <div><b>{S.t ? (S.dt / S.t).toFixed(1) + ' s' : '–'}</b>Avg detection time</div>
          </section>

          <section className="card c4" id="models">
            <h2>AI decision agent</h2>
            <Bar label="XGBoost · Malware classifier" val={mp} max={1} text={pct(mp) + '%'} />
            <Bar label="CNN-LSTM · Network attack detector" val={np} max={1} text={pct(np) + '%'} />
            <p className="verdict">Fused verdict: <b>{risk >= 50 ? 'Threat (fused)' : 'Benign'}</b></p>
          </section>

          <section className="card c8" id="timeline">
            <h2>Attack timeline</h2>
            <div className="tlbars">
              {bins.map((b, i) => {
                const w = bins.slice(Math.max(0, i - 2), i + 1).reduce((x, y) => x + y, 0);
                return <i key={i} className={b ? 'hot' : ''} style={{ height: 4 + b * 90 + w * 10 }} />;
              })}
            </div>
            <div className="axis"><span>60 s ago</span><span>now</span></div>
          </section>

          <section className="card c4">
            <h2>Attack types</h2>
            <div id="dist">
              {T.map((t, i) => <Bar key={t.m} label={t.n} val={cnt[i]} max={maxCnt} />)}
            </div>
          </section>

          <section className="card c8" id="alerts-card">
            <h2>Live alerts</h2>
            <div className="arow ahead"><span>Time</span><span>Source → Target</span><span>Attack</span><span>Risk</span><span>MITRE</span></div>
            <div id="alerts">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className={'arow new' + (sel && sel.id === a.id ? ' sel' : '')}
                  tabIndex={0}
                  onClick={() => select(a)}
                  onKeyDown={(e) => { if (e.key === 'Enter') select(a); }}
                >
                  <span>{a.time}</span>
                  <span>{a.src} → {a.dst}</span>
                  <span>{a.ty.n}</span>
                  <span className={'sev' + (a.risk >= 85 ? ' hi' : '')}>{a.risk}</span>
                  <span>{a.ty.m}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card c4">
            <h2>Selected alert</h2>
            <div id="detail">
              {sel ? (
                [
                  ['Attack', sel.ty.n],
                  ['Flow', sel.src + ' → ' + sel.dst],
                  ['MITRE', sel.ty.m + ' · ' + sel.ty.t],
                  ['Risk', sel.risk + ' / 100'],
                  ['Detected in', sel.sec + ' s'],
                  ['Recommended action', sel.ty.a]
                ].map(([k, v]) => <p key={k}><b>{k}: </b>{v}</p>)
              ) : (
                <p className="mute">Waiting for the first alert…</p>
              )}
            </div>
          </section>

          <section className="card c8" id="mitre">
            <h2>MITRE ATT&amp;CK coverage</h2>
            <div className="mgrid">
              {T.map((t, i) => (
                <div className="mcol" key={t.m}>
                  <h3>{t.k}</h3>
                  <div className={'mcell' + (hot[t.m] ? ' hit' : '')}>
                    <b>{t.m}</b>{t.t}
                    <strong>{cnt[i]}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card c4">
            <h2>Top source IPs</h2>
            <div id="src">
              {topSrc.map((k) => <Bar key={k} label={k} val={src[k]} max={src[topSrc[0]]} />)}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
