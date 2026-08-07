(function () {
  'use strict';

  var SUBJECTS = window.SUBJECTS;
  if (!SUBJECTS) return;

  var KEY_OPEN  = 'g3-opened';
  var KEY_THEME = 'g3-theme';

  // ── 已打開的資源（存在這台瀏覽器，不上傳） ──────────
  var opened = {};
  try {
    var raw = localStorage.getItem(KEY_OPEN);
    if (raw) JSON.parse(raw).forEach(function (u) { opened[u] = 1; });
  } catch (e) {}

  function save() {
    try { localStorage.setItem(KEY_OPEN, JSON.stringify(Object.keys(opened))); } catch (e) {}
  }

  // ── 攤平成一份清單，方便算進度 ──────────────────
  var ALL = [];
  SUBJECTS.forEach(function (s) {
    s.groups.forEach(function (g) {
      g.items.forEach(function (it) { ALL.push({ s: s, it: it }); });
    });
  });
  var TOTAL = ALL.length;

  function countOf(subject) {
    var n = 0, t = 0;
    subject.groups.forEach(function (g) {
      g.items.forEach(function (it) { t++; if (opened[it.u]) n++; });
    });
    return { done: n, total: t };
  }

  function doneCount() {
    var n = 0;
    ALL.forEach(function (r) { if (opened[r.it.u]) n++; });
    return n;
  }

  // ══════════════ 畫出各科 ══════════════
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  var host = document.getElementById('subjects');
  host.innerHTML = SUBJECTS.map(function (s) {
    var groups = s.groups.map(function (g) {
      var items = g.items.map(function (it) {
        var tags = '<span class="tag lang">' + esc(it.lang) + '</span>' +
                   '<span class="tag acc' + (/需/.test(it.acc) ? ' need' : '') + '">' + esc(it.acc) + '</span>';
        return '<a class="res" href="' + esc(it.u) + '" target="_blank" rel="noopener" data-u="' + esc(it.u) + '">' +
                 '<span class="tick" aria-hidden="true"></span>' +
                 '<span class="rbody">' +
                   '<span class="rt">' + esc(it.t) + '</span>' +
                   '<span class="rd">' + it.d + '</span>' +
                   (it.warn ? '<span class="rw">⚠ ' + it.warn + '</span>' : '') +
                   '<span class="rtags">' + tags + '</span>' +
                 '</span>' +
               '</a>';
      }).join('');
      return '<div class="group ' + g.kind + '">' +
               '<h3>' + esc(g.title) + (g.note ? ' <span class="gnote">' + esc(g.note) + '</span>' : '') + '</h3>' +
               '<div class="reslist">' + items + '</div>' +
             '</div>';
    }).join('');

    return '<section class="subj" id="' + s.id + '" data-subj="' + s.id + '">' +
             '<div class="shead">' +
               '<span class="sicon" aria-hidden="true">' + s.icon + '</span>' +
               '<h2>' + esc(s.name) + (s.extra ? ' <span class="extra">加碼</span>' : '') + '</h2>' +
               '<span class="scount" data-no-zhuyin id="cnt-' + s.id + '"></span>' +
             '</div>' +
             '<p class="lead">' + s.lead + '</p>' +
             groups +
           '</section>';
  }).join('');

  // 導覽列補上各科連結
  var toc = document.getElementById('tocWrap');
  var first = toc.firstElementChild;
  SUBJECTS.forEach(function (s) {
    var a = document.createElement('a');
    a.href = '#' + s.id;
    a.textContent = s.icon + ' ' + s.name;
    toc.insertBefore(a, first);
  });

  // ══════════════ 純文字網址 ══════════════
  document.getElementById('urlList').innerHTML = SUBJECTS.map(function (s) {
    var lines = [];
    s.groups.forEach(function (g) {
      g.items.forEach(function (it) { lines.push(it.t + '\n' + it.u); });
    });
    return '<div class="ublock"><h4>' + esc(s.name) + '</h4><pre>' + esc(lines.join('\n\n')) + '</pre></div>';
  }).join('');

  // ══════════════ 等級與徽章 ══════════════
  var LEVELS = [
    { at: 0.00, icon: '🌱', name: '三年級新鮮人' },
    { at: 0.01, icon: '🔍', name: '好奇的人' },
    { at: 0.15, icon: '🔬', name: '小小研究員' },
    { at: 0.35, icon: '🚀', name: '探索高手' },
    { at: 0.60, icon: '🧭', name: '資深探險家' },
    { at: 0.90, icon: '🏆', name: '三年級百科' }
  ];

  var BADGES = [
    { id: 'first', icon: '🔑', name: '好奇心開關', hint: '打開第一個資源',
      got: function (d) { return d > 0; } },
    { id: 'five', icon: '🌈', name: '五科都碰過', hint: '五個正科各至少打開一個',
      got: function () {
        return SUBJECTS.filter(function (s) { return !s.extra; })
                       .every(function (s) { return countOf(s).done > 0; });
      } },
    { id: 'all', icon: '👑', name: '整箱翻遍', hint: '全部都打開過',
      got: function (d) { return d === TOTAL; } }
  ];
  // 每一科各一枚
  SUBJECTS.forEach(function (s) {
    BADGES.splice(BADGES.length - 2, 0, {
      id: 'sub-' + s.id, icon: s.icon, name: s.name + '過一輪', hint: '把' + s.name + '的資源全部打開',
      got: function () { var c = countOf(s); return c.done === c.total; }
    });
  });

  var grid = document.getElementById('badgeGrid');

  function refresh() {
    var d = doneCount();
    var pct = TOTAL ? d / TOTAL : 0;

    var lv = LEVELS[0];
    LEVELS.forEach(function (L) { if (pct >= L.at && (d > 0 || L.at === 0)) lv = L; });
    if (d === 0) lv = LEVELS[0];

    document.getElementById('lvIcon').textContent = lv.icon;
    document.getElementById('lvName').textContent = lv.name;
    document.getElementById('lvCount').textContent = '打開過 ' + d + ' / ' + TOTAL + ' 個';
    document.getElementById('pFill').style.width = (pct * 100).toFixed(1) + '%';

    SUBJECTS.forEach(function (s) {
      var c = countOf(s);
      var el = document.getElementById('cnt-' + s.id);
      if (el) el.textContent = c.done + '/' + c.total;
    });

    grid.innerHTML = BADGES.map(function (b) {
      var got = b.got(d);
      return '<div class="badge' + (got ? ' got' : '') + '" title="' + esc(b.hint) + '">' +
               '<span class="bi">' + b.icon + '</span>' +
               '<span class="bn">' + esc(b.name) + '</span>' +
               '<span class="bh">' + esc(got ? '已取得' : b.hint) + '</span>' +
             '</div>';
    }).join('') +
    '<button type="button" class="reset" id="resetBtn">重設進度</button>';

    // 這兩塊是重繪出來的，要補標注音（第一次執行時注音模組還沒載入，跳過即可）
    if (window.reZhuyin) {
      window.reZhuyin(grid);
      window.reZhuyin(document.querySelector('.progress'));
    }

    document.getElementById('resetBtn').onclick = function () {
      if (!confirm('要把打開過的紀錄全部清掉嗎？')) return;
      opened = {}; save();
      Array.prototype.forEach.call(document.querySelectorAll('.res.done'),
        function (a) { a.classList.remove('done'); });
      refresh();
    };
  }

  // ── 點過就記起來 ────────────────────────────
  host.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a.res') : null;
    if (!a) return;
    var u = a.getAttribute('data-u');
    if (!opened[u]) { opened[u] = 1; save(); }
    a.classList.add('done');
    refresh();
  });

  Array.prototype.forEach.call(document.querySelectorAll('a.res'), function (a) {
    if (opened[a.getAttribute('data-u')]) a.classList.add('done');
  });

  refresh();

  // ══════════════ 深色／淺色 ══════════════
  var themeBtn = document.getElementById('themeBtn');
  var theme = null;
  try { theme = localStorage.getItem(KEY_THEME); } catch (e) {}

  function applyTheme() {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
    var dark = theme === 'dark' ||
      (!theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    themeBtn.textContent = dark ? '☀️ 淺色' : '🌙 深色';
    themeBtn.setAttribute('aria-pressed', String(dark));
  }

  themeBtn.addEventListener('click', function () {
    var dark = theme === 'dark' ||
      (!theme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    theme = dark ? 'light' : 'dark';
    try { localStorage.setItem(KEY_THEME, theme); } catch (e) {}
    applyTheme();
  });

  applyTheme();
})();
