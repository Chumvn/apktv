/* ============================================================
   app.js — KHO APP CHUM — Mobile-friendly App Catalog
   ============================================================ */
(function () {
  'use strict';

  /* ---------- CONSTANTS ---------- */
  var GITHUB_API_URL = 'https://api.github.com/repos/Chumvn/apktv/releases/tags/V1.0';
  var FETCH_TIMEOUT = 15000;
  var REFRESH_INTERVAL = 300000;
  var TOAST_DURATION = 2800;
  var TAB_ALL = 'MỚI NHẤT';

  /* ---------- APP CATALOG ---------- */
  var APP_CATALOG = {
    'cobalt.smarttube.beta100': { name: 'SmartTube Beta 100', desc: 'SmartTube — Cobalt build, beta 100', cat: 'YouTube / SmartTube' },
    'cobalt.youtube.tv100': { name: 'YouTube TV Cobalt 100', desc: 'YouTube TV — Cobalt build v100', cat: 'YouTube / SmartTube' },
    'cobalt.youtube.tv106': { name: 'YouTube TV Cobalt 106', desc: 'YouTube TV — Cobalt build v106', cat: 'YouTube / SmartTube' },
    'cobalt.youtube.tv107': { name: 'YouTube TV Cobalt 107', desc: 'YouTube TV — Cobalt build v107', cat: 'YouTube / SmartTube' },
    'cobalt106': { name: 'Cobalt 106', desc: 'Cobalt browser v106', cat: 'YouTube / SmartTube' },
    'cobalt107': { name: 'Cobalt 107', desc: 'Cobalt browser v107', cat: 'YouTube / SmartTube' },
    'hdotv-2.1.4': { name: 'HDo TV', desc: 'HDo TV v2.1.4 — Xem phim HD', cat: 'Xem phim / TV' },
    'hieuga': { name: 'HieuGa TV', desc: 'HieuGa — Xem phim, TV show', cat: 'Xem phim / TV' },
    'rapphimtv': { name: 'Rạp Phim TV', desc: 'Rạp Phim TV — Phim Việt Nam', cat: 'Xem phim / TV' },
    'dailymotion': { name: 'Dailymotion', desc: 'Dailymotion — Video streaming', cat: 'Xem phim / TV' },
    'nvc': { name: 'NVC TV', desc: 'NVC — Xem TV trực tuyến', cat: 'Xem phim / TV' },
    'SparkleTV': { name: 'SparkleTV', desc: 'SparkleTV — Xem kênh truyền hình', cat: 'Xem phim / TV' },
    'vlc': { name: 'VLC Media Player', desc: 'VLC — Trình phát đa phương tiện', cat: 'Xem phim / TV' },
    'kiki': { name: 'KiKi Player', desc: 'KiKi — Trình phát media', cat: 'Xem phim / TV' },
    'IPTV_PRO': { name: 'IPTV PRO', desc: 'IPTV PRO — Xem IPTV chuyên nghiệp', cat: 'IPTV' },
    'TiviMate_2.1.5_Premium': { name: 'TiviMate Premium', desc: 'TiviMate v2.1.5 Premium — IPTV Player', cat: 'IPTV' },
    'tivimate': { name: 'TiviMate', desc: 'TiviMate — IPTV Player', cat: 'IPTV' },
    'Televizo_byphaptx52022': { name: 'Televizo', desc: 'Televizo — IPTV player', cat: 'IPTV' },
    'OTT_Navigator_v1.7.3.2': { name: 'OTT Navigator', desc: 'OTT Navigator v1.7.3.2 — IPTV/OTT Player', cat: 'IPTV' },
    'Live+Channels': { name: 'Live Channels', desc: 'Live Channels — Kênh truyền hình trực tiếp', cat: 'IPTV' },
    'atvlauncher': { name: 'ATV Launcher', desc: 'ATV Launcher — Launcher cho Android TV', cat: 'Launcher' },
    'Google_TV_Home_1.0.499253741': { name: 'Google TV Home', desc: 'Google TV Home v1.0', cat: 'Launcher' },
    'HomeTV_Launcher_6.3.11': { name: 'HomeTV Launcher', desc: 'HomeTV Launcher v6.3.11', cat: 'Launcher' },
    'ProjectivyLauncher': { name: 'Projectivy Launcher', desc: 'Projectivy Launcher — Tùy biến', cat: 'Launcher' },
    'Projectivy_Launcher_v4.64': { name: 'Projectivy Launcher v4.64', desc: 'Projectivy Launcher v4.64', cat: 'Launcher' },
    'LM_ATV_-1.0.4_mod': { name: 'LM ATV Mod', desc: 'LM ATV v1.0.4 Mod', cat: 'Launcher' },
    'LM_FireTV_118': { name: 'LM FireTV', desc: 'LM FireTV v118 — Launcher cho Fire TV', cat: 'Launcher' },
    'AppDrawer': { name: 'AppDrawer', desc: 'AppDrawer — Ngăn kéo ứng dụng', cat: 'Launcher' },
    'AppDrawer_by_PremiumSeven__Dark_': { name: 'AppDrawer Dark', desc: 'AppDrawer by PremiumSeven (Dark)', cat: 'Launcher' },
    '_ATV_app__TV_AppsDrawer': { name: 'TV AppsDrawer', desc: 'ATV App — TV AppsDrawer', cat: 'Launcher' },
    'ES-File-Explorer-Premium-v4.4.3.2-Mod': { name: 'ES File Explorer v4.4.3.2', desc: 'ES File Explorer Premium Mod', cat: 'File Manager' },
    'ES_File_Explorer_File_Manager_Premium_v4.2.2.5': { name: 'ES File Explorer v4.2.2.5', desc: 'ES File Explorer Premium', cat: 'File Manager' },
    'File_Manager_-Premium-v3.7': { name: 'File Manager Premium v3.7', desc: 'File Manager Premium v3.7', cat: 'File Manager' },
    'File_Manager_v2.7.3': { name: 'File Manager v2.7.3', desc: 'File Manager v2.7.3', cat: 'File Manager' },
    'MiXplorer-Silver-6.70.3': { name: 'MiXplorer Silver v6.70.3', desc: 'MiXplorer Silver v6.70.3', cat: 'File Manager' },
    'MiXplorer-v6.69.2-Silver_b25122550-Mod': { name: 'MiXplorer Silver Mod', desc: 'MiXplorer v6.69.2 Silver Mod', cat: 'File Manager' },
    'X-plore_File_Manager_v4.19.10__Donate_': { name: 'X-plore v4.19.10', desc: 'X-plore File Manager Donate', cat: 'File Manager' },
    'rsfile': { name: 'RS File Manager', desc: 'RS File Manager — Quản lý tệp', cat: 'File Manager' },
    'TotalCmd_3.62d-v7a': { name: 'Total Commander v3.62d', desc: 'Total Commander (arm-v7a)', cat: 'File Manager' },
    'aptoidetv': { name: 'Aptoide TV', desc: 'Aptoide TV — Kho ứng dụng cho TV', cat: 'App Store' },
    'apkmirro': { name: 'APK Mirror', desc: 'APK Mirror — Tải APK an toàn', cat: 'App Store' },
    'apkup': { name: 'APK Uploader', desc: 'APK Uploader — Cài đặt APK', cat: 'App Store' },
    'baostore': { name: 'Bao Store', desc: 'Bao Store — Kho ứng dụng Việt', cat: 'App Store' },
    'DLStore': { name: 'DL Store', desc: 'DL Store — Cửa hàng ứng dụng', cat: 'App Store' },
    'emotnstore': { name: 'Emotn Store', desc: 'Emotn Store — App store cho TV Box', cat: 'App Store' },
    'hdplaystore': { name: 'HD Play Store', desc: 'HD Play Store — Kho ứng dụng HD', cat: 'App Store' },
    'mstore': { name: 'M Store', desc: 'M Store — Cửa hàng ứng dụng', cat: 'App Store' },
    'ttvstore': { name: 'TTV Store', desc: 'TTV Store — Kho ứng dụng TV', cat: 'App Store' },
    '1Tap_Cleaner_Pro_v5.08': { name: '1Tap Cleaner Pro', desc: '1Tap Cleaner Pro v5.08 — Dọn dẹp', cat: 'Tiện ích' },
    'atvTools_1.2.0_mod': { name: 'atvTools Mod', desc: 'atvTools v1.2.0 Mod', cat: 'Tiện ích' },
    'Button_Mapper_v3.22_322_': { name: 'Button Mapper', desc: 'Button Mapper v3.22 — Tùy chỉnh phím', cat: 'Tiện ích' },
    'Buttons_remapper_v1.24.1__PREMIUM_': { name: 'Buttons Remapper', desc: 'Buttons Remapper v1.24.1 Premium', cat: 'Tiện ích' },
    'tvQuickActions_Pro_v3.6.0__Patched_': { name: 'tvQuickActions Pro', desc: 'tvQuickActions Pro v3.6.0 Patched', cat: 'Tiện ích' },
    'tvQuickActions_v2.6.3_Patched': { name: 'tvQuickActions', desc: 'tvQuickActions v2.6.3 Patched', cat: 'Tiện ích' },
    'Set_Orientation': { name: 'Set Orientation', desc: 'Set Orientation — Xoay màn hình', cat: 'Tiện ích' },
    'Set_Orientation_mod': { name: 'Set Orientation Mod', desc: 'Set Orientation Mod', cat: 'Tiện ích' },
    'Set_Orientation_no_icon': { name: 'Set Orientation (No Icon)', desc: 'Set Orientation — Không icon', cat: 'Tiện ích' },
    'ferraridownloader': { name: 'Ferrari Downloader', desc: 'Ferrari Downloader — Trình tải xuống', cat: 'Tiện ích' },
    'sai': { name: 'SAI', desc: 'SAI — Cài đặt APK phân tách', cat: 'Tiện ích' },
    'ntp': { name: 'NTP', desc: 'NTP — Đồng bộ thời gian', cat: 'Tiện ích' },
    'Reboot_to_CoreELEC_5.0': { name: 'Reboot to CoreELEC', desc: 'Reboot to CoreELEC v5.0', cat: 'Tiện ích' },
    'TV': { name: 'TV App', desc: 'TV — Ứng dụng TV cơ bản', cat: 'Tiện ích' },
    'SendFilesToTV-1.4.22': { name: 'SendFilesToTV', desc: 'Send Files To TV v1.4.22', cat: 'Tiện ích' },
    '4.6.0': { name: 'Ứng dụng v4.6.0', desc: 'Ứng dụng bổ sung v4.6.0', cat: 'Tiện ích' },
    'adbtv-v1.12': { name: 'ADB TV v1.12', desc: 'ADB TV v1.12 — Điều khiển qua ADB', cat: 'ADB / Remote' },
    'Remote_ADB_5.0': { name: 'Remote ADB v5.0', desc: 'Remote ADB v5.0 — ADB từ xa', cat: 'ADB / Remote' },
    'Remote_ATV__No_Ads__6.0.3': { name: 'Remote ATV', desc: 'Remote ATV v6.0.3 No Ads', cat: 'ADB / Remote' },
    'supervoice': { name: 'Super Voice', desc: 'Super Voice — Giọng nói', cat: 'Voice / Input' },
    'supervoice-mod-ATV14': { name: 'Super Voice Mod ATV14', desc: 'Super Voice Mod — Android TV 14', cat: 'Voice / Input' },
    'supperVoice-2.2': { name: 'Super Voice v2.2', desc: 'Super Voice v2.2', cat: 'Voice / Input' },
    'mapvoice': { name: 'Map Voice', desc: 'Map Voice — Điều khiển giọng nói', cat: 'Voice / Input' }
  };

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

  /* ---------- TRANSFORM GITHUB ASSETS → CATEGORIZED DATA ---------- */
  function transformAssets(assets) {
    var catMap = {};
    var catOrder = ['YouTube / SmartTube', 'Xem phim / TV', 'IPTV', 'Launcher', 'File Manager', 'App Store', 'Tiện ích', 'ADB / Remote', 'Voice / Input', 'Khác'];

    for (var i = 0; i < assets.length; i++) {
      var asset = assets[i];
      var fileName = asset.name || '';
      var baseName = fileName.replace(/\.(apk|xapk)$/i, '');
      var info = APP_CATALOG[baseName];
      var catName = info ? info.cat : 'Khác';
      var appName = info ? info.name : baseName.replace(/[_-]/g, ' ');
      var appDesc = info ? info.desc : fileName;

      if (!catMap[catName]) catMap[catName] = [];
      catMap[catName].push({
        name: appName,
        desc: appDesc,
        apk_url: asset.browser_download_url
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
    setStatus('Cập nhật lúc ' + timeStr() + ' • ' + flatItems.length + ' ứng dụng');
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
          (it._category && it._category.toLowerCase().indexOf(q) !== -1) ||
          (it.developer && it.developer.toLowerCase().indexOf(q) !== -1);
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
      titleH3.textContent = catName;
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

    // Icon
    var iconWrap = document.createElement('div');
    iconWrap.className = 'app-card__icon-wrap';

    if (it.icon) {
      var img = document.createElement('img');
      img.className = 'app-card__icon';
      img.setAttribute('loading', 'lazy');
      img.setAttribute('alt', it.name || '');
      img.src = it.icon;
      img.onerror = function () {
        var ph = document.createElement('div');
        ph.className = 'app-card__icon-placeholder';
        ph.textContent = (it.name || '?')[0].toUpperCase();
        this.parentNode.replaceChild(ph, this);
      };
      iconWrap.appendChild(img);
    } else {
      var ph2 = document.createElement('div');
      ph2.className = 'app-card__icon-placeholder';
      ph2.textContent = (it.name || '?')[0].toUpperCase();
      iconWrap.appendChild(ph2);
    }
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

    if (it.developer || it.installs) {
      var meta = document.createElement('div');
      meta.className = 'app-card__meta';
      var parts = [];
      if (it.developer) parts.push(it.developer);
      if (it.installs) parts.push(it.installs);
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
  $btnRefresh.addEventListener('click', function () { fetchData(false); });
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
