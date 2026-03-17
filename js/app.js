// ─────────────────────────────────────────
//  app.js  —  Main App Controller
// ─────────────────────────────────────────

const Stats = (() => {
  const s = { objs: 0, scans: 0, spoken: 0 };
  function increment(key, by = 1) {
    s[key] = (s[key] || 0) + by;
    const el = document.getElementById('st-' + key);
    if (el) el.textContent = s[key];
  }
  return { increment };
})();

const App = (() => {

  let model     = null;
  let detecting = false;
  let interval  = null;
  let lastDesc  = '';

  // ── Boot: load TF model ───────────────────
  async function init() {
    setStatus('loading', 'Loading COCO-SSD model — please wait…');
    try {
      model = await cocoSsd.load();
      setStatus('active', 'Model ready — press Start Detection');
      document.getElementById('start-btn').disabled = false;
      document.getElementById('btnlbl').textContent = 'Start Detection';
      Speech.speak('AI Vision Assistant ready. Press Start Detection to begin.');
    } catch (e) {
      setStatus('error', 'Model failed to load: ' + e.message);
    }
  }

  // ── Status bar helper ─────────────────────
  function setStatus(type, msg) {
    document.getElementById('sdot').className = 'sdot ' + type;
    document.getElementById('status-msg').textContent = msg;
  }

  // ── Detection loop ────────────────────────
  async function runDetection() {
    if (!model || !detecting) return;
    const desc = await Detection.run(model);
    if (desc) lastDesc = desc;
  }

  // ── Toggle detection on/off ───────────────
  async function toggleDetection() {
    if (!model) return;

    if (!detecting) {
      const ok = await Camera.start();
      if (!ok) return;

      detecting = true;
      document.getElementById('start-btn').classList.add('stp');
      document.getElementById('btnlbl').textContent = 'Stop Detection';
      document.getElementById('rdot').classList.add('on');
      setStatus('active', 'Detecting objects in real time…');

      await runDetection();
      interval = setInterval(runDetection, Settings.get('continuous') ? 1000 : 3000);

    } else {
      clearInterval(interval);
      detecting = false;
      Camera.stop();

      document.getElementById('start-btn').classList.remove('stp');
      document.getElementById('btnlbl').textContent = 'Start Detection';
      document.getElementById('rdot').classList.remove('on');
      document.getElementById('obs-alert').classList.remove('show');
      document.getElementById('chips-grid').innerHTML =
        '<span style="font-size:12px;color:var(--muted)">Objects will appear here</span>';
      document.getElementById('scene-desc').innerHTML =
        '<span class="dph">Detection stopped.</span>';
      document.getElementById('obj-count').textContent = '0 objects';

      setStatus('active', 'Detection stopped — ready');
      Speech.speak('Detection stopped.');
    }
  }

  // ── Restart interval (called by Settings) ─
  function restartInterval() {
    if (!detecting) return;
    clearInterval(interval);
    interval = setInterval(runDetection, Settings.get('continuous') ? 1000 : 3000);
  }

  function isDetecting() { return detecting; }
  function getLastDesc() { return lastDesc; }

  // ── Start the app ─────────────────────────
  window.addEventListener('DOMContentLoaded', init);

  return { setStatus, toggleDetection, restartInterval, isDetecting, getLastDesc };

})();

// Global handler called from HTML
function toggleDetection() { App.toggleDetection(); }
