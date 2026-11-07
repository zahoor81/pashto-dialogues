/* Pashto Dialogue Recorder — microphone capture to 16 kHz mono 16-bit WAV.
 * Browser noise suppression, echo cancellation and auto-gain are switched OFF so the audio stays natural.
 * Capture runs at the device rate and is resampled to 16 kHz with the browser's own resampler. */
(function () {
  'use strict';
  const OUT_SR = 16000;
  const WORKLET = "class PDTap extends AudioWorkletProcessor{process(i){const c=i[0]&&i[0][0];if(c)this.port.postMessage(c.slice(0));return true}}registerProcessor('pd-tap',PDTap);";

  class PDRecorder {
    constructor() { this.recording = false; this.ctx = null; }

    async open() {
      if (this.ctx) { if (this.ctx.state === 'suspended') await this.ctx.resume(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('This browser cannot record audio. Please use Chrome.');
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false }
      });
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.src = this.ctx.createMediaStreamSource(this.stream);
      this.sink = this.ctx.createGain(); this.sink.gain.value = 0; this.sink.connect(this.ctx.destination);
      const onChunk = (d) => {
        if (!this.recording) return;
        this.chunks.push(d); this.len += d.length;
        let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
        if (this.cb.onLevel) this.cb.onLevel(Math.sqrt(s / d.length));
        if (!this.autoFired && this.len / this.ctx.sampleRate >= this.cb.maxSec) {
          this.autoFired = true; if (this.cb.onAutoStop) setTimeout(this.cb.onAutoStop, 0);
        }
      };
      try {
        if (!this.ctx.audioWorklet) throw new Error('no worklet');
        const url = URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }));
        await this.ctx.audioWorklet.addModule(url);
        this.node = new AudioWorkletNode(this.ctx, 'pd-tap');
        this.node.port.onmessage = (e) => onChunk(e.data);
      } catch (e) {
        this.node = this.ctx.createScriptProcessor(4096, 1, 1);
        this.node.onaudioprocess = (e) => onChunk(new Float32Array(e.inputBuffer.getChannelData(0)));
      }
      this.src.connect(this.node); this.node.connect(this.sink);
      if (this.ctx.state === 'suspended') await this.ctx.resume();
    }

    // cb: { onLevel(rms), onAutoStop(), maxSec }
    async start(cb) {
      this.cb = Object.assign({ maxSec: 60 }, cb || {});
      await this.open();
      this.chunks = []; this.len = 0; this.autoFired = false;
      this.recording = true; this.t0 = performance.now();
    }

    elapsed() { return this.recording ? (performance.now() - this.t0) / 1000 : 0; }

    async stop() {
      if (!this.recording) return null;
      this.recording = false;
      const sr = this.ctx.sampleRate;
      const raw = new Float32Array(this.len); let o = 0;
      for (const c of this.chunks) { raw.set(c, o); o += c.length; }
      this.chunks = [];
      const pcm = await resample(raw, sr, OUT_SR);
      return analyse(pcm, OUT_SR, sr);
    }

    close() {
      try { if (this.stream) this.stream.getTracks().forEach((t) => t.stop()); } catch (e) { /* ignore */ }
      try { if (this.ctx) this.ctx.close(); } catch (e) { /* ignore */ }
      this.ctx = null; this.stream = null; this.recording = false;
    }
  }

  async function resample(raw, srIn, srOut) {
    if (!raw.length) return new Float32Array(0);
    if (srIn === srOut) return raw;
    const outLen = Math.max(1, Math.round(raw.length * srOut / srIn));
    const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    try {
      const oc = new OAC(1, outLen, srOut);
      const buf = oc.createBuffer(1, raw.length, srIn);
      buf.getChannelData(0).set(raw);
      const s = oc.createBufferSource(); s.buffer = buf; s.connect(oc.destination); s.start(0);
      const r = await oc.startRendering();
      return r.getChannelData(0).slice(0);
    } catch (e) {
      // fallback: box-filter decimation
      const out = new Float32Array(outLen); const ratio = srIn / srOut;
      for (let i = 0; i < outLen; i++) {
        const a = Math.floor(i * ratio), b = Math.min(raw.length, Math.floor((i + 1) * ratio));
        let s = 0, n = 0; for (let j = a; j < b; j++) { s += raw[j]; n++; }
        out[i] = n ? s / n : raw[Math.min(a, raw.length - 1)];
      }
      return out;
    }
  }

  function analyse(pcm, sr, srIn) {
    let peak = 0, ss = 0, clip = 0;
    for (let i = 0; i < pcm.length; i++) { const a = Math.abs(pcm[i]); if (a > peak) peak = a; ss += pcm[i] * pcm[i]; if (a >= 0.99) clip++; }
    const rms = pcm.length ? Math.sqrt(ss / pcm.length) : 0;
    const wav = encodeWav(pcm, sr);
    return {
      duration: pcm.length / sr, peak: peak, rmsDb: rms > 0 ? 20 * Math.log10(rms) : -120,
      clipPct: pcm.length ? 100 * clip / pcm.length : 0, sampleRate: sr, captureRate: srIn,
      wav: wav, b64: abToB64(wav), url: URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }))
    };
  }

  function encodeWav(pcm, sr) {
    const buf = new ArrayBuffer(44 + pcm.length * 2); const v = new DataView(buf);
    const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); v.setUint32(4, 36 + pcm.length * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, 'data'); v.setUint32(40, pcm.length * 2, true);
    for (let i = 0, o = 44; i < pcm.length; i++, o += 2) { const s = Math.max(-1, Math.min(1, pcm[i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true); }
    return buf;
  }

  function abToB64(ab) {
    const u = new Uint8Array(ab); let s = ''; const C = 0x8000;
    for (let i = 0; i < u.length; i += C) s += String.fromCharCode.apply(null, u.subarray(i, i + C));
    return btoa(s);
  }
  function b64ToBlobUrl(b64, mime) {
    const bin = atob(b64); const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([u], { type: mime || 'audio/wav' }));
  }

  // Demo only: soft beeps standing in for a recording when the page may not use the microphone.
  function fakeTake(sec) {
    const n = Math.max(1, Math.round(sec * OUT_SR)); const pcm = new Float32Array(n); const beep = 0.18 * OUT_SR, gap = 0.5 * OUT_SR;
    for (let i = 0; i < n; i++) {
      const k = i % gap; if (k >= beep) continue;
      const env = Math.sin(Math.PI * k / beep);                       // fade in and out, no clicks
      pcm[i] = 0.12 * env * Math.sin(2 * Math.PI * 523 * i / OUT_SR);
    }
    const r = analyse(pcm, OUT_SR, OUT_SR); r.simulated = true; return r;
  }

  window.PDRec = { PDRecorder: PDRecorder, abToB64: abToB64, b64ToBlobUrl: b64ToBlobUrl, fakeTake: fakeTake };
})();
