/* Pashto Pair Dialogues — admin screen logic (console.html and the demo).
 * AdminUI({ call(action, data), linkFor(key), refreshMs, onOpen?(session) })
 * Expects the console markup: #k-min #k-utt #k-todo #k-ses #cnt #note #create #newlinks #rows #refresh
 */
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s) => document.querySelector(s);

  window.AdminUI = function (o) {
    function copy(text, btn) {
      const done = () => { btn.textContent = 'Copied ✓'; setTimeout(() => { btn.textContent = 'Copy link'; }, 1500); };
      try { navigator.clipboard.writeText(text).then(done).catch(() => select(btn)); } catch (e) { select(btn); }
    }
    function select(btn) { const code = btn.closest('.lk') && btn.closest('.lk').querySelector('code'); if (code) { const r = document.createRange(); r.selectNodeContents(code); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } }

    function linkCard(ses, p, i) {
      const url = o.linkFor(p.key);
      const msg = 'Assalam o alaikum! Pashto recording ka link: ' + url + ' — Chrome mein kholein, apna naam likhein. Bolna Pashto mein hai.';
      const el = document.createElement('div'); el.className = 'lk';
      el.innerHTML = '<b>' + esc(ses.session_id) + ' · person ' + (i === 0 ? 'A' : 'B') + ' (' + esc(p.speaker_id) + ')</b><code>' + esc(url) + '</code>' +
        '<div class="actions"><button class="btn small cp">Copy link</button><a class="btn small" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(msg) + '">WhatsApp</a></div>';
      el.querySelector('.cp').onclick = (e) => copy(url, e.currentTarget);
      return el;
    }

    $('#create').onclick = async () => {
      $('#create').disabled = true;
      try {
        const r = await o.call('a_new_sessions', { count: Number($('#cnt').value), note: $('#note').value.trim() });
        const box = $('#newlinks'); box.innerHTML = '';
        r.sessions.forEach((s) => s.people.forEach((p, i) => box.appendChild(linkCard(s, p, i))));
        load();
      } catch (e) { $('#newlinks').innerHTML = '<div class="banner">' + esc(e.message) + '</div>'; }
      $('#create').disabled = false;
    };

    async function load() {
      try {
        const r = await o.call('a_overview'); const tb = $('#rows'); tb.innerHTML = '';
        let secs = 0, utts = 0, todo = 0;
        r.sessions.forEach((s) => {
          secs += s.secs; utts += s.utts; todo += s.todo;
          s.people.forEach((p, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = (i === 0 ? '<td rowspan="2"><b>' + esc(s.session_id) + '</b>' + (s.note ? '<div class="small">' + esc(s.note) + '</div>' : '') +
              (o.onOpen ? '<button class="btn small open">Open both phones</button>' : '') + '</td>' : '') +
              '<td>' + (p.name ? esc(p.name) : '<span class="small">name not entered yet</span>') + ' <span class="small">' + esc(p.speaker_id) + '</span></td>' +
              '<td><i class="dot' + (p.online ? ' on' : '') + '"></i>' + (p.online ? 'now' : '') + '</td>' +
              (i === 0 ? '<td class="n" rowspan="2">#' + s.dialogue + '</td><td class="n" rowspan="2">' + s.utts + '</td><td class="n" rowspan="2">' + (s.secs / 60).toFixed(1) + '</td>' : '') +
              '<td><button class="chipbtn cp">Copy link</button></td>';
            tr.querySelector('.cp').onclick = (e) => copy(o.linkFor(p.key), e.currentTarget);
            const op = tr.querySelector('.open'); if (op) op.onclick = () => o.onOpen(s);
            tb.appendChild(tr);
          });
        });
        if (!r.sessions.length) tb.innerHTML = '<tr><td colspan="7" class="small">No sessions yet — create one above.</td></tr>';
        $('#k-min').textContent = (secs / 60).toFixed(1); $('#k-utt').textContent = utts; $('#k-todo').textContent = todo; $('#k-ses').textContent = r.sessions.length;
      } catch (e) { $('#rows').innerHTML = '<tr><td colspan="7">' + esc(e.message) + '</td></tr>'; }
    }
    $('#refresh').onclick = load;
    load();
    if (o.refreshMs) setInterval(load, o.refreshMs);
    return { load: load };
  };
})();
