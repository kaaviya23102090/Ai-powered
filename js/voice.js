// ─────────────────────────────────────────
//  voice.js  —  Voice Recognition (Web Speech API)
// ─────────────────────────────────────────

const Voice = (() => {

  let rec    = null;
  let active = false;

  function toggle() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      Speech.speak('Voice recognition is not supported. Please use Chrome or Edge.');
      return;
    }

    if (active) {
      rec?.stop();
      rec = null; active = false;
      document.getElementById('mic-btn').textContent = 'Enable Mic';
      document.getElementById('mic-btn').classList.remove('on');
      document.getElementById('vtx').textContent = 'Microphone disabled.';
      return;
    }

    rec = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = e => {
      const r = e.results[e.results.length - 1];
      const t = r[0].transcript.toLowerCase().trim();
      document.getElementById('vtx').textContent = '🎤 "' + t + '"';
      if (r.isFinal) handleCommand(t);
    };

    rec.onerror = () => {
      document.getElementById('vtx').textContent = 'Listening for commands…';
    };

    // Auto-restart keeps mic always on
    rec.onend = () => { if (active) rec.start(); };

    rec.start();
    active = true;
    document.getElementById('mic-btn').textContent = 'Disable Mic';
    document.getElementById('mic-btn').classList.add('on');
    document.getElementById('vtx').textContent = 'Listening for commands…';
    Speech.speak('Microphone enabled. Listening for commands.');
  }

  function handleCommand(cmd) {
    if      (cmd.includes('start') && !App.isDetecting())  App.toggleDetection();
    else if (cmd.includes('stop')  &&  App.isDetecting())  App.toggleDetection();
    else if (cmd.includes('read')  || cmd.includes('scan')) OCR.capture();
    else if (cmd.includes('describe') || cmd.includes('what') || cmd.includes('see')) {
      const d = App.getLastDesc();
      d ? Speech.speak(d) : Speech.speak('Detection is not active yet.');
    }
    else if (cmd.includes('repeat')) {
      const d = App.getLastDesc();
      d ? Speech.speak(d) : Speech.speak('Nothing to repeat yet.');
    }
    else if (cmd.includes('mute'))   { /* disable voice silently */
      // Can't use speak to confirm mute — just disable
      speechSynthesis.cancel();
      // Speech module still works, just reflect state via voiceOn flag
    }
    else if (cmd.includes('unmute')) {
      Speech.speak('Voice enabled.');
    }
  }

  return { toggle };

})();

// Global handler called from HTML
function toggleVoiceRec() { Voice.toggle(); }
