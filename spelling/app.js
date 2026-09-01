/* G3 拼字王 */
(function () {
  'use strict';

  var WORDS = window.WORDS || [];
  var SIZE = window.GROUP_SIZE || 25;
  var KEY = 'g3spell.v1';

  var groups = [];
  for (var i = 0; i < WORDS.length; i += SIZE) groups.push(WORDS.slice(i, i + SIZE));

  var $ = function (id) { return document.getElementById(id); };

  // ── 狀態 ───────────────────────────────
  var state = { g: 0, c: 0, learned: {} };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved && typeof saved === 'object') {
      state.learned = saved.learned || {};
      state.g = Math.min(saved.g || 0, groups.length - 1);
    }
  } catch (e) { /* localStorage 不可用就當作全新開始 */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ learned: state.learned, g: state.g })); }
    catch (e) { /* 無痕模式寫不進去，不影響使用 */ }
  }

  var absIndex = function (g, c) { return g * SIZE + c; };
  var isLearned = function (g, c) { return !!state.learned[absIndex(g, c)]; };

  // ── 發音 ───────────────────────────────
  var speech = {
    ok: 'speechSynthesis' in window,
    voice: null,
    rate: 0.85,
    pick: function () {
      if (!this.ok) return;
      var vs = window.speechSynthesis.getVoices() || [];
      var en = vs.filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
      if (!en.length) { this.voice = null; return; }
      var prefer = ['en-US', 'en_US', 'en-GB', 'en_GB'];
      for (var i = 0; i < prefer.length; i++) {
        var hit = en.filter(function (v) { return v.lang.replace('_', '-') === prefer[i].replace('_', '-'); })[0];
        if (hit) { this.voice = hit; return; }
      }
      this.voice = en[0];
    },
    say: function (text, onEnd) {
      if (!this.ok) { if (onEnd) onEnd(); return; }
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = (this.voice && this.voice.lang) || 'en-US';
      if (this.voice) u.voice = this.voice;
      u.rate = this.rate;
      if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
      window.speechSynthesis.speak(u);
    },
    stop: function () { if (this.ok) window.speechSynthesis.cancel(); }
  };

  if (speech.ok) {
    speech.pick();
    // Chrome 的語音清單是非同步載入的，第一次呼叫時常常還是空的
    window.speechSynthesis.onvoiceschanged = function () { speech.pick(); checkVoice(); };
  }

  function checkVoice() {
    var box = $('voicehelp'), warn = $('voiceWarn');
    if (!box || !warn) return;
    if (!speech.ok) {
      warn.innerHTML = '這個瀏覽器不支援語音朗讀，發音鈕不會有聲音。<br>' +
        '單字和中文意思都還是可以正常使用；想要發音的話，請改用 Chrome、Edge 或 Safari。';
      box.hidden = false;
    } else if (!speech.voice) {
      warn.innerHTML = '找不到英文語音，發音鈕可能沒聲音或念成中文腔。<br>' +
        'Windows 可到「設定 → 時間與語言 → 語音」加裝英文語音套件，加完重開瀏覽器。';
      box.hidden = false;
    } else {
      box.hidden = true;
    }
    [].forEach.call(document.querySelectorAll('.speak'), function (b) {
      b.disabled = !speech.ok;
    });
  }

  // ── 進度 ───────────────────────────────
  var LEVELS = [
    [0, '🐣', '剛起步'], [.15, '🐤', '上手了'], [.35, '🐥', '有感覺'],
    [.6, '🦉', '很熟了'], [.85, '🏆', '拼字王']
  ];

  function renderProgress() {
    var total = WORDS.length, done = 0;
    for (var k in state.learned) if (state.learned[k]) done++;
    var pct = total ? done / total : 0;
    var lv = LEVELS[0];
    LEVELS.forEach(function (l) { if (pct >= l[0]) lv = l; });
    $('lvIcon').textContent = lv[1];
    $('lvName').textContent = lv[2];
    $('lvCount').textContent = '學會 ' + done + ' / ' + total + ' 個字';
    $('pFill').style.width = (pct * 100).toFixed(1) + '%';
  }

  // ── 組別 ───────────────────────────────
  function renderGroups() {
    var row = $('groupRow');
    row.innerHTML = '';
    groups.forEach(function (g, gi) {
      var done = 0;
      g.forEach(function (_, ci) { if (isLearned(gi, ci)) done++; });
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gbtn' + (gi === state.g ? ' is-on' : '') + (done === g.length ? ' done' : '');
      b.innerHTML = '<b>第 ' + (gi + 1) + ' 組</b><span>' +
        (gi * SIZE + 1) + '–' + (gi * SIZE + g.length) + '　' + done + '/' + g.length + '</span>';
      b.addEventListener('click', function () {
        state.g = gi; state.c = 0; save();
        renderGroups(); renderCard(); renderList(); resetQuiz();
      });
      row.appendChild(b);
    });
  }

  // ── 依序介紹 ───────────────────────────
  function renderCard(speakIt) {
    var g = groups[state.g];
    if (!g) return;
    if (state.c >= g.length) state.c = g.length - 1;
    if (state.c < 0) state.c = 0;
    var item = g[state.c];

    $('cIdx').textContent = (state.c + 1) + ' / ' + g.length;
    $('cGroup').textContent = '第 ' + (state.g + 1) + ' 組　（總表第 ' + (absIndex(state.g, state.c) + 1) + ' 個）';
    $('cWord').textContent = item.w;
    $('cZh').textContent = item.z;
    $('cLearned').checked = isLearned(state.g, state.c);
    $('cPrev').disabled = (state.g === 0 && state.c === 0);
    $('cNext').disabled = (state.g === groups.length - 1 && state.c === g.length - 1);

    var dots = $('cDots');
    dots.innerHTML = '';
    g.forEach(function (_, ci) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'dot' + (isLearned(state.g, ci) ? ' done' : '') + (ci === state.c ? ' is-on' : '');
      d.title = String(ci + 1);
      d.setAttribute('aria-label', '第 ' + (ci + 1) + ' 個字');
      d.addEventListener('click', function () { state.c = ci; renderCard(true); });
      dots.appendChild(d);
    });

    if (speakIt) speech.say(item.w);
  }

  function step(delta) {
    var c = state.c + delta;
    if (c < 0) {
      if (state.g === 0) return;
      state.g--; c = groups[state.g].length - 1;
      renderGroups();
    } else if (c >= groups[state.g].length) {
      if (state.g === groups.length - 1) return;
      state.g++; c = 0;
      renderGroups();
    }
    state.c = c; save();
    renderCard(true);
    renderList();
  }

  // ── 單字表 ─────────────────────────────
  function renderList() {
    var ol = $('wordList');
    ol.innerHTML = '';
    groups[state.g].forEach(function (item, ci) {
      var li = document.createElement('li');
      li.className = isLearned(state.g, ci) ? 'done' : '';
      li.dataset.ci = String(ci);

      var n = document.createElement('span');
      n.className = 'n';
      n.textContent = String(absIndex(state.g, ci) + 1);

      var mid = document.createElement('span');
      mid.className = 'w';
      mid.textContent = item.w;
      var z = document.createElement('span');
      z.className = 'z';
      z.textContent = item.z;
      mid.appendChild(z);

      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'speak mini';
      b.textContent = '🔊';
      b.setAttribute('aria-label', '念出 ' + item.w);
      b.disabled = !speech.ok;
      b.addEventListener('click', function () { speech.say(item.w); });

      li.appendChild(n); li.appendChild(mid); li.appendChild(b);
      ol.appendChild(li);
    });
  }

  var playing = false;
  function playAll() {
    if (!speech.ok) return;
    var items = groups[state.g], i = 0;
    playing = true;
    $('playAll').hidden = true;
    $('stopAll').hidden = false;

    (function next() {
      if (!playing || i >= items.length) { stopAll(); return; }
      var li = $('wordList').querySelector('li[data-ci="' + i + '"]');
      [].forEach.call($('wordList').children, function (e) { e.classList.remove('speaking'); });
      if (li) { li.classList.add('speaking'); li.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      speech.say(items[i].w, function () {
        i++;
        setTimeout(next, 450);
      });
    })();
  }

  function stopAll() {
    playing = false;
    speech.stop();
    $('playAll').hidden = false;
    $('stopAll').hidden = true;
    [].forEach.call($('wordList').children, function (e) { e.classList.remove('speaking'); });
  }

  // ── 拼字練習 ───────────────────────────
  var quiz = { queue: [], pos: 0, right: 0, wrong: 0, answered: false };

  function shuffle(a) {
    var r = a.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }

  function resetQuiz() {
    quiz.queue = shuffle(groups[state.g].map(function (item, ci) { return { item: item, ci: ci }; }));
    quiz.pos = 0; quiz.right = 0; quiz.wrong = 0; quiz.answered = false;
    $('qRight').textContent = '0';
    $('qWrong').textContent = '0';
    $('qFeed').textContent = '';
    $('qFeed').className = 'qfeed';
    $('qInput').value = '';
    askQuiz(false);
  }

  function askQuiz(speakIt) {
    var q = quiz.queue[quiz.pos];
    var form = $('qForm');
    if (!q) {
      $('qZh').textContent = '';
      $('qFeed').className = 'qfeed ok';
      $('qFeed').innerHTML = '這一組練完了！<em>答對 ' + quiz.right + ' 個，答錯 ' + quiz.wrong + ' 個。</em>';
      form.hidden = true;
      $('qSpeak').disabled = true;
      return;
    }
    form.hidden = false;
    $('qSpeak').disabled = !speech.ok;
    form.querySelector('button[type=submit]').textContent = '看答案';
    quiz.answered = false;
    $('qZh').textContent = '提示：' + q.item.z;
    $('qInput').value = '';
    $('qInput').focus();
    if (speakIt) speech.say(q.item.w);
  }

  function submitQuiz(ev) {
    ev.preventDefault();
    var q = quiz.queue[quiz.pos];
    if (!q) return;

    if (quiz.answered) { quiz.pos++; askQuiz(true); return; }

    var norm = function (s) { return String(s).trim().toLowerCase().replace(/\s+/g, ' '); };
    var got = norm($('qInput').value);
    if (!got) { $('qInput').focus(); return; }

    var feed = $('qFeed');
    if (got === norm(q.item.w)) {
      quiz.right++;
      state.learned[absIndex(state.g, q.ci)] = true;
      save();
      feed.className = 'qfeed ok';
      feed.innerHTML = '✅ 答對了！<em>' + q.item.w + '　' + q.item.z + '</em>';
      renderProgress(); renderGroups(); renderList(); renderCard();
    } else {
      quiz.wrong++;
      feed.className = 'qfeed bad';
      feed.innerHTML = '❌ 再看一次<em>正確拼法：<b>' + q.item.w + '</b>　' + q.item.z + '</em>';
    }
    $('qRight').textContent = String(quiz.right);
    $('qWrong').textContent = String(quiz.wrong);
    quiz.answered = true;
    $('qForm').querySelector('button[type=submit]').textContent = '下一題 →';
    $('qInput').select();
  }

  // ── 分頁切換 ───────────────────────────
  function initTabs() {
    [].forEach.call(document.querySelectorAll('.tab'), function (t) {
      t.addEventListener('click', function () {
        [].forEach.call(document.querySelectorAll('.tab'), function (x) { x.classList.remove('is-on'); });
        [].forEach.call(document.querySelectorAll('.panel'), function (x) { x.classList.remove('is-on'); });
        t.classList.add('is-on');
        var p = $('panel-' + t.dataset.panel);
        if (p) p.classList.add('is-on');
        stopAll();
        if (t.dataset.panel === 'quiz') askQuiz(true);
      });
    });
  }

  // ── 主題 ───────────────────────────────
  function initTheme() {
    var btn = $('themeBtn');
    var TKEY = 'g3spell.theme';
    var cur = null;
    try { cur = localStorage.getItem(TKEY); } catch (e) {}
    if (cur) document.documentElement.setAttribute('data-theme', cur);
    var paint = function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        (!document.documentElement.getAttribute('data-theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      btn.textContent = dark ? '☀️ 淺色' : '🌙 深色';
      btn.setAttribute('aria-pressed', String(dark));
    };
    paint();
    btn.addEventListener('click', function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        (!document.documentElement.getAttribute('data-theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = dark ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(TKEY, next); } catch (e) {}
      paint();
    });
  }

  // ── 綁定 ───────────────────────────────
  $('cSpeak').addEventListener('click', function () { speech.say(groups[state.g][state.c].w); });
  $('cPrev').addEventListener('click', function () { step(-1); });
  $('cNext').addEventListener('click', function () { step(1); });
  $('cLearned').addEventListener('change', function () {
    var k = absIndex(state.g, state.c);
    if (this.checked) state.learned[k] = true; else delete state.learned[k];
    save();
    renderProgress(); renderGroups(); renderList(); renderCard();
  });
  $('playAll').addEventListener('click', playAll);
  $('stopAll').addEventListener('click', stopAll);
  $('qSpeak').addEventListener('click', function () {
    var q = quiz.queue[quiz.pos];
    if (q) speech.say(q.item.w);
  });
  $('qForm').addEventListener('submit', submitQuiz);
  $('qReset').addEventListener('click', resetQuiz);

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (!$('panel-intro').classList.contains('is-on')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === ' ') { e.preventDefault(); speech.say(groups[state.g][state.c].w); }
  });

  // ── 啟動 ───────────────────────────────
  initTabs();
  initTheme();
  renderProgress();
  renderGroups();
  renderCard(false);
  renderList();
  resetQuiz();
  checkVoice();
})();
