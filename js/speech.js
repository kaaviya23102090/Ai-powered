// ─────────────────────────────────────────
//  speech.js  —  Text-to-Speech (Web Speech API)
// ─────────────────────────────────────────

const Speech = (() => {

  let voiceOn = true;

  function speak(text) {
    if (!voiceOn || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.0; u.volume = 1;
    u.onstart = () => {
      document.getElementById('sbars').classList.add('on');
      document.getElementById('dbars').classList.add('on');
    };
    u.onend = u.onerror = () => {
      document.getElementById('sbars').classList.remove('on');
      document.getElementById('dbars').classList.remove('on');
      Stats.increment('spoken');
    };
    speechSynthesis.speak(u);
  }

  function cancel() {
    speechSynthesis.cancel();
  }

  function toggleVoice() {
    voiceOn = !voiceOn;
    const btn = document.getElementById('voice-btn');
    btn.textContent = voiceOn ? '🔊 Voice' : '🔇 Muted';
    btn.style.color = voiceOn ? '' : 'var(--muted)';
    if (voiceOn) speak('Voice output enabled.');
  }

  function isEnabled() { return voiceOn; }

  return { speak, cancel, toggleVoice, isEnabled };

})();

// Global shorthand used across all modules
function toggleVoiceOut() { Speech.toggleVoice(); }
