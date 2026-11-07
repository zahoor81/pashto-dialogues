/* Pashto Pair Dialogues — the phone screen (index.html and the demo).
 * All on-screen text is Roman Urdu; speakers always speak Pashto.
 *
 * new PhoneUI(root, transport, options)
 *   transport: join(), poll(), setName(name), upload({d,t,p,q,n,keep,meta,b64,url}), nextQ({d,q}), finish({d,status,...})
 *              each resolves to { state }; join() also gives { me: 'a'|'b', session_id, speaker_id }
 *   state:     { d, t, p, q, qt, secs, a_name, b_name, a_online, b_online }
 *   options:   { allowFake, pollMs, maxTurnS }
 */
(function () {
  'use strict';
  const SC = window.PP_SCEN;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mins = (s) => (s / 60).toFixed(0);

  class PhoneUI {
    constructor(root, transport, opts) {
      this.root = root; this.tp = transport;
      this.o = Object.assign({ allowFake: false, pollMs: 2500, maxTurnS: 180 }, opts || {});
      this.rec = new PDRec.PDRecorder();
      this.take = null; this.busy = false; this.stopped = false; this.ask = null; this.mode = 'idle'; this.flashUntil = 0;
      root.classList.add('pp');
      root.innerHTML = '<div class="pp-top"><div class="who"><b class="me">…</b><span class="pt"></span></div><span class="clock small"></span></div><div class="pp-body"><div class="spin"></div></div><div class="pp-ctl" hidden></div>';
      this.$body = root.querySelector('.pp-body'); this.$ctl = root.querySelector('.pp-ctl');
      this.start();
    }

    async start() {
      try {
        const j = await this.tp.join();
        this.me = j.me; this.session = j.session_id; this.queue = SC.buildQueue(this.session);
        this.apply(j.state, true); this.loop();
      } catch (e) { this.error(e.message); }
    }
    async loop() {
      while (!this.dead) {
        await new Promise((r) => setTimeout(r, this.o.pollMs));
        if (this.dead || this.stopped || this.busy || this.mode !== 'idle') continue;
        try { this.apply((await this.tp.poll()).state); } catch (e) { /* retry next time */ }
      }
    }
    destroy() { this.dead = true; this.rec.close(); }
    error(msg) {
      this.$ctl.hidden = true;
      this.$body.innerHTML = '<div class="panel"><h2>Masla aa gaya</h2><p>' + esc(msg) + '</p><button class="btn primary">Dobara koshish</button></div>';
      this.$body.querySelector('button').onclick = () => location.reload();
    }

    pName(s) { return s[(this.me === 'a' ? 'b' : 'a') + '_name']; }
    pOnline(s) { return !!s[(this.me === 'a' ? 'b' : 'a') + '_online']; }

    apply(s, force) {
      if (!s) return;
      const key = JSON.stringify([s.d, s.t, s.p, s.q, s.a_name, s.b_name, s.a_online, s.b_online, Math.floor((s.secs || 0) / 60)]);
      if (!force && key === this.lastKey) return;
      this.lastKey = key;
      const prev = this.s; this.s = s;
      if (prev && prev.d !== s.d) { this.flashUntil = Date.now() + 3500; this.take = null; this.ask = null; this.mode = 'idle'; setTimeout(() => { if (this.mode === 'idle') this.render(); }, 3600); }
      const me = s[this.me + '_name'];
      this.root.querySelector('.me').textContent = me || 'Naya speaker';
      const pn = this.pName(s);
      this.root.querySelector('.pt').innerHTML = '<i class="dot' + (this.pOnline(s) ? ' on' : '') + '"></i>' + (pn ? 'Partner: ' + esc(pn) : 'Partner ka intezar') + (this.pOnline(s) ? '' : ' (offline)');
      this.root.querySelector('.clock').textContent = '🎙️ ' + mins(s.secs || 0) + ' min';
      // While this person is typing their name, never redraw the name screen (it would wipe what they typed).
      if (!s[this.me + '_name'] && this.onNameScreen) return;
      if (this.mode === 'idle') this.render();
    }

    current() {
      const s = this.s; const it = this.queue[Math.min(s.d, this.queue.length - 1)];
      const inst = SC.buildInstance(this.session, it.scenario_id, it.round);
      const step = SC.stepFor(inst, s.d, s.t, s.q || 0, s.qt || 0);
      const myRole = SC.userOf(s.d) === this.me ? 'user' : 'assistant';
      let next = null;
      if (step.owner !== this.me) next = SC.stepFor(inst, s.d, s.t + 1, s.q || 0, s.qt || 0);
      if (next && next.owner !== this.me) next = null;
      return { inst: inst, step: step, mine: step.owner === this.me, myRole: myRole, next: next };
    }

    render() {
      const s = this.s;
      this.onNameScreen = false;
      if (this.stopped) return this.renderStopped();
      if (!s[this.me + '_name']) { this.onNameScreen = true; return this.renderName(); }
      const c = this.current(), inst = c.inst;
      const isConv = inst.type === 'conv';
      let h = '';
      if (Date.now() < this.flashUntil) h += '<div class="flash">✓ Mukammal! Agla hissa neeche hai.</div>';
      if (!this.pOnline(s)) h += '<div class="banner">Partner abhi connected nahi. Unhein apna link kholne ka kahein.</div>';
      h += '<div class="lang">🗣️ Yaad rakhein: hamesha <b>Pashto</b> mein bolein</div>';
      h += '<div class="dlg-head"><span class="badge">' + (isConv ? 'Guftagu' : 'Kaam') + ' #' + (s.d + 1) + '</span><span class="ttl">' + esc(inst.title.ru) + '</span>' +
        (c.myRole === 'user' ? '<span class="role user">🙋 Aap: User</span>' : '<span class="role phone">📱 Aap: Phone</span>') + '</div>';
      if (isConv) h += '<div class="small">Sawal ' + Math.min((s.q || 0) + 1, inst.questions.length) + ' / ' + inst.questions.length + ' · baari ' + (s.t + 1) + (s.p ? ' (hissa ' + (s.p + 1) + ')' : '') + '</div>';
      else h += '<div class="dots">' + inst.steps.map((st, i) => '<i class="' + (st.role === 'user' ? 'u' : 'a') + (i < s.t ? ' done' : '') + (i === s.t ? ' cur' : '') + '"></i>').join('') + '</div>';
      if (c.mine) {
        h += this.cardHtml(c.step, false);
        if (isConv && c.step.role === 'assistant' && s.t > 0 && (s.q || 0) < inst.questions.length) {
          h += '<button class="btn nextq">' + ((s.q || 0) + 1 < inst.questions.length ? 'Agla sawal ▸' : 'Saare sawal ho gaye ▸') + '</button>';
        }
        h += '<p class="hint">Apne alfaaz mein, Pashto mein bolein</p>';
      } else {
        h += '<div class="listen"><span class="ear">🎧</span><div><b>Partner bol rahe hain — suniye</b><div class="small">Un ki baat ke baad aap ki baari aayegi</div></div><span class="wave"><i></i><i></i><i></i><i></i></span></div>';
        if (c.next) h += this.cardHtml(c.next, true);
      }
      this.$body.innerHTML = h;
      const nq = this.$body.querySelector('.nextq');
      if (nq) nq.onclick = async () => { nq.disabled = true; try { this.apply((await this.tp.nextQ({ d: s.d, q: s.q || 0 })).state, true); } catch (e) { note(this.$body, e.message); } };
      this.renderCtl(c);
    }

    cardHtml(step, dim) {
      const cls = step.role === 'user' ? 'user' : 'phone';
      const lab = dim ? 'Aap ka agla card' : (step.role === 'user' ? 'Aap ka maqsad' : 'Aap phone hain');
      const facts = step.chips.map((f) => '<span class="fact' + (f.wrong ? ' wrong' : '') + '"><span class="ic">' + f.icon + '</span><span class="m">' + esc(f.main) + '</span></span>').join('');
      return '<div class="card ' + cls + (dim ? ' dim' : '') + '"><div class="lab">' + lab + '</div><div class="rp">' + esc(step.ru) + '</div>' + (facts ? '<div class="facts">' + facts + '</div>' : '') + '</div>';
    }

    renderName() {
      this.$ctl.hidden = true;
      this.$body.innerHTML = '<div class="panel"><h2>Khush aamdeed!</h2><p>Apna naam likhein — sirf pehchaan ke liye.</p>' +
        '<label for="nm-' + this.me + '" class="small">Aap ka naam</label><input id="nm-' + this.me + '" class="txt" maxlength="40" autocomplete="name" placeholder="Maslan: Bilal">' +
        '<button class="btn primary block go">Shuru karein</button><p class="small">Is ke baad aap dono baari baari bolenge. Screen par likhai Roman Urdu mein hogi, lekin aap ne <b>Pashto</b> mein bolna hai.</p></div>';
      const inp = this.$body.querySelector('input'), go = this.$body.querySelector('.go');
      const save = async () => {
        const v = inp.value.trim(); if (v.length < 2) { inp.focus(); return; }
        go.disabled = true;
        try { this.apply((await this.tp.setName(v)).state, true); } catch (e) { go.disabled = false; note(this.$body, e.message); }
      };
      go.onclick = save; inp.onkeydown = (e) => { if (e.key === 'Enter') save(); };
      setTimeout(() => inp.focus(), 50);
    }

    renderStopped() {
      this.$ctl.hidden = true;
      this.$body.innerHTML = '<div class="panel center"><h2>Ruk gaye</h2><p>Aap yeh page band kar sakte hain. Isi link se dobara wahin se shuru hoga.</p><button class="btn primary">Jaari rakhein</button></div>';
      this.$body.querySelector('button').onclick = () => { this.stopped = false; this.render(); };
    }

    renderCtl(c) {
      this.$ctl.hidden = false;
      const phone = c.myRole === 'assistant', conv = c.inst.type === 'conv';
      let h = '';
      if (c.mine && this.mode === 'review' && this.take) {
        h += '<audio controls src="' + this.take.url + '"></audio>' + (this.take.simulated ? '<div class="small center">Demo: is page ko mic ki ijazat nahi, is liye asli awaz ki jagah beep</div>' : '') +
          '<button class="btn primary act-send">Bhejein ➜ partner ki baari</button><div class="row2"><button class="btn act-redo">↺ Dobara record</button><button class="btn act-more">Bhejein, main aur bolunga</button></div>';
      } else if (c.mine) {
        const ok = this.pOnline(this.s);
        h += '<button class="big go' + (phone ? ' phone' : '') + (this.mode === 'recording' ? ' recording' : '') + ' act-rec"' + (ok ? '' : ' disabled') + '>' +
          (this.mode === 'recording' ? '■ Rokein <span class="secs">0 s</span>' : '🎤 Dabayein aur Pashto mein bolein') + '</button><div class="meter"><i></i></div>';
      } else {
        h += '<button class="big" disabled>Partner ki baari</button>';
      }
      if (this.ask === 'skip') h += '<div class="confirm"><b>Yeh hissa dono ke liye chhor dein?</b><div class="row2"><button class="btn act-no">Nahi</button><button class="btn danger act-skip">Haan, chhorein</button></div></div>';
      else if (this.ask === 'finish') h += '<div class="confirm ok"><b>Guftagu khatam karke agle hisse par jayein?</b><div class="row2"><button class="btn act-no">Abhi nahi</button><button class="btn primary act-finish">Haan, khatam</button></div></div>';
      else h += '<div class="links">' + (conv ? '<button class="act-askfinish strong">✓ Guftagu khatam</button>' : '<button class="act-askskip">Yeh hissa chhorein</button>') + '<button class="act-stop">Abhi ruk jayein</button></div>';
      this.$ctl.innerHTML = h;
      const on = (sel, fn) => { const el = this.$ctl.querySelector(sel); if (el) el.onclick = fn; };
      on('.act-rec', () => this.toggleRec());
      on('.act-redo', () => { this.take = null; this.mode = 'idle'; this.render(); });
      on('.act-send', () => this.send(false));
      on('.act-more', () => this.send(true));
      on('.act-askskip', () => { this.ask = 'skip'; this.renderCtl(c); });
      on('.act-askfinish', () => { this.ask = 'finish'; this.renderCtl(c); });
      on('.act-no', () => { this.ask = null; this.renderCtl(c); });
      on('.act-skip', () => this.finish('skipped'));
      on('.act-finish', () => this.finish('completed'));
      on('.act-stop', async () => { if (this.mode === 'recording') await this.stopRec(true); this.stopped = true; this.render(); });
    }

    async toggleRec() {
      if (this.mode === 'recording') return this.stopRec(false);
      this.fake = false;
      try {
        await this.rec.start({ maxSec: this.o.maxTurnS, onLevel: (l) => { const m = this.$ctl.querySelector('.meter i'); if (m) m.style.width = Math.min(100, l * 400) + '%'; }, onAutoStop: () => { note(this.$body, (this.o.maxTurnS / 60) + ' minute ho gaye — yeh hissa bhej kar aur bolein.'); this.stopRec(false); } });
      } catch (e) {
        if (!this.o.allowFake) { note(this.$body, 'Mic nahi mila: ' + e.message + '. Browser mein mic ki ijazat dein.'); return; }
        this.fake = true;
      }
      this.mode = 'recording'; this.t0 = Date.now(); this.renderCtl(this.current());
      this.tick = setInterval(() => {
        const sec = (Date.now() - this.t0) / 1000; const el = this.$ctl.querySelector('.secs');
        if (el) el.textContent = (sec >= 60 ? Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0') : sec.toFixed(0) + ' s');
        if (this.fake) { const m = this.$ctl.querySelector('.meter i'); if (m) m.style.width = (20 + Math.random() * 50) + '%'; if (sec > this.o.maxTurnS) this.stopRec(false); }
      }, 200);
    }

    async stopRec(discard) {
      clearInterval(this.tick);
      const r = this.fake ? PDRec.fakeTake((Date.now() - this.t0) / 1000) : await this.rec.stop();
      this.mode = 'idle';
      if (discard) { this.take = null; return; }
      if (!r || r.duration < 0.6) { note(this.$body, 'Bohat chhota — dabayein, bolein, phir Rokein.'); this.render(); return; }
      if (!r.simulated && r.peak < 0.01) note(this.$body, 'Awaz bohat dheemi hai — mic check karein.');
      this.take = r; this.mode = 'review'; this.render();
    }

    async send(keep) {
      if (this.busy || !this.take) return;
      this.busy = true;
      this.$ctl.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      const s = this.s, c = this.current(), t = this.take;
      const meta = {
        instance_id: c.inst.instance_id, scenario_id: c.inst.scenario_id, scenario_type: c.inst.type, round: c.inst.round,
        role: c.step.role, card_ru: c.step.ru, card_en: c.step.en, intent: c.step.meta.intent, acts: c.step.meta.acts,
        slots: c.step.meta.slots, self_chosen: c.step.meta.self_chosen, question_idx: c.inst.type === 'conv' ? (s.q || 0) : '',
        question_en: c.inst.type === 'conv' ? c.inst.questions[Math.min(s.q || 0, c.inst.questions.length - 1)].en : '',
        duration_s: +t.duration.toFixed(2), peak: +t.peak.toFixed(4), rms_db: +t.rmsDb.toFixed(1), clip_pct: +t.clipPct.toFixed(3),
        sample_rate: t.sampleRate, capture_rate: t.captureRate, simulated: !!t.simulated, ts_client: new Date().toISOString()
      };
      try {
        const r = await this.tp.upload({ d: s.d, t: s.t, p: s.p || 0, q: s.q || 0, n: c.inst.n, keep: !!keep, meta: meta, b64: t.b64, url: t.url });
        this.take = null; this.mode = 'idle'; this.busy = false;
        this.apply(r.state, true);
      } catch (e) {
        this.busy = false; this.renderCtl(c);
        note(this.$body, 'Nahi bheja ja saka: ' + e.message + ' Recording mehfooz hai — dobara Bhejein dabayein.');
      }
    }

    async finish(status) {
      this.ask = null; const c = this.current();
      try { this.apply((await this.tp.finish({ d: this.s.d, status: status, instance_id: c.inst.instance_id, scenario_id: c.inst.scenario_id })).state, true); }
      catch (e) { note(this.$body, e.message); }
    }
  }

  function note(body, msg) { const d = document.createElement('div'); d.className = 'banner'; d.textContent = msg; body.prepend(d); setTimeout(() => d.remove(), 6000); }

  window.PhoneUI = PhoneUI;
})();
