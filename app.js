/* ============================================================
   app.js — CHUM APP — PC / iOS / Android / Android TV
   Auto-detect device → show appropriate UI
   ============================================================ */
(function () {
  'use strict';

  /* ---------- DEVICE DETECTION ----------
     Detects: 'android-tv' | 'android' | 'ios' | 'pc'
     Priority: URL override > UA sniffing + screen heuristics
  */
  function detectDevice() {
    var ua = navigator.userAgent || '';

    // 1) Android TV / Fire TV / Smart TV
    if (/Android TV|BRAVIA|SmartTV|SMART-TV|GoogleTV|Nexus Player|AFT[A-Z]|Fire TV|Leanback/i.test(ua)) return 'android-tv';
    // Android without "Mobile" + large landscape = TV
    if (/Android/i.test(ua) && !/Mobile/i.test(ua)) {
      if (window.screen && window.screen.width >= 960 && window.screen.width > window.screen.height) return 'android-tv';
    }

    // 2) iOS (iPhone, iPad, iPod)
    if (/iPhone|iPod/i.test(ua)) return 'ios';
    if (/iPad/i.test(ua)) return 'ios';
    // iPad on iOS 13+ reports as Mac
    if (/Macintosh/i.test(ua) && 'ontouchstart' in window && navigator.maxTouchPoints > 1) return 'ios';

    // 3) Android phone / tablet
    if (/Android/i.test(ua)) return 'android';

    // 4) PC (Windows, Mac, Linux, ChromeOS)
    return 'pc';
  }

  // Allow URL override: ?mode=android-tv | android | ios | pc
  var DEVICE_MODE = (function () {
    var params = new URLSearchParams(window.location.search);
    var override = params.get('mode');
    if (override && /^(android-tv|android|ios|pc)$/.test(override)) return override;
    return detectDevice();
  })();

  // Layout group: 'tv' for lean-back, 'mobile' for touch, 'desktop' for mouse+keyboard
  var LAYOUT = (DEVICE_MODE === 'android-tv') ? 'tv' :
               (DEVICE_MODE === 'android' || DEVICE_MODE === 'ios') ? 'mobile' : 'desktop';

  // Apply body classes immediately
  document.body.classList.add('is-' + DEVICE_MODE.replace('-', ''));
  document.body.classList.add('layout-' + LAYOUT);
  document.documentElement.setAttribute('data-device', DEVICE_MODE);
  document.documentElement.setAttribute('data-layout', LAYOUT);

  /* ---------- CONSTANTS ---------- */
  var GITHUB_API_URL = 'https://api.github.com/repos/Chumvn/apktv/releases/tags/V1.0';
  var FETCH_TIMEOUT = 15000;
  var REFRESH_INTERVAL = 300000;
  var TOAST_DURATION = 2800;
  var TAB_ALL = 'MỚI NHẤT';

  /* ---------- RANDOM EMOJI POOL (all kinds, not just zodiac) ---------- */
  var EMOJI_POOL = [
    '🎮', '🎯', '🎪', '🎨', '🎭', '🎬', '🎸', '🎵', '🎹', '🎺',
    '🏆', '🏅', '🏈', '🏀', '⚽', '🏐', '🏓', '🏸', '🥊', '🏋️',
    '🚀', '🛸', '🌟', '⭐', '💫', '🌈', '🔥', '💎', '🎩', '👑',
    '🦁', '🐯', '🐻', '🦊', '🐺', '🦅', '🦋', '🐲', '🦄', '🐬',
    '🌸', '🌺', '🍀', '🌿', '🌙', '☀️', '⚡', '❄️', '🌊', '🍁',
    '🎃', '🎄', '🎁', '🎈', '🎉', '🎊', '🧊', '💡', '🔮', '🧲',
    '🗡️', '🛡️', '⚙️', '🔧', '🔑', '🏠', '🏰', '🗼', '🎡', '🎢',
    '📱', '💻', '🖥️', '🎥', '📷', '📡', '🔭', '🧬', '🧪', '⚗️',
    '🍕', '🍔', '🍟', '🌮', '🍩', '🍦', '🎂', '🍪', '🥤', '☕',
    '🐀', '🐂', '🐅', '🐇', '🐉', '🐍', '🐴', '🐏', '🐒', '🐓', '🐕', '🐖'
  ];

  /* ---------- GRADIENT COLOR PAIRS ---------- */
  var COLOR_PAIRS = [
    ['#6366f1', '#8b5cf6'], ['#ec4899', '#f472b6'], ['#ef4444', '#f87171'],
    ['#f59e0b', '#fbbf24'], ['#10b981', '#34d399'], ['#3b82f6', '#60a5fa'],
    ['#8b5cf6', '#a78bfa'], ['#f97316', '#fb923c'], ['#14b8a6', '#2dd4bf'],
    ['#e11d48', '#fb7185'], ['#6d28d9', '#7c3aed'], ['#0891b2', '#22d3ee'],
    ['#059669', '#10b981'], ['#d946ef', '#e879f9'], ['#0ea5e9', '#38bdf8'],
    ['#7c3aed', '#a78bfa'], ['#dc2626', '#f87171'], ['#ca8a04', '#eab308'],
    ['#2563eb', '#3b82f6'], ['#9333ea', '#a855f7']
  ];

  /* ---------- CATEGORY KEYWORDS for auto-classification ---------- */
  var CATEGORY_RULES = [
    {
      cat: 'YouTube / SmartTube',
      keywords: ['smarttube', 'youtube', 'cobalt']
    },
    {
      cat: 'Xem phim / TV',
      keywords: ['hdotv', 'hieuga', 'rapphim', 'dailymotion', 'nvc', 'sparkle', 'vlc', 'kiki', 'phim', 'movie', 'cinema', 'film', 'video', 'media', 'player']
    },
    {
      cat: 'IPTV',
      keywords: ['iptv', 'tivimate', 'televizo', 'ott', 'navigator', 'live+channels', 'livechannel', 'live_channel']
    },
    {
      cat: 'Launcher',
      keywords: ['launcher', 'hometv', 'projectivy', 'appdrawer', 'appsdrawer', 'lm_atv', 'lm_firetv', 'googletv', 'google_tv']
    },
    {
      cat: 'File Manager',
      keywords: ['file', 'explorer', 'manager', 'mixplorer', 'x-plore', 'xplore', 'totalcmd', 'total_commander', 'rsfile']
    },
    {
      cat: 'App Store',
      keywords: ['aptoide', 'apkmirro', 'apkup', 'baostore', 'dlstore', 'emotn', 'hdplaystore', 'mstore', 'ttvstore', 'store']
    },
    {
      cat: 'ADB / Remote',
      keywords: ['adb', 'remote', 'sendfiles']
    },
    {
      cat: 'Voice / Input',
      keywords: ['voice', 'supervoice', 'mapvoice', 'keyboard', 'input']
    },
    {
      cat: 'Tiện ích',
      keywords: ['cleaner', 'atvtools', 'button', 'mapper', 'remapper', 'quickaction', 'orientation', 'ferrari', 'downloader', 'sai', 'ntp', 'reboot', 'coreelec', 'tool']
    }
  ];

  /* ---------- SMART NAME FORMATTING ---------- */
  function formatAppName(baseName) {
    var name = baseName
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    name = name.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    name = name
      .replace(/\bV(\d)/gi, 'v$1')
      .replace(/\bMod\b/gi, 'Mod')
      .replace(/\bPremium\b/gi, 'Premium')
      .replace(/\bPro\b/gi, 'Pro')
      .replace(/\bPatched\b/gi, 'Patched')
      .replace(/\bDonate\b/gi, 'Donate')
      .replace(/\bBeta\b/gi, 'Beta')
      .replace(/\bSilver\b/gi, 'Silver');
    return name;
  }

  /* ---------- GET APP INITIALS (bold text on icon) ---------- */
  function getAppInitials(appName) {
    if (!appName) return '?';
    // Try to get initials from words (max 2-3 chars)
    var words = appName.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    // Single word: take first 2 characters
    return appName.substring(0, 2).toUpperCase();
  }

  /* ---------- HASH-BASED RANDOM ASSIGNMENT ---------- */
  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  function getRandomEmoji(appName) {
    var index = hashString(appName) % EMOJI_POOL.length;
    return EMOJI_POOL[index];
  }

  function getRandomColors(appName) {
    var index = hashString(appName + '_color') % COLOR_PAIRS.length;
    return COLOR_PAIRS[index];
  }

  /* ---------- AUTO-CLASSIFY CATEGORY ---------- */
  function classifyApp(fileName) {
    var lower = fileName.toLowerCase();
    for (var i = 0; i < CATEGORY_RULES.length; i++) {
      var rule = CATEGORY_RULES[i];
      for (var k = 0; k < rule.keywords.length; k++) {
        if (lower.indexOf(rule.keywords[k]) !== -1) {
          return rule.cat;
        }
      }
    }
    return 'Khác';
  }

  /* ---------- DOM REFERENCES ---------- */
  var $searchInput = document.getElementById('search-input');
  var $btnRefresh = document.getElementById('btn-refresh');
  var $btnTheme = document.getElementById('btn-theme');
  var $statusLine = document.getElementById('status-line');
  var $tabsBar = document.getElementById('tabs-bar');
  var $skeleton = document.getElementById('skeleton');
  var $cardsGrid = document.getElementById('cards-grid');
  var $emptyState = document.getElementById('empty-state');
  var $errorState = document.getElementById('error-state');
  var $btnRetry = document.getElementById('btn-retry');
  var $toast = document.getElementById('toast');

  /* ---------- STATE ---------- */
  var rawData = [];
  var flatItems = [];
  var categories = [];
  var activeTab = TAB_ALL;
  var searchQuery = '';
  var toastTimer = null;
  var refreshTimer = null;

  /* ---------- THEME ---------- */
  function initTheme() {
    var saved = localStorage.getItem('kho-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  }
  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kho-theme', next);
  }
  initTheme();

  /* ---------- HELPERS ---------- */
  function setStatus(msg) {
    $statusLine.textContent = msg;
  }

  function showToast(msg) {
    $toast.textContent = msg;
    $toast.style.display = '';
    $toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(dismissToast, TOAST_DURATION);
  }

  function dismissToast() {
    $toast.classList.remove('show');
    clearTimeout(toastTimer);
    setTimeout(function () { $toast.style.display = 'none'; }, 300);
  }

  function timeStr() {
    var d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' +
      d.getMinutes().toString().padStart(2, '0') + ':' +
      d.getSeconds().toString().padStart(2, '0');
  }

  /* ---------- FORMAT FILE SIZE ---------- */
  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  /* ---------- FORMAT DATE ---------- */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr);
    var day = d.getDate().toString().padStart(2, '0');
    var month = (d.getMonth() + 1).toString().padStart(2, '0');
    var year = d.getFullYear();
    var hours = d.getHours().toString().padStart(2, '0');
    var mins = d.getMinutes().toString().padStart(2, '0');
    return day + '/' + month + '/' + year + ' ' + hours + ':' + mins;
  }

  /* ---------- TRANSFORM GITHUB ASSETS → AUTO-CATEGORIZED DATA ---------- */
  function transformAssets(assets) {
    var catMap = {};
    var catOrder = ['YouTube / SmartTube', 'Xem phim / TV', 'IPTV', 'Launcher', 'File Manager', 'App Store', 'Tiện ích', 'ADB / Remote', 'Voice / Input', 'Khác'];

    for (var i = 0; i < assets.length; i++) {
      var asset = assets[i];
      var fileName = asset.name || '';

      // Only process APK/XAPK files
      if (!/\.(apk|xapk)$/i.test(fileName)) continue;

      var baseName = fileName.replace(/\.(apk|xapk)$/i, '');
      var catName = classifyApp(baseName);
      var appName = formatAppName(baseName);

      if (!catMap[catName]) catMap[catName] = [];
      catMap[catName].push({
        name: appName,
        desc: fileName,
        apk_url: asset.browser_download_url,
        size: asset.size,
        updated_at: asset.updated_at
      });
    }

    var result = [];
    for (var c = 0; c < catOrder.length; c++) {
      if (catMap[catOrder[c]]) {
        result.push({ category: catOrder[c], items: catMap[catOrder[c]] });
      }
    }
    for (var key in catMap) {
      if (catOrder.indexOf(key) === -1) {
        result.push({ category: key, items: catMap[key] });
      }
    }
    return result;
  }

  /* ---------- FETCH DATA ---------- */
  function fetchData(isAutoRefresh) {
    if (!isAutoRefresh) {
      $skeleton.style.display = '';
      $cardsGrid.style.display = 'none';
      $emptyState.style.display = 'none';
      $errorState.style.display = 'none';
      setStatus('Đang tải dữ liệu...');
    }

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var signal = controller ? controller.signal : undefined;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, FETCH_TIMEOUT);

    fetch(GITHUB_API_URL, { signal: signal, headers: { 'Accept': 'application/vnd.github.v3+json' } })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (release) {
        var categorized = transformAssets(release.assets || []);
        processData(categorized, isAutoRefresh);
        if (!isAutoRefresh) {
          showToast('✅ Đã tải ' + (release.assets || []).length + ' ứng dụng');
        }
      })
      .catch(function (err) {
        clearTimeout(timer);
        showError(err.message);
      });
  }

  function processData(json, isAutoRefresh) {
    rawData = json;
    flatItems = [];
    categories = [];

    for (var c = 0; c < json.length; c++) {
      var cat = json[c];
      if (cat.category && categories.indexOf(cat.category) === -1) {
        categories.push(cat.category);
      }
      if (cat.items) {
        for (var i = 0; i < cat.items.length; i++) {
          flatItems.push(Object.assign({}, cat.items[i], { _category: cat.category, _uid: cat.category + '|' + i }));
        }
      }
    }

    if (!isAutoRefresh) {
      buildTabs();
    }
    applyFilters();
    $skeleton.style.display = 'none';
    $cardsGrid.style.display = '';
    $errorState.style.display = 'none';
    setStatus('🔄 Cập nhật lúc ' + timeStr() + ' • ' + flatItems.length + ' ứng dụng');
  }

  function showError(msg) {
    $skeleton.style.display = 'none';
    $cardsGrid.style.display = 'none';
    $emptyState.style.display = 'none';
    $errorState.style.display = '';
    document.getElementById('error-msg').textContent = 'Lỗi: ' + msg;
    setStatus('Lỗi tải dữ liệu');
  }

  /* ---------- TABS ---------- */
  function buildTabs() {
    var frag = document.createDocumentFragment();
    var allNames = [TAB_ALL].concat(categories);

    for (var i = 0; i < allNames.length; i++) {
      var btn = document.createElement('button');
      btn.className = 'tab-btn focusable';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('data-nav-group', 'tabs');
      btn.setAttribute('aria-selected', allNames[i] === activeTab ? 'true' : 'false');
      btn.setAttribute('tabindex', allNames[i] === activeTab ? '0' : '-1');
      btn.dataset.category = allNames[i];
      btn.textContent = allNames[i];
      frag.appendChild(btn);
    }

    $tabsBar.innerHTML = '';
    $tabsBar.appendChild(frag);
  }

  /* ---------- FILTER / RENDER ---------- */
  function applyFilters() {
    var items = flatItems.slice(); // copy

    // For "MỚI NHẤT" tab: sort by updated_at descending (latest first), no grouping
    if (activeTab === TAB_ALL) {
      items.sort(function (a, b) {
        var dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        var dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      // category filter
      items = items.filter(function (it) { return it._category === activeTab; });
    }

    // search filter
    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      items = items.filter(function (it) {
        return (it.name && it.name.toLowerCase().indexOf(q) !== -1) ||
          (it.desc && it.desc.toLowerCase().indexOf(q) !== -1) ||
          (it._category && it._category.toLowerCase().indexOf(q) !== -1);
      });
    }

    if (activeTab === TAB_ALL) {
      renderFlatList(items);
    } else {
      renderCategorySections(items);
    }
  }

  /* ---------- RENDER FLAT LIST (for "MỚI NHẤT" tab, sorted by date) ---------- */
  function renderFlatList(items) {
    $cardsGrid.innerHTML = '';

    if (items.length === 0) {
      $emptyState.style.display = '';
      return;
    }
    $emptyState.style.display = 'none';

    var frag = document.createDocumentFragment();

    // Single section with title
    var section = document.createElement('div');
    section.className = 'category-section';

    var titleWrap = document.createElement('div');
    titleWrap.className = 'category-title';
    var titleH3 = document.createElement('h3');
    titleH3.textContent = '⏰ Cập nhật gần đây (' + items.length + ')';
    titleWrap.appendChild(titleH3);
    section.appendChild(titleWrap);

    var grid = document.createElement('div');
    grid.className = 'category-grid';

    for (var j = 0; j < items.length; j++) {
      grid.appendChild(createCard(items[j]));
    }

    section.appendChild(grid);
    frag.appendChild(section);
    $cardsGrid.appendChild(frag);
  }

  function renderCategorySections(items) {
    $cardsGrid.innerHTML = '';

    if (items.length === 0) {
      $emptyState.style.display = '';
      return;
    }
    $emptyState.style.display = 'none';

    var grouped = {};
    var catOrder = [];
    for (var i = 0; i < items.length; i++) {
      var cat = items[i]._category || 'Khác';
      if (!grouped[cat]) {
        grouped[cat] = [];
        catOrder.push(cat);
      }
      grouped[cat].push(items[i]);
    }

    var frag = document.createDocumentFragment();

    for (var c = 0; c < catOrder.length; c++) {
      var catName = catOrder[c];
      var catItems = grouped[catName];

      var section = document.createElement('div');
      section.className = 'category-section';

      var titleWrap = document.createElement('div');
      titleWrap.className = 'category-title';
      var titleH3 = document.createElement('h3');
      titleH3.textContent = catName + ' (' + catItems.length + ')';
      titleWrap.appendChild(titleH3);
      section.appendChild(titleWrap);

      var grid = document.createElement('div');
      grid.className = 'category-grid';

      for (var j = 0; j < catItems.length; j++) {
        grid.appendChild(createCard(catItems[j]));
      }

      section.appendChild(grid);
      frag.appendChild(section);
    }

    $cardsGrid.appendChild(frag);
  }

  function createCard(it) {
    var card = document.createElement('a');
    card.className = 'app-card focusable';
    card.href = it.apk_url || '#';
    card.target = '_blank';
    card.rel = 'noopener';
    card.setAttribute('tabindex', '0');

    // === ICON: Bold initials + random emoji background ===
    var iconWrap = document.createElement('div');
    iconWrap.className = 'app-card__icon-wrap';

    var appName = it.name || 'App';
    var emoji = getRandomEmoji(appName);
    var colors = getRandomColors(appName);
    var initials = getAppInitials(appName);

    var iconEl = document.createElement('div');
    iconEl.className = 'app-card__icon-box';
    iconEl.style.background = 'linear-gradient(135deg, ' + colors[0] + ', ' + colors[1] + ')';

    // Emoji decoration (small, top-right corner)
    var emojiEl = document.createElement('span');
    emojiEl.className = 'icon-emoji';
    emojiEl.textContent = emoji;
    iconEl.appendChild(emojiEl);

    // Bold initials text (center, large)
    var initialsEl = document.createElement('span');
    initialsEl.className = 'icon-initials';
    initialsEl.textContent = initials;
    iconEl.appendChild(initialsEl);

    iconWrap.appendChild(iconEl);
    card.appendChild(iconWrap);

    // === INFO ===
    var info = document.createElement('div');
    info.className = 'app-card__info';

    var name = document.createElement('div');
    name.className = 'app-card__name';
    name.textContent = appName;
    info.appendChild(name);

    if (it.desc) {
      var desc = document.createElement('div');
      desc.className = 'app-card__desc';
      desc.textContent = it.desc;
      info.appendChild(desc);
    }

    // Meta: size + date only (no zodiac name)
    var meta = document.createElement('div');
    meta.className = 'app-card__meta';
    var parts = [];
    if (it.size) parts.push(formatSize(it.size));
    if (it.updated_at) parts.push(formatDate(it.updated_at));
    if (parts.length > 0) {
      meta.textContent = parts.join(' • ');
      info.appendChild(meta);
    }

    card.appendChild(info);
    return card;
  }

  function selectTab(category) {
    activeTab = category;
    var tabs = Array.prototype.slice.call($tabsBar.querySelectorAll('.tab-btn'));
    for (var i = 0; i < tabs.length; i++) {
      var sel = tabs[i].dataset.category === category;
      tabs[i].setAttribute('aria-selected', sel ? 'true' : 'false');
      tabs[i].setAttribute('tabindex', sel ? '0' : '-1');
    }
    applyFilters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- EVENT DELEGATION ---------- */
  $tabsBar.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab-btn');
    if (btn) selectTab(btn.dataset.category);
  });

  var searchDebounce = null;
  $searchInput.addEventListener('input', function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function () {
      searchQuery = $searchInput.value.trim();
      applyFilters();
    }, 180);
  });

  $btnRefresh.addEventListener('click', function () {
    showToast('🔄 Đang làm mới...');
    fetchData(false);
  });
  $btnTheme.addEventListener('click', toggleTheme);
  $btnRetry.addEventListener('click', function () { fetchData(false); });

  /* ============================================================
     D-PAD / REMOTE NAVIGATION (Android TV)
     ============================================================ */
  if (LAYOUT === 'tv') {
    (function () {
      var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 27 };

      function getAllFocusable() {
        return Array.prototype.slice.call(document.querySelectorAll('.focusable:not([style*="display: none"]):not([style*="display:none"])'));
      }

      function getTabButtons() {
        return Array.prototype.slice.call($tabsBar.querySelectorAll('.tab-btn'));
      }

      function getCardElements() {
        return Array.prototype.slice.call($cardsGrid.querySelectorAll('.app-card'));
      }

      // Get the currently focused element
      function getFocused() {
        return document.activeElement;
      }

      // Focus an element with scroll into view
      function focusElement(el) {
        if (!el) return;
        el.focus({ preventScroll: false });
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }

      // Find nearest element in a direction
      function findNearest(current, candidates, direction) {
        if (!current || candidates.length === 0) return null;

        var rect = current.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;

        var best = null;
        var bestDist = Infinity;

        for (var i = 0; i < candidates.length; i++) {
          var el = candidates[i];
          if (el === current) continue;

          var r = el.getBoundingClientRect();
          var ex = r.left + r.width / 2;
          var ey = r.top + r.height / 2;
          var dx = ex - cx;
          var dy = ey - cy;

          var valid = false;
          switch (direction) {
            case 'left': valid = dx < -10; break;
            case 'right': valid = dx > 10; break;
            case 'up': valid = dy < -10; break;
            case 'down': valid = dy > 10; break;
          }

          if (!valid) continue;

          // Distance weighted by direction
          var dist;
          if (direction === 'left' || direction === 'right') {
            dist = Math.abs(dx) + Math.abs(dy) * 3;
          } else {
            dist = Math.abs(dy) + Math.abs(dx) * 3;
          }

          if (dist < bestDist) {
            bestDist = dist;
            best = el;
          }
        }
        return best;
      }

      document.addEventListener('keydown', function (e) {
        var code = e.keyCode || e.which;
        var focused = getFocused();
        var isTab = focused && focused.classList.contains('tab-btn');
        var isCard = focused && focused.classList.contains('app-card');
        var isSearch = focused === $searchInput;

        // If typing in search, let it be (except arrows)
        if (isSearch && code !== KEY.DOWN && code !== KEY.UP && code !== KEY.BACK) return;

        switch (code) {
          case KEY.LEFT:
            e.preventDefault();
            if (isTab) {
              var tabs = getTabButtons();
              var idx = tabs.indexOf(focused);
              if (idx > 0) focusElement(tabs[idx - 1]);
            } else if (isCard) {
              var target = findNearest(focused, getCardElements(), 'left');
              if (target) focusElement(target);
              else {
                // Try tabs
                var tabs2 = getTabButtons();
                if (tabs2.length > 0) focusElement(tabs2[tabs2.length - 1]);
              }
            } else {
              var all = getAllFocusable();
              var i = all.indexOf(focused);
              if (i > 0) focusElement(all[i - 1]);
            }
            break;

          case KEY.RIGHT:
            e.preventDefault();
            if (isTab) {
              var tabs = getTabButtons();
              var idx = tabs.indexOf(focused);
              if (idx < tabs.length - 1) focusElement(tabs[idx + 1]);
            } else if (isCard) {
              var target = findNearest(focused, getCardElements(), 'right');
              if (target) focusElement(target);
            } else {
              var all = getAllFocusable();
              var i = all.indexOf(focused);
              if (i < all.length - 1) focusElement(all[i + 1]);
            }
            break;

          case KEY.UP:
            e.preventDefault();
            if (isCard) {
              var target = findNearest(focused, getCardElements(), 'up');
              if (target) {
                focusElement(target);
              } else {
                // Go to tabs
                var tabs = getTabButtons();
                var selTab = $tabsBar.querySelector('[aria-selected="true"]');
                focusElement(selTab || tabs[0]);
              }
            } else if (isTab) {
              // Go to topbar
              focusElement($btnRefresh);
            } else {
              var all = getAllFocusable();
              var i = all.indexOf(focused);
              if (i > 0) focusElement(all[i - 1]);
            }
            break;

          case KEY.DOWN:
            e.preventDefault();
            if (isTab || isSearch) {
              // Jump to first card
              var cards = getCardElements();
              if (cards.length > 0) focusElement(cards[0]);
            } else if (isCard) {
              var target = findNearest(focused, getCardElements(), 'down');
              if (target) focusElement(target);
            } else {
              // From topbar → tabs
              var selTab = $tabsBar.querySelector('[aria-selected="true"]');
              var tabs = getTabButtons();
              focusElement(selTab || tabs[0]);
            }
            break;

          case KEY.ENTER:
            if (isTab) {
              e.preventDefault();
              selectTab(focused.dataset.category);
              // After tab switch, focus first card
              setTimeout(function () {
                var cards = getCardElements();
                if (cards.length > 0) focusElement(cards[0]);
              }, 100);
            }
            // For cards: default <a> behavior handles it
            break;

          case KEY.BACK:
            // Could be used to go back to tabs from cards
            if (isCard) {
              e.preventDefault();
              var selTab = $tabsBar.querySelector('[aria-selected="true"]');
              if (selTab) focusElement(selTab);
            }
            break;
        }
      });

      // Auto-focus first tab on load
      setTimeout(function () {
        var selTab = $tabsBar.querySelector('[aria-selected="true"]');
        if (selTab) selTab.focus();
      }, 1500);
    })();
  }

  /* ---------- AUTO REFRESH ---------- */
  function startAutoRefresh() {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(function () { fetchData(true); }, REFRESH_INTERVAL);
  }

  /* ---------- DEVICE MODE INDICATOR ---------- */
  var DEVICE_INFO = {
    'android-tv': { icon: '📺', label: 'Android TV', color: '#2dd4bf' },
    'android':    { icon: '🤖', label: 'Android',    color: '#3dd68c' },
    'ios':        { icon: '🍎', label: 'iOS',        color: '#60a5fa' },
    'pc':         { icon: '🖥️', label: 'PC',         color: '#a78bfa' }
  };

  function showDeviceIndicator() {
    var info = DEVICE_INFO[DEVICE_MODE] || DEVICE_INFO['pc'];
    var indicator = document.createElement('span');
    indicator.className = 'device-indicator';
    indicator.innerHTML = ' • <span class="device-badge" style="background:' + info.color + '">' + info.icon + ' ' + info.label + '</span>';
    $statusLine.appendChild(indicator);
  }

  /* ---------- INIT ---------- */
  fetchData(false);
  startAutoRefresh();
  setTimeout(showDeviceIndicator, 2000);

})();
