// Buffer polyfill for colyseus.js
window.Buffer = (function() {
  function B(data) {
    if (typeof data === 'number') { this.data = new Uint8Array(data); this.length = data; }
    else if (data instanceof Uint8Array) { this.data = data; this.length = data.length; }
    else if (typeof data === 'string') { var d = new Uint8Array(data.length); for (var i = 0; i < data.length; i++) d[i] = data.charCodeAt(i); this.data = d; this.length = d.length; }
    else { this.data = new Uint8Array(0); this.length = 0; }
  }
  B.from = function(s) { if (typeof s === 'string') { var d = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) d[i] = s.charCodeAt(i); return new B(d); } if (s instanceof Uint8Array) return new B(s); return new B(s); };
  B.alloc = function(n) { return new B(n); };
  B.allocUnsafe = function(n) { return new B(n); };
  B.isBuffer = function(o) { return o instanceof B; };
  B.concat = function(list, totalLength) { var len = 0; list.forEach(function(b) { len += b.data.length; }); var r = new B(len || totalLength); var off = 0; list.forEach(function(b) { r.data.set(b.data, off); off += b.data.length; }); return r; };
  B.prototype.toString = function(enc, start, end) { var s = start || 0, e = end || this.length; var out = ''; for (var i = s; i < e; i++) out += String.fromCharCode(this.data[i]); return out; };
  B.prototype.readUInt8 = function(o) { return this.data[o]; };
  B.prototype.readUInt16LE = function(o) { return this.data[o] | (this.data[o + 1] << 8); };
  B.prototype.readUInt32LE = function(o) { return (this.data[o] | (this.data[o + 1] << 8) | (this.data[o + 2] << 16) | (this.data[o + 3] << 24)) >>> 0; };
  B.prototype.readInt8 = function(o) { var v = this.data[o]; return v > 127 ? v - 256 : v; };
  B.prototype.readInt16LE = function(o) { var v = this.data[o] | (this.data[o + 1] << 8); return v > 32767 ? v - 65536 : v; };
  B.prototype.readInt32LE = function(o) { return this.data[o] | (this.data[o + 1] << 8) | (this.data[o + 2] << 16) | (this.data[o + 3] << 24); };
  B.prototype.writeUInt8 = function(v, o) { this.data[o] = v; };
  B.prototype.writeUInt16LE = function(v, o) { this.data[o] = v & 0xff; this.data[o + 1] = (v >> 8) & 0xff; };
  B.prototype.writeUInt32LE = function(v, o) { this.data[o] = v & 0xff; this.data[o + 1] = (v >> 8) & 0xff; this.data[o + 2] = (v >> 16) & 0xff; this.data[o + 3] = (v >>> 24) & 0xff; };
  B.prototype.writeInt8 = function(v, o) { this.data[o] = v < 0 ? v + 256 : v; };
  B.prototype.writeInt16LE = function(v, o) { this.data[o] = v & 0xff; this.data[o + 1] = (v >> 8) & 0xff; };
  B.prototype.writeInt32LE = function(v, o) { this.data[o] = v & 0xff; this.data[o + 1] = (v >> 8) & 0xff; this.data[o + 2] = (v >> 16) & 0xff; this.data[o + 3] = (v >> 24) & 0xff; };
  B.prototype.writeFloatLE = function(v, o) { var buf = new ArrayBuffer(4); new DataView(buf).setFloat32(0, v, true); var view = new Uint8Array(buf); this.data.set(view, o); };
  B.prototype.writeDoubleLE = function(v, o) { var buf = new ArrayBuffer(8); new DataView(buf).setFloat64(0, v, true); var view = new Uint8Array(buf); this.data.set(view, o); };
  B.prototype.readFloatLE = function(o) { var buf = new Uint8Array(this.data.buffer, this.data.byteOffset + o, 4); return new DataView(buf.buffer, buf.byteOffset, 4).getFloat32(0, true); };
  B.prototype.readDoubleLE = function(o) { var buf = new Uint8Array(this.data.buffer, this.data.byteOffset + o, 8); return new DataView(buf.buffer, buf.byteOffset, 8).getFloat64(0, true); };
  B.prototype.slice = function(s, e) { return new B(this.data.slice(s || 0, e || this.length)); };
  B.prototype.subarray = function(s, e) { return new B(this.data.subarray(s || 0, e || this.length)); };
  B.prototype.write = function(s, o, l) { var off = o || 0, len = Math.min(l || s.length, this.length - off); for (var i = 0; i < len; i++) this.data[off + i] = s.charCodeAt(i); return len; };
  B.prototype.copy = function(t, tS, sS, sE) { sS = sS || 0; sE = sE || this.length; var len = sE - sS; if (tS + len > t.length) len = t.length - tS; for (var i = 0; i < len; i++) t.data[tS + i] = this.data[sS + i]; return len; };
  B.prototype.toJSON = function() { return { type: 'Buffer', data: Array.from(this.data) }; };
  B.prototype.equals = function(b) { if (this.length !== b.length) return false; for (var i = 0; i < this.length; i++) if (this.data[i] !== b.data[i]) return false; return true; };
  B.byteLength = function(s) { return s.length; };
  return B;
})();

// EventEmitter polyfill - named as EventEmitter$1 for colyseus.js UMD
(function() {
  function EE() { this._listeners = {}; }
  EE.prototype.on = function(ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); return this; };
  EE.prototype.addListener = EE.prototype.on;
  EE.prototype.off = function(ev, fn) { var a = this._listeners[ev]; if (a) { this._listeners[ev] = fn ? a.filter(function(f) { return f !== fn; }) : []; } return this; };
  EE.prototype.removeListener = EE.prototype.off;
  EE.prototype.emit = function(ev) { var a = this._listeners[ev]; if (a) { var args = Array.prototype.slice.call(arguments, 1); for (var i = 0; i < a.length; i++) a[i].apply(this, args); } return !!a; };
  EE.prototype.once = function(ev, fn) { var self = this; function w() { self.off(ev, w); fn.apply(this, arguments); } return this.on(ev, w); };
  EE.prototype.removeAllListeners = function(ev) { if (ev) { delete this._listeners[ev]; } else { this._listeners = {}; } return this; };
  EE.prototype.listenerCount = function(ev) { var a = this._listeners[ev]; return a ? a.length : 0; };
  // Export as EventEmitter$1 (what colyseus.js UMD expects) and EventEmitter
  window.EventEmitter$1 = EE;
  window.EventEmitter = EE;
})();

// Ensure browser UMD path is taken
if (typeof window.exports !== 'undefined') { delete window.exports; }
if (typeof window.module !== 'undefined') { delete window.module; }
if (typeof window.define !== 'undefined') { delete window.define; }
if (typeof window.require !== 'undefined') { delete window.require; }

// Stub Node.js native modules for colyseus.js UMD
// These map to the parameter names in the UMD factory function
window.require$$0 = window.Buffer;          // buffer module
window.require$$1 = { isValidUTF8: function() { return true; } }; // bufferutil
window.require$$1$1 = { isUtf8: function() { return true; }, default: { isUtf8: function() { return true; } } }; // utf-8-validate
window.require$$0$2 = { createHash: function() { return { update: function() { return this; }, digest: function() { return 'abc123'; } }; }, randomBytes: function(n) { return new Buffer(n); }, createHmac: function() { return { update: function() { return this; }, digest: function() { return ''; } }; } }; // crypto
window.require$$0$1 = { PassThrough: function() { return { on: function() { return this; }, emit: function() { return false; }, write: function() { return true; }, end: function() {} }; }, Readable: function() { return { on: function() { return this; }, pipe: function() { return this; } }; }, Writable: function() { return { on: function() { return this; }, write: function() { return true; } }; }, Transform: function() { return { on: function() { return this; }, write: function() { return true; } }; } }; // stream
window.require$$2 = { URL: window.URL, format: function(u) { return u.toString(); }, parse: function(s) { return new URL(s); } }; // url
window.zlib = { createInflate: function() { return { on: function() { return this; }, write: function() {}, end: function() {} }; }, createDeflate: function() { return { on: function() { return this; }, write: function() {}, end: function() {} }; }, inflateSync: function(b) { return b; }, deflateSync: function(b) { return b; } }; // zlib
window.https = { request: function() { return { on: function() { return this; }, end: function() {} }; } };
window.http = { request: function() { return { on: function() { return this; }, end: function() {} }; } };
window.net = { Socket: function() { return { on: function() { return this; }, connect: function() {}, write: function() {}, destroy: function() {} }; }, createConnection: function() { return { on: function() { return this; } }; } };
window.tls = { connect: function() { return { on: function() { return this; } }; } };

window.global = window;
window.globalThis = window;
window.process = { env: {}, cwd: function() { return '/'; }, nextTick: function(fn) { setTimeout(fn, 0); }, browser: true };
