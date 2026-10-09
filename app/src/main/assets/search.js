/* Recherche Gloire a Dieu - ES5, compatible WebView Android 5+ */
(function () {
  var recs = null, folded = null, ready = false;
  var q, out, info;

  function fold(s) {
    s = s.toLowerCase();
    s = s.replace(/[àáâãäå]/g, 'a');
    s = s.replace(/[èéêë]/g, 'e');
    s = s.replace(/[ìíîï]/g, 'i');
    s = s.replace(/[òóôõö]/g, 'o');
    s = s.replace(/[ùúûü]/g, 'u');
    s = s.replace(/[ýÿ]/g, 'y');
    s = s.replace(/ç/g, 'c');
    s = s.replace(/ñ/g, 'n');
    s = s.replace(/[’‘´`]/g, "'");
    return s;
  }

  function foldQuery(s) {
    s = fold(s);
    s = s.replace(/oe/g, 'œ');
    s = s.replace(/\s+/g, ' ');
    return s;
  }

  function build() {
    if (ready) return;
    var lines = GAD_RAW.split('\n');
    recs = []; folded = [];
    for (var i = 0; i < lines.length; i++) {
      var p = lines[i].split('\t');
      if (p.length < 6) continue;
      recs.push({ n: p[0], s: p[1], f: p[2], t: p[3], c: p[4], b: p[5] });
      folded.push({ t: fold(p[3]), b: fold(p[5]) });
    }
    ready = true;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function mark(orig, pos, len) {
    var start = pos - 45; if (start < 0) start = 0;
    var cut = orig.lastIndexOf(' ', start);
    if (cut > 0 && start > 0) start = cut + 1;
    var end = pos + len + 70; if (end > orig.length) end = orig.length;
    var pre = (start > 0 ? '…' : '') + esc(orig.substring(start, pos));
    var hit = esc(orig.substring(pos, pos + len));
    var post = esc(orig.substring(pos + len, end)) + (end < orig.length ? '…' : '');
    return pre + '<mark>' + hit + '</mark>' + post;
  }

  function lab(r) { return r.n + (r.s ? ' (' + r.s + ')' : ''); }

  function row(r, snippet) {
    return '<a class="row" href="' + r.f + '.html"><span class="num">' + lab(r) + '</span>' +
      '<span class="ttl">' + esc(r.t) + (snippet ? '<span class="snip">' + snippet + '</span>' : '') +
      '</span><span class="arr">›</span></a>';
  }

  function run() {
    var v = q.value;
    if (!v || !v.replace(/\s/g, '')) {
      out.innerHTML = '';
      info.innerHTML = 'Tapez un numéro, un titre ou une parole du chant.';
      return;
    }
    build();
    var needle = foldQuery(v).replace(/^\s+|\s+$/g, '');
    var html = '', count = 0, i, r, fd, pos;

    if (/^[0-9]+$/.test(needle)) {
      var exact = [], starts = [];
      for (i = 0; i < recs.length; i++) {
        r = recs[i];
        if (r.n === needle) exact.push(r);
        else if (r.n.indexOf(needle) === 0) starts.push(r);
      }
      var list = exact.concat(starts);
      for (i = 0; i < list.length && count < 60; i++) { html += row(list[i], ''); count++; }
      info.innerHTML = count ? (count + ' chant' + (count > 1 ? 's' : '')) :
        'Aucun chant à ce numéro.';
      out.innerHTML = html;
      return;
    }

    if (needle.length < 2) {
      info.innerHTML = 'Tapez au moins 2 lettres.';
      out.innerHTML = '';
      return;
    }

    var inTitle = '', nTitle = 0, inBody = '', nBody = 0;
    for (i = 0; i < recs.length; i++) {
      r = recs[i]; fd = folded[i];
      pos = fd.t.indexOf(needle);
      if (pos >= 0) { if (nTitle < 60) inTitle += row(r, ''); nTitle++; continue; }
      pos = fd.b.indexOf(needle);
      if (pos >= 0) { if (nBody < 60) inBody += row(r, mark(r.b, pos, needle.length)); nBody++; }
    }
    html = '';
    if (nTitle) html += '<div class="gh">Dans les titres · ' + nTitle + '</div>' + inTitle;
    if (nBody) html += '<div class="gh">Dans les paroles · ' + nBody + '</div>' + inBody;
    out.innerHTML = html;
    var tot = nTitle + nBody;
    info.innerHTML = tot ? (tot + ' résultat' + (tot > 1 ? 's' : '') +
      (tot > 120 ? ' (120 affichés)' : '')) : 'Aucun résultat pour « ' + esc(v) + ' ».';
  }

  var timer = null;
  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(run, 160);
  }

  function init() {
    q = document.getElementById('q');
    out = document.getElementById('out');
    info = document.getElementById('info');
    if (!q || !out || !info) return;
    document.getElementById('nojs').style.display = 'none';
    document.getElementById('box').style.display = 'block';
    if (q.addEventListener) {
      q.addEventListener('input', schedule, false);
      q.addEventListener('keyup', schedule, false);
    } else { q.onkeyup = schedule; }
    var c = document.getElementById('clr');
    c.onclick = function () { q.value = ''; q.focus(); run(); return false; };
    info.innerHTML = 'Tapez un numéro, un titre ou une parole du chant.';
    try { q.focus(); } catch (e) {}
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', init, false);
  } else { window.onload = init; }
  setTimeout(function () { if (!q) init(); }, 400);
})();
