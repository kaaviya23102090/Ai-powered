// ─────────────────────────────────────────
//  detection.js  —  TensorFlow.js + COCO-SSD
// ─────────────────────────────────────────

const Detection = (() => {

  const OBSTACLES = new Set([
    'person','car','bicycle','motorcycle','truck','bus','cat','dog','horse',
    'bear','elephant','zebra','giraffe','cow','traffic light','stop sign',
    'chair','couch','bed','dining table','toilet','potted plant','bench',
  ]);

  const POSITIONS = ['on your left','ahead of you','on your right','slightly left','slightly right','directly in front'];
  const DISTANCES = ['very close','nearby','a few steps away','in the distance'];
  const pick = a  => a[Math.floor(Math.random() * a.length)];

  const ICONS = {
    person:'🧍', car:'🚗', bicycle:'🚲', motorcycle:'🏍', dog:'🐕', cat:'🐈',
    chair:'🪑', cup:'☕', bottle:'🧴', book:'📚', cell_phone:'📱',
    laptop:'💻', tv:'📺', clock:'🕐', fork:'🍴', apple:'🍎', banana:'🍌',
    orange:'🍊', pizza:'🍕', truck:'🚛', bus:'🚌', 'traffic light':'🚦',
    'stop sign':'🛑', umbrella:'☂️', handbag:'👜', suitcase:'🧳', bird:'🐦',
    horse:'🐴', cow:'🐄', elephant:'🐘', bear:'🐻', backpack:'🎒',
    couch:'🛋', bed:'🛏', 'potted plant':'🌿', vase:'🏺', scissors:'✂️',
  };
  const ico = c => ICONS[c] || '📦';

  // ── Draw bounding boxes on canvas ──────────
  function drawBoxes(preds) {
    const video  = Camera.getVideo();
    const canvas = Camera.getCanvas();
    Camera.resizeCanvas();
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    preds.forEach(p => {
      const [x, y, w, h] = p.bbox;
      const isObs = OBSTACLES.has(p.class);
      const col   = isObs ? '#ff4f6a' : '#3d9eff';

      // Bounding box
      ctx.strokeStyle = col; ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Corner brackets
      const sz = 13; ctx.lineWidth = 3;
      [[x,y],[x+w-sz,y],[x,y+h-sz],[x+w-sz,y+h-sz]].forEach(([cx,cy]) => {
        ctx.beginPath();
        ctx.moveTo(cx+sz,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+sz);
        ctx.stroke();
      });

      // Label pill
      const lbl = `${p.class}  ${Math.round(p.score*100)}%`;
      ctx.font = '11px "DM Sans", sans-serif';
      const tw = ctx.measureText(lbl).width;
      const lx = Math.max(0, x);
      const ly = y > 26 ? y - 24 : y + h + 4;
      ctx.fillStyle = isObs ? 'rgba(255,79,106,.9)' : 'rgba(61,158,255,.9)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(lx, ly, tw+14, 20, 5);
      else ctx.rect(lx, ly, tw+14, 20);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillText(lbl, lx+7, ly+14);
    });
  }

  // ── Render object chips ─────────────────────
  function renderChips(valid) {
    const obs = valid.filter(p => OBSTACLES.has(p.class));
    const al  = document.getElementById('obs-alert');

    if (obs.length && Settings.get('obstacles')) {
      al.classList.add('show');
      document.getElementById('oat').textContent =
        `⚠ ${obs.map(o => o.class).join(', ')} — adjust your path`;
    } else {
      al.classList.remove('show');
    }

    document.getElementById('obj-count').textContent =
      valid.length + ' object' + (valid.length !== 1 ? 's' : '');

    const grid = document.getElementById('chips-grid');
    if (!valid.length) {
      grid.innerHTML = '<span style="font-size:12px;color:var(--muted)">No objects in this frame</span>';
      return;
    }

    grid.innerHTML = valid.map(p => {
      const isObs = OBSTACLES.has(p.class);
      const conf  = Math.round(p.score * 100);
      const pos   = getPosition(p.bbox);
      return `<div class="chip ${isObs ? 'obs' : ''}" title="${conf}% · ${pos}">
        <span class="cicon">${ico(p.class)}</span>
        <span>${p.class}</span>
        <span class="cpos">${pos}</span>
        <div class="ccnf"><div class="ccf" style="width:${conf}%"></div></div>
      </div>`;
    }).join('');
  }

  function getPosition([x,,w]) {
    const cx = x + w / 2;
    const vw = Camera.getVideo().videoWidth || 640;
    return cx < vw * .33 ? '← left' : cx > vw * .66 ? '→ right' : '↑ center';
  }

  // ── Build spoken scene description ──────────
  function buildDescription(valid) {
    if (!valid.length) return 'The path ahead appears clear. No objects detected.';
    const parts = valid.slice(0, 5).map(p =>
      `a ${p.class} ${pick(DISTANCES)} ${pick(POSITIONS)}`
    );
    let desc = 'In front of you: ' + parts.join('; ') + '.';
    if (Settings.get('obstacles')) {
      const obs = valid.filter(p => OBSTACLES.has(p.class));
      if (obs.length) {
        desc += ` Warning: ${obs.map(o => o.class).join(', ')} detected. Please proceed with caution.`;
      }
    }
    return desc;
  }

  // ── Main detection run ──────────────────────
  async function run(model) {
    const video = Camera.getVideo();
    if (!model || video.readyState < 2) return null;

    const preds = await model.detect(video);
    const valid = preds.filter(p => p.score >= 0.45);

    drawBoxes(valid);
    renderChips(valid);

    const desc = buildDescription(valid);
    document.getElementById('scene-desc').textContent = desc;

    if (Settings.get('speech')) Speech.speak(desc);

    Stats.increment('objs', valid.length);
    Stats.increment('scans');

    return desc;
  }

  return { run, renderChips, buildDescription, OBSTACLES };

})();
