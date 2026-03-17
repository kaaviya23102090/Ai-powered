// ─────────────────────────────────────────
//  ocr.js  —  Text Recognition (Tesseract.js)
// ─────────────────────────────────────────

const OCR = (() => {

  async function capture() {
    if (!Settings.get('ocr')) {
      Speech.speak('OCR is disabled in settings.'); return;
    }
    if (!Camera.isReady()) {
      Speech.speak('Please start the camera first.'); return;
    }

    const video = Camera.getVideo();
    document.getElementById('ocr-status').textContent = 'Scanning…';
    document.getElementById('ocr-out').innerHTML =
      '<span style="color:var(--teal);font-size:12px">🔍 Scanning for text…</span>';
    document.getElementById('ocr-prog').classList.add('show');
    document.getElementById('ocr-pf').style.width = '0%';
    Speech.speak('Scanning for text. Please hold still.');

    // Capture current video frame to a temp canvas
    const tmp = document.createElement('canvas');
    tmp.width  = video.videoWidth  || 640;
    tmp.height = video.videoHeight || 480;
    tmp.getContext('2d').drawImage(video, 0, 0);

    try {
      const result = await Tesseract.recognize(tmp, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            document.getElementById('ocr-pf').style.width =
              Math.round((m.progress || 0) * 100) + '%';
          }
        },
      });

      document.getElementById('ocr-prog').classList.remove('show');
      const text = result.data.text.trim();
      const conf = Math.round(result.data.confidence);

      if (text && text.length > 2) {
        document.getElementById('ocr-out').textContent = text;
        document.getElementById('ocr-status').textContent = `Found · ${conf}% confidence`;
        if (Settings.get('speech')) Speech.speak('Text detected: ' + text);
      } else {
        document.getElementById('ocr-out').innerHTML =
          '<span style="color:var(--muted);font-size:12px">No readable text found in this view.</span>';
        document.getElementById('ocr-status').textContent = 'No text found';
        Speech.speak('No readable text was found in the current view.');
      }
    } catch (e) {
      document.getElementById('ocr-prog').classList.remove('show');
      document.getElementById('ocr-out').innerHTML =
        `<span style="color:var(--danger);font-size:12px">OCR error: ${e.message}</span>`;
      document.getElementById('ocr-status').textContent = 'Error';
      Speech.speak('Text scanning failed. Please try again.');
    }
  }

  function speakResult() {
    const text = document.getElementById('ocr-out').textContent.trim();
    const skip = ['Scanning', 'Press', 'No readable', 'OCR error'];
    if (text && text.length > 3 && !skip.some(s => text.includes(s))) {
      Speech.speak(text);
    } else {
      Speech.speak('No text has been scanned yet. Use Scan Text to capture text first.');
    }
  }

  return { capture, speakResult };

})();

// Global handlers called from HTML
function captureOCR() { OCR.capture(); }
function speakOCR()   { OCR.speakResult(); }
