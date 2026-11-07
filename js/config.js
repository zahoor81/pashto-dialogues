// Pashto Pair Dialogues — settings.
// Paste the Apps Script Web-app URL here after deploying the backend (see SETUP.md).
window.PP_CONFIG = {
  API_URL: '',               // e.g. 'https://script.google.com/macros/s/AKfy.../exec'
  POLL_MS: 2500,             // how often each phone checks whose turn it is
  MAX_TURN_S: 180,           // one recording is cut at 3 min; the speaker can carry on with a new part
  TARGET_USER_MIN: 300       // dataset goal: 5 h of USER-side speech
};

// Talks to the backend. Plain-text POST avoids a CORS pre-flight with Apps Script.
window.ppCall = async function (action, data) {
  const C = window.PP_CONFIG;
  if (!C.API_URL) throw new Error('Platform abhi connect nahi hua (js/config.js mein API_URL khali hai).');
  let last = null;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(C.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action: action }, data || {})) });
      const j = await r.json();
      if (!j.ok) { const e = new Error(j.error || 'Server error'); e.server = true; throw e; }
      return j;
    } catch (e) { if (e.server) throw e; last = e; await new Promise((r) => setTimeout(r, 700 * (i + 1))); }
  }
  throw new Error('Internet connection nahi. Check karke dobara koshish karein.');
};
