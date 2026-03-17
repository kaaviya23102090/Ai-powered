// ─────────────────────────────────────────
//  camera.js  —  Camera stream management
// ─────────────────────────────────────────

const Camera = (() => {

  let stream = null;
  const video  = () => document.getElementById('video');
  const canvas = () => document.getElementById('canvas');

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      const v = video();
      v.srcObject = stream;
      await v.play();
      v.classList.remove('hidden');
      document.getElementById('cam-ph').classList.add('hidden');
      document.getElementById('live-badge').classList.add('show');
      document.getElementById('scan-line').classList.add('run');
      v.addEventListener('loadedmetadata', resizeCanvas, { once: true });
      return true;
    } catch (e) {
      App.setStatus('error', 'Camera denied: ' + e.message);
      Speech.speak('Camera access was denied. Please allow camera permission and try again.');
      return false;
    }
  }

  function stop() {
    stream?.getTracks().forEach(t => t.stop());
    stream = null;
    const v = video();
    v.srcObject = null;
    v.classList.add('hidden');
    document.getElementById('cam-ph').classList.remove('hidden');
    document.getElementById('live-badge').classList.remove('show');
    document.getElementById('scan-line').classList.remove('run');
    const ctx = canvas().getContext('2d');
    ctx.clearRect(0, 0, canvas().width, canvas().height);
  }

  function resizeCanvas() {
    const v = video();
    const c = canvas();
    c.width  = v.videoWidth  || 640;
    c.height = v.videoHeight || 480;
  }

  function isReady() {
    return stream && video().readyState >= 2;
  }

  function getVideo()  { return video(); }
  function getCanvas() { return canvas(); }
  function getStream() { return stream; }

  return { start, stop, resizeCanvas, isReady, getVideo, getCanvas, getStream };

})();
