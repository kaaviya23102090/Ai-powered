// ─────────────────────────────────────────
//  settings.js  —  App Settings Management
// ─────────────────────────────────────────

const Settings = (() => {

  const state = {
    speech:     true,
    obstacles:  true,
    continuous: false,
    ocr:        true,
  };

  function get(key) { return state[key]; }

  function toggle(key) {
    state[key] = !state[key];
    const isOn = state[key];
    const tile = document.getElementById('s-' + key);
    tile.classList.toggle('on', isOn);
    tile.querySelector('.ss').textContent = isOn ? 'On' : 'Off';
    tile.setAttribute('aria-checked', isOn);

    // If continuous mode changed while detecting, restart interval
    if (key === 'continuous') App.restartInterval();

    Speech.speak(key + (isOn ? ' enabled.' : ' disabled.'));
  }

  return { get, toggle };

})();

// Global handler called from HTML
function toggleSetting(key) { Settings.toggle(key); }
