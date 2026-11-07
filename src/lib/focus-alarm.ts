export function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.3, 0.6, 1.2, 1.5, 1.8].forEach((t, i) => {
      const o = ctx.createOscillator(); o.type = "square"; const g = ctx.createGain();
      o.frequency.value = i % 3 === 2 ? 1046 : 784; o.connect(g).connect(ctx.destination);
      g.gain.setValueAtTime(0.9, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.22);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.24);
    });
    setTimeout(() => ctx.close(), 2500);
  } catch { /* ignore */ }
}

