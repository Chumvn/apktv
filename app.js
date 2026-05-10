/* ============================================================
   app.js — CHUM APP — Mobile-friendly App Catalog
   Auto-detect APKs from GitHub Releases + Random Zodiac Icons
   ============================================================ */
(function () {
  'use strict';

  /* ---------- CONSTANTS ---------- */
  var GITHUB_API_URL = 'https://api.github.com/repos/Chumvn/apktv/releases/tags/V1.0';
  var FETCH_TIMEOUT = 15000;
  var REFRESH_INTERVAL = 300000;
  var TOAST_DURATION = 2800;
  var TAB_ALL = 'MỚI NHẤT';

  /* ---------- 12 CON GIÁP (ZODIAC ANIMALS) ---------- */
  var ZODIAC_ANIMALS = [
    { emoji: '🐀', name: 'Tý (Chuột)', color: '#6366f1' },
    { emoji: '🐂', name: 'Sửu (Trâu)', color: '#8b5cf6' },
    { emoji: '🐅', name: 'Dần (Hổ)', color: '#f59e0b' },
    { emoji: '🐇', name: 'Mão (Mèo)', color: '#ec4899' },
    { emoji: '🐉', name: 'Thìn (Rồng)', color: '#ef4444' },
    { emoji: '🐍', name: 'Tỵ (Rắn)', color: '#10b981' },
    { emoji: '🐴', name: 'Ngọ (Ngựa)', color: '#f97316' },
    { emoji: '🐏', name: 'Mùi (Dê)', color: '#14b8a6' },
    { emoji: '🐒', name: 'Thân (Khỉ)', color: '#a855f7' },
    { emoji: '🐓', name: 'Dậu (Gà)', color: '#eab308' },
    { emoji: '🐕', name: 'Tuất (Chó)', color: '#3b82f6' },
    { emoji: '🐖', name: 'Hợi (Lợn)', color: '#e11d48' }
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
    // Clean up common patterns
    var name = baseName
      .replace(/[-_]+/g, ' ')   // replace dashes/underscores with spaces
      .replace(/\s+/g, ' ')     // collapse multiple spaces
      .trim();

    // Capitalize first letter of each word
    name = name.replace(/\b\w/g, function (c) { return c.toUpperCase(); });

    // Clean up version-like patterns for readability
    name = name
      .replace(/\bV(\d)/gi, 'v$1')        // normalize "V1" to "v1"
      .replace(/\bMod\b/gi, 'Mod')
      .replace(/\bPremium\b/gi, 'Premium')
      .replace(/\bPro\b/gi, 'Pro')
      .replace(/\bPatched\b/gi, 'Patched')
      .replace(/\bDonate\b/gi, 'Donate')
      .replace(/\bBeta\b/gi, 'Beta')
      .replace(/\bSilver\b/gi, 'Silver');

    return name;
  }

  /* ---------- HASH-BASED ZODIAC ASSIGNMENT ---------- */
  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  function getZodiacForApp(appName) {
    var index = hashString(appName) % ZODIAC_ANIMALS.length;
    return ZODIAC_ANIMALS[index];
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
      var zodiac = getZodiacForApp(baseName);

      if (!catMap[catName]) catMap[catName] = [];
      catMap[catName].push({
        name: appName,
        desc: fileName + ' — ' + zodiac.name,
        apk_url: asset.browser_download_url,
        zodiac: zodiac,
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
    // Add any remaining categories not in catOrder
    for (var key in catMap) {
      if (catOrder.indexOf(key) === -1) {
        result.push({ category: key, items: catMap[key] });
      }
    }
    return result;
  }

  /* ---------- FORMAT FILE SIZE ---------- */
  function formatSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
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
    setStatus('🔄 Cập nhật lúc ' + timeStr() + ' • ' + flatItems.length + ' ứng dụng • Tự động phân loại');
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
    var items = flatItems;

    // category filter
    if (activeTab !== TAB_ALL) {
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

    renderCategorySections(items);
  }

  function renderCategorySections(items) {
    $cardsGrid.innerHTML = '';

    if (items.length === 0) {
      $emptyState.style.display = '';
      return;
    }
    $emptyState.style.display = 'none';

    // Group items by category
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

      // Category section
      var section = document.createElement('div');
      section.className = 'category-section';

      // Section title
      var titleWrap = document.createElement('div');
      titleWrap.className = 'category-title';
      var titleH3 = document.createElement('h3');
      titleH3.textContent = catName + ' (' + catItems.length + ')';
      titleWrap.appendChild(titleH3);
      section.appendChild(titleWrap);

      // Items grid
      var grid = document.createElement('div');
      grid.className = 'category-grid';

      for (var j = 0; j < catItems.length; j++) {
        var it = catItems[j];
        grid.appendChild(createCard(it));
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

    // Zodiac Icon
    var iconWrap = document.createElement('div');
    iconWrap.className = 'app-card__icon-wrap';

    var zodiac = it.zodiac || getZodiacForApp(it.name || 'app');
    var zodiacEl = document.createElement('div');
    zodiacEl.className = 'app-card__icon-zodiac';
    zodiacEl.style.background = 'linear-gradient(135deg, ' + zodiac.color + ', ' + adjustColor(zodiac.color, 30) + ')';
    zodiacEl.innerHTML = '<span class="zodiac-emoji">' + zodiac.emoji + '</span>';
    iconWrap.appendChild(zodiacEl);

    card.appendChild(iconWrap);

    // Info
    var info = document.createElement('div');
    info.className = 'app-card__info';

    var name = document.createElement('div');
    name.className = 'app-card__name';
    name.textContent = it.name || 'Không rõ';
    info.appendChild(name);

    if (it.desc) {
      var desc = document.createElement('div');
      desc.className = 'app-card__desc';
      desc.textContent = it.desc;
      info.appendChild(desc);
    }

    // Size + zodiac meta
    var meta = document.createElement('div');
    meta.className = 'app-card__meta';
    var parts = [];
    if (it.size) parts.push(formatSize(it.size));
    parts.push(zodiac.emoji + ' ' + zodiac.name);
    meta.textContent = parts.join(' • ');
    info.appendChild(meta);

    card.appendChild(info);
    return card;
  }

  /* ---------- COLOR HELPER ---------- */
  function adjustColor(hex, amount) {
    var num = parseInt(hex.replace('#', ''), 16);
    var r = Math.min(255, (num >> 16) + amount);
    var g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
    var b = Math.min(255, (num & 0x0000FF) + amount);
    return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
  // Tabs click
  $tabsBar.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab-btn');
    if (btn) selectTab(btn.dataset.category);
  });

  // Search input
  var searchDebounce = null;
  $searchInput.addEventListener('input', function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function () {
      searchQuery = $searchInput.value.trim();
      applyFilters();
    }, 180);
  });

  // Buttons
  $btnRefresh.addEventListener('click', function () {
    showToast('🔄 Đang làm mới...');
    fetchData(false);
  });
  $btnTheme.addEventListener('click', toggleTheme);
  $btnRetry.addEventListener('click', function () { fetchData(false); });

  /* ---------- AUTO REFRESH ---------- */
  function startAutoRefresh() {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(function () { fetchData(true); }, REFRESH_INTERVAL);
  }

  /* ---------- INIT ---------- */
  fetchData(false);
  startAutoRefresh();

})();
