(() => {
  const canvas = document.querySelector('.globe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0; let height = 0; let dpr = Math.max(1, window.devicePixelRatio || 1);
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.floor(rect.width);
    height = Math.floor(rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // --------- 2D Digital World Map with Shipping Routes ---------
  const mapPadding = { l: 32, r: 32, t: 24, b: 24 };
  const mapRect = () => ({ x: mapPadding.l, y: mapPadding.t, w: width - mapPadding.l - mapPadding.r, h: height - mapPadding.t - mapPadding.b });
  function lonLatToXY(lon, lat) {
    const r = mapRect();
    const x = r.x + (lon + 180) / 360 * r.w;
    const y = r.y + (90 - lat) / 180 * r.h;
    return { x, y };
  }

  const ports = [
    { name: '上海', lat: 31.23, lon: 121.47 },
    { name: '宁波', lat: 29.87, lon: 121.55 },
    { name: '深圳', lat: 22.54, lon: 114.06 },
    { name: '新加坡', lat: 1.29, lon: 103.85 },
    { name: '鹿特丹', lat: 51.92, lon: 4.48 },
    { name: '汉堡', lat: 53.55, lon: 9.99 },
    { name: '洛杉矶', lat: 34.05, lon: -118.24 },
    { name: '长滩', lat: 33.77, lon: -118.19 },
    { name: '纽约', lat: 40.71, lon: -74.01 },
    { name: '比雷埃夫斯', lat: 37.94, lon: 23.65 },
    { name: '釜山', lat: 35.18, lon: 129.07 },
    { name: '迪拜', lat: 25.26, lon: 55.30 },
    { name: '科伦坡', lat: 6.93, lon: 79.85 },
    { name: '丹戎帕拉帕斯', lat: 1.37, lon: 103.55 },
    { name: '安特卫普', lat: 51.22, lon: 4.40 }
  ];

  // Construct many shipping routes (hub-based)
  const hubIdx = {
    CN: [0,1,2], SG: [3,13], EU: [4,5,14,9], US: [6,7,8], ME: [11], AS: [10,12]
  };
  const idx = (i) => ports[i];
  let routePairs = [];
  // China hubs to SG/ME/EU/US
  hubIdx.CN.forEach(a => { [...hubIdx.SG, ...hubIdx.ME, ...hubIdx.EU, ...hubIdx.US].forEach(b => routePairs.push([a,b])); });
  // SG to EU/US/AS
  [...hubIdx.SG].forEach(a => { [...hubIdx.EU, ...hubIdx.US, ...hubIdx.AS].forEach(b => routePairs.push([a,b])); });
  // EU to US
  hubIdx.EU.forEach(a => { hubIdx.US.forEach(b => routePairs.push([a,b])); });

  // reduce number of routes (keep ~55%)
  const FRACTION = 0.55;
  const keepCount = Math.max(1, Math.floor(routePairs.length * FRACTION));
  routePairs = routePairs.slice(0, keepCount);

  function quadPoint(p0, p1, t, curveK = 0.18) {
    // Control point elevated towards north for curvature
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    const dx = p1.x - p0.x; const dy = p1.y - p0.y;
    // Perpendicular normal (upwards visually -> negative y)
    const nx = -dy; const ny = dx;
    const len = Math.hypot(nx, ny) || 1;
    const k = curveK * Math.min(240, Math.hypot(dx, dy));
    const cx = mx + nx / len * k;
    const cy = my + ny / len * k * 0.6; // slightly less vertical
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * cx + t * t * p1.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * cy + t * t * p1.y;
    return { x, y };
  }

  function sampleRoute(a, b) {
    const p0 = lonLatToXY(a.lon, a.lat); const p1 = lonLatToXY(b.lon, b.lat);
    const steps = 80; const pts = new Array(steps);
    for (let i = 0; i < steps; i++) pts[i] = quadPoint(p0, p1, i/(steps-1));
    return pts;
  }

  let routes = [];
  function rebuildRoutes() {
    routes = routePairs.map(([ia, ib]) => {
      const a = idx(ia), b = idx(ib);
      return {
        from: a.name, to: b.name,
        pts: sampleRoute(a, b),
        movers: Array.from({ length: 2 }, (_, i) => ({ p: Math.random(), speed: 0.002 + Math.random()*0.0025 }))
      };
    });
  }
  rebuildRoutes();
  window.addEventListener('resize', rebuildRoutes);

  function drawGrid() {
    const r = mapRect();
    // ocean panel background
    const bg = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
    bg.addColorStop(0, 'rgba(10,33,58,0.9)');
    bg.addColorStop(1, 'rgba(7,20,35,0.92)');
    ctx.fillStyle = bg;
    ctx.fillRect(r.x, r.y, r.w, r.h);

    // graticule
    ctx.strokeStyle = 'rgba(180,210,240,0.06)';
    ctx.lineWidth = 1;
    for (let lat = -75; lat <= 75; lat += 15) {
      const y = lonLatToXY(0, lat).y; // use mapping for y
      ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x + r.w, y); ctx.stroke();
    }
    for (let lon = -180; lon <= 180; lon += 15) {
      const x = lonLatToXY(lon, 0).x;
      ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke();
    }

    // border glow
    ctx.strokeStyle = 'rgba(34,211,238,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
  }

  // ---------- Real world map (countries) overlay ----------
  let worldTopo = null; let worldFeatures = null; let worldMesh = null;
  let worldLayer = null; // offscreen canvas

  function ensureWorldLib() {
    return new Promise((resolve, reject) => {
      if (window.topojson) return resolve();
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/topojson-client@3/dist/topojson-client.min.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function loadWorldData() {
    await ensureWorldLib();
    const res = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json');
    worldTopo = await res.json();
    worldFeatures = window.topojson.feature(worldTopo, worldTopo.objects.countries);
    worldMesh = window.topojson.mesh(worldTopo, worldTopo.objects.countries, (a,b) => a !== b);
    rebuildWorldLayer();
  }

  function rebuildWorldLayer() {
    if (!worldFeatures) return;
    // create/reuse offscreen
    const r = mapRect();
    worldLayer = document.createElement('canvas');
    worldLayer.width = Math.max(1, Math.floor(width));
    worldLayer.height = Math.max(1, Math.floor(height));
    const g = worldLayer.getContext('2d');
    g.setTransform(1,0,0,1,0,0);
    // draw countries
    g.save();
    g.beginPath();
    for (const feat of worldFeatures.features) {
      const geom = feat.geometry;
      if (!geom) continue;
      if (geom.type === 'Polygon') drawPolygon(g, geom.coordinates);
      else if (geom.type === 'MultiPolygon') {
        for (const poly of geom.coordinates) drawPolygon(g, poly);
      }
    }
    g.fillStyle = 'rgba(70, 170, 220, 0.22)';
    g.fill('evenodd');
    g.restore();

    // country borders
    if (worldMesh) {
      g.save();
      g.beginPath();
      drawMultiLineString(g, worldMesh.coordinates);
      g.strokeStyle = 'rgba(200, 230, 255, 0.35)';
      g.lineWidth = 0.8;
      g.stroke();
      g.restore();
    }

    function drawPolygon(gc, rings) {
      for (const ring of rings) {
        if (!ring.length) continue;
        const p0 = lonLatToXY(ring[0][0], ring[0][1]);
        gc.moveTo(p0.x, p0.y);
        for (let i=1;i<ring.length;i++) {
          const p = lonLatToXY(ring[i][0], ring[i][1]);
          gc.lineTo(p.x, p.y);
        }
        gc.closePath();
      }
    }
    function drawMultiLineString(gc, lines) {
      for (const line of lines) {
        if (!line.length) continue;
        const p0 = lonLatToXY(line[0][0], line[0][1]);
        gc.moveTo(p0.x, p0.y);
        for (let i=1;i<line.length;i++) {
          const p = lonLatToXY(line[i][0], line[i][1]);
          gc.lineTo(p.x, p.y);
        }
      }
    }
  }

  window.addEventListener('resize', () => { if (worldFeatures) rebuildWorldLayer(); });
  loadWorldData().catch(() => {/* ignore fetch errors */});

  function drawPorts() {
    for (const p of ports) {
      const pt = lonLatToXY(p.lon, p.lat);
      ctx.fillStyle = 'rgba(96,239,255,0.85)';
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(96,239,255,0.15)';
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 8, 0, Math.PI*2); ctx.fill();
    }
  }

  function drawRoutes(elapsed) {
    ctx.lineWidth = 1.5;
    for (const r of routes) {
      // route line
      ctx.strokeStyle = 'rgba(79,243,255,0.45)';
      ctx.beginPath();
      const pts = r.pts;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();

      // moving dots
      for (const m of r.movers) {
        m.p += m.speed; if (m.p > 1) m.p -= 1;
        const idxF = m.p * (pts.length-1);
        const i0 = Math.floor(idxF), i1 = Math.min(pts.length-1, i0+1);
        const t = idxF - i0;
        const x = pts[i0].x + (pts[i1].x - pts[i0].x)*t;
        const y = pts[i0].y + (pts[i1].y - pts[i0].y)*t;
        ctx.fillStyle = 'rgba(79,243,255,0.9)';
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'rgba(79,243,255,0.18)';
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  function loop(ts) {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    if (worldLayer) ctx.drawImage(worldLayer, 0, 0);
    drawRoutes(ts);
    drawPorts();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  // Charts
  const $yearly = document.getElementById('chart-yearly');
  const $monthly = document.getElementById('chart-monthly');

  function resizeChart(cnv) {
    if (!cnv) return;
    const r = cnv.getBoundingClientRect();
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    cnv.width = Math.floor(r.width * ratio);
    cnv.height = Math.floor(r.height * ratio);
    const c = cnv.getContext('2d');
    c.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawBarChart(cnv, labels, values, opts = {}) {
    if (!cnv) return;
    resizeChart(cnv);
    const c = cnv.getContext('2d');
    const w = cnv.clientWidth, h = cnv.clientHeight;
    const padding = { t: 12, r: 8, b: 26, l: 32 };
    const innerW = w - padding.l - padding.r;
    const innerH = h - padding.t - padding.b;
    c.clearRect(0, 0, w, h);

    // axes
    c.strokeStyle = 'rgba(8,64,110,0.25)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(padding.l, padding.t);
    c.lineTo(padding.l, padding.t + innerH);
    c.lineTo(padding.l + innerW, padding.t + innerH);
    c.stroke();

    const maxVal = Math.max(1, Math.max(...values) * 1.12);
    const barCount = values.length;
    const gap = 8;
    const barW = Math.max(8, (innerW - gap * (barCount - 1)) / barCount);

    // animate
    const start = performance.now();
    const dur = 800;

    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      c.clearRect(padding.l + 1, padding.t - 1, innerW - 1, innerH + 2);

      // grid
      const gridLines = 4;
      c.strokeStyle = 'rgba(8,64,110,0.10)';
      c.lineWidth = 1;
      for (let i = 1; i <= gridLines; i++) {
        const y = padding.t + innerH - (innerH * i / gridLines);
        c.beginPath(); c.moveTo(padding.l, y); c.lineTo(padding.l + innerW, y); c.stroke();
      }

      // bars
      for (let i = 0; i < barCount; i++) {
        const x = padding.l + i * (barW + gap);
        const val = values[i] * t;
        const hVal = Math.max(0, (val / maxVal) * innerH);
        const y = padding.t + innerH - hVal;
        const grad = c.createLinearGradient(0, y, 0, y + hVal);
        grad.addColorStop(0, opts.colorTop || '#22d3ee');
        grad.addColorStop(1, opts.colorBottom || '#0ea5ff');
        c.fillStyle = grad;
        c.fillRect(x, y, barW, hVal);
        // glow
        c.fillStyle = 'rgba(14,165,255,0.15)';
        c.fillRect(x, y - 6, barW, 6);

        // label
        c.fillStyle = '#08406e';
        c.font = '12px Titillium Web, Arial, sans-serif';
        c.textAlign = 'center';
        c.fillText(labels[i], x + barW / 2, padding.t + innerH + 16);
      }

      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // sample data
  const yearlyLabels = ['2019','2020','2021','2022','2023','2024','2025'];
  const yearlyValues = [1020, 980, 1250, 1180, 1310, 1390, 720]; // 2025 YTD

  const monthLabels = ['1','2','3','4','5','6','7','8','9','10'].map(m => `${m}月`);
  const monthValues = [82, 95, 103, 116, 124, 133, 141, 147, 155, 162]; // 示例：仅至10月

  function renderCharts() {
    drawBarChart($yearly, yearlyLabels, yearlyValues, { colorTop: '#60efff', colorBottom: '#0ea5ff' });
    drawBarChart($monthly, monthLabels, monthValues, { colorTop: '#a5f3fc', colorBottom: '#22d3ee' });
  }

  window.addEventListener('resize', renderCharts);
  renderCharts();

  // Realtime clock
  const clockEl = document.getElementById('track-clock');
  function formatClock() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }
  function tickClock() {
    if (clockEl) clockEl.textContent = formatClock();
  }
  tickClock();
  setInterval(tickClock, 1000);
})();


