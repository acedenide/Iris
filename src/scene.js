import * as THREE from 'three';

const PAL = {
  light: { r: [0x4F46E5, 0x7C3AED, 0x0EA5E9, 0x4F46E5, 0x818CF8], bs: 0x818CF8, am: 0xDC2626, c: [0x0B8A65, 0xD97706, 0xDC2626] },
  dark: { r: [0x7C8CFF, 0x9B7CFF, 0x5CC8FF, 0x7C8CFF, 0xB39BFF], bs: 0x7C8CFF, am: 0xFFB547, c: [0x5CE0A4, 0xFFB547, 0xFF6B6B] }
};

export function createScene(cv) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let r;
  try {
    r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  } catch (e) {
    return null;
  }
  const host = cv.parentNode;
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  cam.position.set(0, 0, 9);
  const g = new THREE.Group();
  g.position.x = 1.6;
  sc.add(g);

  const rings = [];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(1 + i * 0.5, 0.02 + i * 0.005, 12, 120),
      new THREE.MeshBasicMaterial({ color: PAL.light.r[i], transparent: true, opacity: 0.85 - i * 0.1 })
    );
    m.rotation.x = i * 0.4;
    m.rotation.y = i * 0.22;
    g.add(m);
    rings.push(m);
  }
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x0B8A65, wireframe: true });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), coreMat);
  g.add(core);

  const N = 900;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const th = [];
  const bs = new THREE.Color(PAL.light.bs);
  const am = new THREE.Color(PAL.light.am);
  function sp(i, far) {
    const a = Math.random() * 6.283;
    const rr = 1.6 + Math.random() * 7;
    pos[i * 3] = Math.cos(a) * rr;
    pos[i * 3 + 1] = Math.sin(a) * rr;
    pos[i * 3 + 2] = far ? -60 + Math.random() * 8 : -60 + Math.random() * 70;
    const t = Math.random() < 0.12;
    th[i] = t;
    const c = t ? am : bs;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  for (let k = 0; k < N; k++) sp(k, false);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false }));
  sc.add(pts);

  const target = new THREE.Color(0x0B8A65);
  let pl = 0, mx = 0, my = 0, cur = PAL.light, lv = 0;
  const tc = () => target.set(cur.c[lv >= 75 ? 2 : lv >= 50 ? 1 : 0]);

  const onMove = (e) => {
    const b = cv.getBoundingClientRect();
    mx = (e.clientX - b.left) / b.width - 0.5;
    my = (e.clientY - b.top) / b.height - 0.5;
  };
  host.addEventListener('pointermove', onMove);

  function size() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    r.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
    g.position.x = w > 500 ? 1.6 : 0;
  }
  const ro = new ResizeObserver(size);
  ro.observe(host);
  size();

  let t0 = performance.now(), raf = 0, alive = true;
  function f() {
    if (!alive) return;
    const dt = Math.min((performance.now() - t0) / 1000, 0.05);
    t0 = performance.now();
    coreMat.color.lerp(target, 0.06);
    pl *= 0.94;
    core.scale.setScalar(1 + pl * 0.9);
    if (!reduce) {
      rings.forEach((x, i) => { x.rotation.z += dt * (0.25 + i * 0.12) * (i % 2 ? -1 : 1); x.rotation.x += dt * 0.08; });
      core.rotation.y += dt * 0.8;
      core.rotation.x += dt * 0.5;
      const s = (12 + pl * 25) * dt;
      for (let i = 0; i < N; i++) {
        pos[i * 3 + 2] += s * (0.6 + (i % 7) / 7);
        if (th[i] && pos[i * 3 + 2] > -3 && pos[i * 3 + 2] < -2.4) {
          col[i * 3] = bs.r; col[i * 3 + 1] = bs.g; col[i * 3 + 2] = bs.b; th[i] = false;
        }
        if (pos[i * 3 + 2] > 9) sp(i, true);
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    }
    cam.position.x += (mx * 1.4 - cam.position.x) * 0.05;
    cam.position.y += (-my * 1 - cam.position.y) * 0.05;
    cam.lookAt(0, 0, -3);
    r.render(sc, cam);
    raf = requestAnimationFrame(f);
  }
  f();

  return {
    setRisk(v) { lv = v; tc(); },
    pulse() { pl = 1; },
    setTheme(t) {
      cur = PAL[t] || PAL.light;
      rings.forEach((m, i) => m.material.color.setHex(cur.r[i]));
      bs.setHex(cur.bs);
      am.setHex(cur.am);
      for (let i = 0; i < N; i++) {
        const c = th[i] ? am : bs;
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      geo.attributes.color.needsUpdate = true;
      tc();
    },
    dispose() {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      rings.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
      core.geometry.dispose(); coreMat.dispose();
      geo.dispose(); pts.material.dispose();
      r.dispose();
    }
  };
}
