/* ===================================================================
 *  CHUM STORE – Web, Android Mobile & Android TV Store
 *  - Tự động nhận diện thiết bị chuẩn xác (Android Mobile, Android TV & Web)
 *  - Danh sách sắp xếp tự động: File nào tải lên sau cùng hiện ở trên cùng
 *  - Thẻ ứng dụng hiển thị: Tên app, Package Name, Dung lượng (dl), Ngày cập nhật
 *  - Nhấn vào thẻ là tải & cài đặt luôn (không nút rườm rà)
 *  - Hỗ trợ D-Pad remote TV mượt mà, nhận APK Wi-Fi (App) / Tải App QR (Web)
 * =================================================================== */
(function () {
  'use strict';

  /* ===== CONFIGURATION ===== */
  var CONFIG = {
    GITHUB_OWNER: 'Chumvn',
    GITHUB_REPO: 'apktv',
    RELEASE_TAG: 'V1.0',
    CACHE_TTL_MS: 10 * 60 * 1000,
    FETCH_TIMEOUT_MS: 12000
  };

  /* ===== KNOWN PACKAGE NAME MAPPING & INFERENCE ===== */
  var KNOWN_PACKAGES = {
    'youtube': 'com.google.android.youtube.tv',
    'smarttube': 'com.liskovsoft.smarttubetv.beta',
    'smarttubenext': 'com.liskovsoft.smarttubetv.beta',
    'stube': 'com.liskovsoft.smarttubetv',
    'tivimate': 'ar.tvplayer.tv',
    'ottnavigator': 'studio.scillarium.ottnavigator',
    'ott': 'studio.scillarium.ottnavigator',
    'kodi': 'org.xbmc.kodi',
    'vlc': 'org.videolan.vlc',
    'mxplayer': 'com.mxtech.videoplayer.ad',
    'mxpro': 'com.mxtech.videoplayer.pro',
    'netflix': 'com.netflix.ninja',
    'spotify': 'com.spotify.tv.android',
    'vtvgo': 'vn.vtv.vtvgo',
    'fptplay': 'com.fptplay.activity',
    'fpt': 'com.fptplay.activity',
    'vieon': 'vn.vieon.ewales',
    'tv360': 'com.viettel.tv360',
    'mytv': 'com.vnpt.mytv.tv',
    'onplus': 'com.vtvcab.onplus',
    'galaxyplay': 'com.fimplus.activity',
    'clip': 'vn.cliptv.tv',
    'cliptv': 'vn.cliptv.tv',
    'vtv': 'vn.vtv.vtvgo',
    'monstertv': 'com.monstertv.player',
    'xemtv': 'vn.xemtv.live',
    'bongda': 'vn.bongdatv.live',
    'sendfiles': 'com.yablio.sendfilestotv',
    'sfttv': 'com.yablio.sendfilestotv',
    'cxfile': 'com.cxinventor.file.explorer',
    'cxexplorer': 'com.cxinventor.file.explorer',
    'esfile': 'com.estrongs.android.pop',
    'xplore': 'com.lonelycatgames.Xplore',
    'solidexplorer': 'pl.solidexplorer2',
    'mixplorer': 'com.mixplorer',
    'zarchiver': 'ru.zdevs.zarchiver',
    'adguard': 'com.adguard.android',
    'blokada': 'org.blokada.alarm.dnschanger',
    'warp': 'com.cloudflare.onedotonedotonedotone',
    '1111': 'com.cloudflare.onedotonedotonedotone',
    'nordvpn': 'com.nordvpn.android',
    'expressvpn': 'com.expressvpn.vpn',
    'protonvpn': 'ch.protonvpn.android',
    'surfshark': 'com.surfshark.vpnclient.android',
    'projectivy': 'com.spocky.projengmenu',
    'flauncher': 'me.efesser.flauncher',
    'atvlauncher': 'ca.dstudio.atvlauncher.pro',
    'wolf': 'com.wolf.firelauncher',
    'halalauncher': 'com.halalauncher.tv',
    'buttonmapper': 'flar2.homebutton',
    'tvquickactions': 'dev.vodik7.tvquickactions',
    'mouse': 'com.fluxii.android.mousetoggle',
    'CetusPlay': 'com.cetusplay.remoteservice',
    'zankremote': 'zank.remote',
    'teamviewer': 'com.teamviewer.quicksupport.market',
    'anydesk': 'com.anydesk.anydeskandroid',
    'airdroid': 'com.sand.airdroid',
    'adb': ' com.cgutman.androidremotedebugger',
    'shizuku': 'moe.shizuku.privileged.api',
    'sai': 'com.aefyr.sai',
    'apkmirror': 'com.apkmirror.helper.prod',
    'aptoide': 'cm.aptoidetv.pt',
    'aurora': 'com.aurora.store',
    'browser': 'com.tvwebbrowser.v22',
    'tvbro': 'com.phlox.tvwebbrowser',
    'puffin': 'com.cloudmosa.puffinTV',
    'jio': 'com.jio.web.androidtv',
    'chrome': 'com.android.chrome',
    'firefox': 'org.mozilla.tv.firefox',
    'brave': 'com.brave.browser',
    'kiwi': 'com.kiwibrowser.browser',
    'tiktok': 'com.zhiliaoapp.musically',
    'facebook': 'com.facebook.katana',
    'zalo': 'com.zing.zalo',
    'telegram': 'org.telegram.messenger',
    'stremio': 'com.stremio.one',
    'cloudstream': 'com.lagradost.cloudstream3',
    'hdo': 'com.hdobox.tv',
    'onstream': 'com.onstream.tv',
    'filmplus': 'com.filmplus.app',
    'beetv': 'com.beetv.app',
    'cinemahd': 'com.cinemahd.v2',
    'plex': 'com.plexapp.android',
    'jellyfin': 'org.jellyfin.androidtv',
    'emby': 'tv.emby.embyatv',
    'nova': 'org.courville.nova',
    'justplayer': 'com.brouken.player',
    'vimu': 'net.gtvbox.videoplayer',
    'perfectplayer': 'com.niklabs.pp',
    'iptv': 'ru.iptvremote.android.iptv',
    'iptvpro': 'ru.iptvremote.android.iptv.pro',
    'televizo': 'com.ottplay.ottplay',
    'sparkle': 'se.hedekonsult.sparkle',
    'implayer': 'com.myiptvonline.implayer',
    'smarters': 'com.nst.iptvsmarterstvbox',
    'xciptv': 'com.nathnetwork.xciptv',
    'lazada': 'com.lazada.android',
    'shopee': 'com.shopee.vn',
    'chumstore': 'com.chum.store'
  };

  /* ===== APP ICON MAPPING ===== */
  var APP_ICONS = [
    { keys: ['youtube', 'ytb', 'smarttube', 'stube', 'newpipe', 'revanced'], emoji: '▶️', bg: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
    { keys: ['tv', 'tivi', 'vtv', 'fpt', 'vieon', 'mytv', 'tv360', 'iptv', 'ott', 'tivimate', 'kodi', 'xemtv', 'monstertv', 'bongda', 'thethao', 'sport', 'live'], emoji: '📺', bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
    { keys: ['phim', 'movie', 'cinema', 'netflix', 'stremio', 'cloudstream', 'hdo', 'plex', 'jellyfin', 'film', 'anime', 'sub'], emoji: '🎬', bg: 'linear-gradient(135deg,#ec4899,#be185d)' },
    { keys: ['music', 'nhac', 'zing', 'spotify', 'mp3', 'sound', 'karaoke', 'radio'], emoji: '🎵', bg: 'linear-gradient(135deg,#10b981,#047857)' },
    { keys: ['vlc', 'mx', 'player', 'video', 'vimu', 'nova', 'justplayer'], emoji: '🎞️', bg: 'linear-gradient(135deg,#f97316,#c2410c)' },
    { keys: ['file', 'explorer', 'xplore', 'cx', 'esfile', 'zarchiver', 'sendfiles', 'sfttv', 'ftp', 'usb', 'manager', 'solid', 'mix'], emoji: '📁', bg: 'linear-gradient(135deg,#eab308,#a16207)' },
    { keys: ['vpn', '1111', 'warp', 'adguard', 'dns', 'proxy', 'block', 'security'], emoji: '🛡️', bg: 'linear-gradient(135deg,#06b6d4,#0e7490)' },
    { keys: ['browser', 'chrome', 'firefox', 'tvbro', 'puffin', 'web', 'coccoc', 'brave'], emoji: '🌐', bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
    { keys: ['launcher', 'atv', 'projectivy', 'wolf', 'flauncher', 'home', 'leanback'], emoji: '🏠', bg: 'linear-gradient(135deg,#6366f1,#4338ca)' },
    { keys: ['remote', 'mouse', 'chuot', 'key', 'button', 'mapper', 'control', 'adb', 'cast', 'airscreen', 'miracast'], emoji: '🎮', bg: 'linear-gradient(135deg,#14b8a6,#0f766e)' },
    { keys: ['clean', 'boost', 'ram', 'speed', 'test', 'benchmark', 'cpu', 'aida', 'info', 'tool', 'setting'], emoji: '⚡', bg: 'linear-gradient(135deg,#f59e0b,#b45309)' },
    { keys: ['store', 'chplay', 'aptoide', 'aurora', 'apk', 'chum'], emoji: '🛍️', bg: 'linear-gradient(135deg,#a855f7,#7e22ce)' },
    { keys: ['tiktok', 'facebook', 'fb', 'zalo', 'telegram', 'messenger', 'chat', 'social'], emoji: '💬', bg: 'linear-gradient(135deg,#0ea5e9,#0369a1)' }
  ];

  var DEFAULT_GRADIENTS = [
    'linear-gradient(135deg,#a3e635,#4d7c0f)',
    'linear-gradient(135deg,#f59e0b,#b45309)',
    'linear-gradient(135deg,#10b981,#047857)',
    'linear-gradient(135deg,#ef4444,#b91c1c)',
    'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    'linear-gradient(135deg,#ec4899,#be185d)',
    'linear-gradient(135deg,#06b6d4,#0e7490)',
    'linear-gradient(135deg,#f97316,#c2410c)'
  ];

  /* ===== STATE ===== */
  var allApps = [];
  var isLoading = false;
  var currentFocusIndex = -1;
  var focusables = [];
  var savedFilePkgMap = {}; // fileName -> pkgName
  var activeDownloadFileName = '';
  var isLanModalOpen = false;
  var selfUpdateApp = null;

  /* ===== DOM REFS ===== */
  var dom = {
    btnRefresh: document.getElementById('btn-refresh'),
    btnTheme: document.getElementById('btn-theme'),
    btnLanSend: document.getElementById('btn-lan-send'),
    skeleton: document.getElementById('skeleton'),
    cardsGrid: document.getElementById('cards-grid'),
    emptyState: document.getElementById('empty-state'),
    errorState: document.getElementById('error-state'),
    errorMsg: document.getElementById('error-msg'),
    btnRetry: document.getElementById('btn-retry'),
    toast: document.getElementById('toast'),
    dlBanner: document.getElementById('dl-banner'),
    dlBannerTitle: document.getElementById('dl-banner-title'),
    dlBannerStats: document.getElementById('dl-banner-stats'),
    dlBannerFill: document.getElementById('dl-banner-fill'),
    btnDlCancel: document.getElementById('btn-dl-cancel'),
    selfUpdateBanner: document.getElementById('self-update-banner'),
    selfUpdateMsg: document.getElementById('self-update-msg'),
    btnSelfUpdate: document.getElementById('btn-self-update'),
    lanOverlay: document.getElementById('lan-overlay'),
    btnLanClose: document.getElementById('btn-lan-close'),
    lanQrBox: document.getElementById('lan-qr-box'),
    lanUrlText: document.getElementById('lan-url-text'),
    lanStatusText: document.getElementById('lan-status-text'),
    lanModalIcon: document.getElementById('lan-modal-icon'),
    lanTitle: document.getElementById('lan-title'),
    lanModalSub: document.getElementById('lan-modal-sub'),
    lanStep1: document.getElementById('lan-step-1'),
    lanStep2: document.getElementById('lan-step-2'),
    lanStep3: document.getElementById('lan-step-3'),
    btnWebApkDl: document.getElementById('btn-web-apk-dl')
  };

  /* ===== ACCURATE DEVICE DETECTION (ANDROID MOBILE vs ANDROID TV vs DESKTOP WEB) ===== */
  function detectLayout() {
    // 1. Direct query string override
    var params = new URLSearchParams(window.location.search);
    var forced = params.get('layout') || params.get('mode');
    if (forced === 'tv' || forced === 'android-tv') return 'tv';
    if (forced === 'mobile' || forced === 'android') return 'mobile';
    if (forced === 'desktop' || forced === 'web' || forced === 'pc') return 'desktop';

    // 2. Direct query to native Java bridge
    if (window.ChumNative && typeof window.ChumNative.isAndroidTV === 'function') {
      try {
        return window.ChumNative.isAndroidTV() ? 'tv' : 'mobile';
      } catch (e) { /* ignore */ }
    }

    // 3. User-Agent TV signatures
    var ua = navigator.userAgent.toLowerCase();
    var isTV = /android tv|smarttv|googletv|crkey|aftb|aftt|aftm|afts|aftkmst|bravia|philipstv|tizen|web0s|webos|netcast|viera|hisense|vidaa|mibox|shield|leanback/i.test(ua);
    if (isTV) return 'tv';

    // 4. Mobile & tablet browser detection
    var isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
    if (isMobileUA) return 'mobile';

    // 5. Narrow mobile viewport fallback
    if (window.innerWidth > 0 && window.innerWidth <= 640) return 'mobile';

    // 6. Standard desktop / laptop web browser
    return 'desktop';
  }

  var LAYOUT = detectLayout();
  document.documentElement.setAttribute('data-layout', LAYOUT);

  // Authoritative callback callable from MainActivity.java
  window.setDeviceLayout = function (layout) {
    if (layout === 'tv' || layout === 'mobile' || layout === 'desktop') {
      LAYOUT = layout;
      document.documentElement.setAttribute('data-layout', layout);
      updateGridColumns();
      rebuildFocusables();
    }
  };

  /* ===== NATIVE PACKAGE SYNC ===== */
  function syncNativePackages() {
    if (!window.ChumNative) return;
    try {
      var rawFileMap = window.ChumNative.getSavedFilePackageMapJson();
      if (rawFileMap) {
        savedFilePkgMap = JSON.parse(rawFileMap) || {};
      }
    } catch (e) { /* ignore */ }
  }

  /* ===== CACHE STORAGE ===== */
  var CACHE_KEY = 'chum_store_apps_cache_v8';

  function getCachedData(allowExpired) {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.ts || !Array.isArray(obj.assets)) return null;
      if (!allowExpired && (Date.now() - obj.ts > CONFIG.CACHE_TTL_MS)) return null;
      return obj.assets;
    } catch (e) {
      return null;
    }
  }

  function setCachedData(assets) {
    try {
      var payload = {
        ts: Date.now(),
        assets: assets
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (e) { /* quota exceeded */ }
  }

  /* ===== STRING HELPERS ===== */
  function normalizeStr(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function cleanAppName(filename) {
    var name = filename.replace(/\.(apk|xapk|apks|apkm)$/i, '');
    name = name.replace(/[-_]+/g, ' ').trim();
    name = name.replace(/\bv?\d+(\.\d+)+[a-z0-9._-]*\b/gi, '').trim();
    name = name.replace(/\b(release|debug|signed|unsigned|mod|apk|tv|android|beta|premium|vip|pro)\b/gi, '').trim();
    name = name.replace(/\s{2,}/g, ' ');
    if (!name) name = filename.replace(/\.(apk|xapk|apks|apkm)$/i, '');
    return name.split(' ').map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 MB';
    var mb = bytes / (1024 * 1024);
    if (mb < 1) {
      var kb = bytes / 1024;
      return kb.toFixed(0) + ' KB';
    }
    return mb.toFixed(1) + ' MB';
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      var day = ('0' + d.getDate()).slice(-2);
      var month = ('0' + (d.getMonth() + 1)).slice(-2);
      var year = d.getFullYear();
      return day + '/' + month + '/' + year;
    } catch (e) {
      return '';
    }
  }

  /* ===== PACKAGE NAME RESOLUTION ===== */
  function resolvePackageName(fileName, cleanName) {
    // 1. Check if native bridge extracted and saved real Android package name from APK
    if (savedFilePkgMap && savedFilePkgMap[fileName]) {
      return savedFilePkgMap[fileName];
    }

    var fnNorm = normalizeStr(fileName).replace(/[^a-z0-9]/g, '');
    var cleanNorm = normalizeStr(cleanName).replace(/[^a-z0-9]/g, '');

    // 2. Direct dictionary matching
    for (var k in KNOWN_PACKAGES) {
      if (KNOWN_PACKAGES.hasOwnProperty(k)) {
        if (fnNorm.indexOf(k) !== -1 || cleanNorm.indexOf(k) !== -1) {
          return KNOWN_PACKAGES[k];
        }
      }
    }

    // 3. Reverse infer from package format if filename contains dots
    var dotMatch = fileName.match(/([a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z][a-zA-Z0-9_]*\.[a-zA-Z0-9_.]+)/);
    if (dotMatch && dotMatch[1]) {
      return dotMatch[1];
    }

    // 4. Default clean package slug
    var slug = normalizeStr(cleanName)
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 16);
    if (!slug) slug = 'app';
    return 'com.chum.' + slug;
  }

  /* ===== ICON GENERATOR ===== */
  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function getAppIconData(filename, cleanName) {
    var searchStr = normalizeStr(cleanName + ' ' + filename);

    for (var i = 0; i < APP_ICONS.length; i++) {
      var entry = APP_ICONS[i];
      for (var j = 0; j < entry.keys.length; j++) {
        if (searchStr.indexOf(entry.keys[j]) !== -1) {
          return { text: entry.emoji, bg: entry.bg, isEmoji: true };
        }
      }
    }

    var words = cleanName.split(/\s+/).filter(Boolean);
    var initials = '';
    if (words.length >= 2) {
      initials = (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      initials = words[0].slice(0, 2).toUpperCase();
    } else {
      initials = (cleanName.charAt(0) || 'A').toUpperCase();
    }

    var bg = DEFAULT_GRADIENTS[hashString(filename) % DEFAULT_GRADIENTS.length];
    return { text: initials, bg: bg, isEmoji: false };
  }

  /* ===== FETCH & PROCESS DATA ===== */
  function fetchApps(forceRefresh) {
    if (isLoading) return;
    isLoading = true;

    if (dom.btnRefresh) dom.btnRefresh.classList.add('spinning');
    dom.errorState.style.display = 'none';

    if (!forceRefresh) {
      var cached = getCachedData();
      if (cached && cached.length > 0) {
        processRawAssets(cached);
        isLoading = false;
        if (dom.btnRefresh) dom.btnRefresh.classList.remove('spinning');
        return;
      }
    }

    showSkeleton();

    var apiUrl = 'https://api.github.com/repos/' + CONFIG.GITHUB_OWNER + '/' + CONFIG.GITHUB_REPO + '/releases/tags/' + CONFIG.RELEASE_TAG;

    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var signal = controller ? controller.signal : undefined;
    var timeoutId = null;

    if (controller) {
      timeoutId = setTimeout(function () {
        controller.abort();
      }, CONFIG.FETCH_TIMEOUT_MS);
    }

    fetch(apiUrl, {
      signal: signal,
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    })
      .then(function (res) {
        if (timeoutId) clearTimeout(timeoutId);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        isLoading = false;
        if (dom.btnRefresh) dom.btnRefresh.classList.remove('spinning');
        if (!data || !Array.isArray(data.assets)) {
          throw new Error('Dữ liệu release không hợp lệ');
        }
        setCachedData(data.assets);
        processRawAssets(data.assets);
        showToast('✅ Đã đồng bộ kho ứng dụng');
      })
      .catch(function (err) {
        isLoading = false;
        if (dom.btnRefresh) dom.btnRefresh.classList.remove('spinning');
        var cached = getCachedData(true);
        if (cached && cached.length > 0) {
          processRawAssets(cached);
          showToast('⚠️ Đang dùng dữ liệu đệm (' + err.message + ')');
        } else {
          showErrorState('Không thể tải kho ứng dụng (' + err.message + '). Vui lòng kiểm tra mạng.');
        }
      });
  }

  function processRawAssets(assets) {
    syncNativePackages();

    var validExts = ['.apk', '.xapk', '.apks', '.apkm'];
    var rawList = assets.filter(function (a) {
      if (!a || !a.name) return false;
      var lower = a.name.toLowerCase();
      for (var i = 0; i < validExts.length; i++) {
        if (lower.indexOf(validExts[i]) !== -1) return true;
      }
      return false;
    });

    selfUpdateApp = null;
    var items = [];

    for (var i = 0; i < rawList.length; i++) {
      var a = rawList[i];
      var lower = a.name.toLowerCase();
      var cName = cleanAppName(a.name);

      // Check if self-update APK for CHUM STORE
      if (lower.indexOf('chum-store') !== -1 || lower.indexOf('chum_store') !== -1 || lower.indexOf('chumstore') !== -1) {
        selfUpdateApp = {
          name: a.name,
          cleanName: 'CHUM STORE',
          sizeFormatted: formatBytes(a.size || 0),
          dateFormatted: formatDate(a.updated_at || a.created_at),
          download_url: a.browser_download_url,
          updated_at: a.updated_at || a.created_at
        };
      }

      var pkg = resolvePackageName(a.name, cName);

      items.push({
        id: a.id || i,
        name: a.name,
        cleanName: cName,
        packageName: pkg,
        size: a.size || 0,
        sizeFormatted: formatBytes(a.size || 0),
        dateFormatted: formatDate(a.updated_at || a.created_at),
        created_at: a.created_at,
        updated_at: a.updated_at || a.created_at,
        download_url: a.browser_download_url,
        iconData: getAppIconData(a.name, cName)
      });
    }

    // CRITICAL REQUIREMENT: "cái nào tải lên sau cùng hiện trên cùng"
    // Sort descending by upload/update timestamp: newest upload appears at index 0
    items.sort(function (a, b) {
      var tA = new Date(a.updated_at || a.created_at || 0).getTime();
      var tB = new Date(b.updated_at || b.created_at || 0).getTime();
      return tB - tA;
    });

    allApps = items;
    hideSkeleton();
    renderCards();
    checkSelfUpdate();
  }

  /* ===== CARD ELEMENT (THẺ APK ĐƠN GIẢN: TÊN • PACKAGE • DL • NGÀY CẬP NHẬT) ===== */
  function createCardElement(app, index) {
    var card = document.createElement('div');
    card.className = 'app-card focusable';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-nav-group', 'cards');
    card.setAttribute('data-index', index);
    card.setAttribute('data-filename', app.name);
    card.setAttribute('aria-label', app.cleanName + ', ' + app.packageName + ', ' + app.sizeFormatted + ', ' + app.dateFormatted);

    // 1. Icon Squircle
    var icon = document.createElement('div');
    icon.className = 'app-card__icon' + (app.iconData.isEmoji ? ' app-card__icon--emoji' : '');
    icon.style.background = app.iconData.bg;
    icon.textContent = app.iconData.text;

    // 2. Info Block (Tên app, Package Name, Dung lượng, Ngày cập nhật)
    var info = document.createElement('div');
    info.className = 'app-card__info';

    // App Name
    var name = document.createElement('div');
    name.className = 'app-card__name';
    name.textContent = app.cleanName;
    name.title = app.name;

    // Package Name
    var pkgEl = document.createElement('div');
    pkgEl.className = 'app-card__pkg';
    pkgEl.textContent = '📦 ' + app.packageName;
    pkgEl.title = 'Package: ' + app.packageName;

    // Meta line: Dung lượng (dl) + Ngày cập nhật
    var meta = document.createElement('div');
    meta.className = 'app-card__meta';

    var bSize = document.createElement('span');
    bSize.className = 'badge-size';
    bSize.textContent = '💾 ' + app.sizeFormatted;
    meta.appendChild(bSize);

    if (app.dateFormatted) {
      var bDate = document.createElement('span');
      bDate.className = 'badge-date';
      bDate.textContent = '📅 ' + app.dateFormatted;
      meta.appendChild(bDate);
    }

    info.appendChild(name);
    info.appendChild(pkgEl);
    info.appendChild(meta);

    card.appendChild(icon);
    card.appendChild(info);

    // REQUIREMENT: Nhấn vào là tải luôn! Không hiện chữ cài đặt hoặc mở
    card.addEventListener('click', function (e) {
      e.preventDefault();
      triggerDownload(app);
    });

    return card;
  }

  function renderCards() {
    dom.cardsGrid.innerHTML = '';

    if (allApps.length === 0) {
      dom.cardsGrid.style.display = 'none';
      dom.emptyState.style.display = '';
      rebuildFocusables();
      return;
    }

    dom.emptyState.style.display = 'none';
    dom.cardsGrid.style.display = '';

    var frag = document.createDocumentFragment();
    for (var i = 0; i < allApps.length; i++) {
      frag.appendChild(createCardElement(allApps[i], i));
    }
    dom.cardsGrid.appendChild(frag);
    rebuildFocusables();
  }

  /* ===== 1-CLICK NATIVE IN-APP DOWNLOAD & INSTALL ===== */
  function triggerDownload(app) {
    if (!app || !app.download_url) return;

    activeDownloadFileName = app.name;

    if (window.ChumNative && typeof window.ChumNative.downloadAndInstall === 'function') {
      try {
        if (dom.dlBanner) {
          dom.dlBanner.style.display = 'block';
          dom.dlBannerTitle.textContent = '⬇️ Đang tải: ' + app.cleanName;
          dom.dlBannerStats.textContent = '0% • ' + app.sizeFormatted;
          dom.dlBannerFill.style.width = '0%';
        }
        window.ChumNative.downloadAndInstall(app.download_url, app.name, app.cleanName, true);
        return;
      } catch (e) { /* fallback */ }
    }

    showToast('⬇️ Đang tải: ' + app.cleanName + (app.sizeFormatted ? ' (' + app.sizeFormatted + ')' : ''));
    try {
      var a = document.createElement('a');
      a.href = app.download_url;
      a.setAttribute('download', app.name || '');
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (dlErr) {
      window.location.href = app.download_url;
    }
  }

  function formatSpeed(bps) {
    if (!bps || bps <= 0) return '0 KB/s';
    var mb = bps / (1024 * 1024);
    if (mb >= 1) return mb.toFixed(1) + ' MB/s';
    return Math.round(bps / 1024) + ' KB/s';
  }

  // Native progress callbacks: (fileName, percent, downloadedBytes, totalBytes, speedBps, status)
  window.onNativeDownloadProgress = function (fileName, progress, downloadedBytes, totalBytes, speedBps, status) {
    if (!dom.dlBanner) return;
    var pct = Math.min(100, Math.max(0, Number(progress) || 0));

    if (status === 'cancelled') {
      dom.dlBanner.style.display = 'none';
      return;
    }
    if (status && status.indexOf('error:') === 0) {
      dom.dlBanner.style.display = 'none';
      showToast('❌ Tải thất bại: ' + status.slice(6));
      return;
    }
    if (status === 'completed') {
      dom.dlBanner.style.display = 'block';
      dom.dlBannerTitle.textContent = '⚡ Đang mở trình cài đặt Android...';
      dom.dlBannerStats.textContent = '100% • Sẵn sàng';
      dom.dlBannerFill.style.width = '100%';
      setTimeout(function () {
        if (dom.dlBanner) dom.dlBanner.style.display = 'none';
      }, 3500);
      showToast('⚡ Mở cài đặt: ' + cleanAppName(fileName));
      return;
    }
    if (status === 'extracting_xapk') {
      dom.dlBanner.style.display = 'block';
      dom.dlBannerTitle.textContent = '📦 Đang giải nén: ' + cleanAppName(fileName);
      dom.dlBannerStats.textContent = '100% • Đang chuẩn bị cài đặt...';
      dom.dlBannerFill.style.width = '100%';
      return;
    }

    dom.dlBanner.style.display = 'block';
    dom.dlBannerTitle.textContent = '⬇️ Đang tải: ' + cleanAppName(fileName);
    var sizeText = (totalBytes > 0)
      ? (formatBytes(downloadedBytes) + ' / ' + formatBytes(totalBytes))
      : formatBytes(downloadedBytes);
    dom.dlBannerStats.textContent = pct + '% • ' + formatSpeed(speedBps) + (sizeText ? ' (' + sizeText + ')' : '');
    dom.dlBannerFill.style.width = pct + '%';
  };

  window.onNativeDownloadComplete = function (fileName) {
    if (dom.dlBanner) {
      dom.dlBannerTitle.textContent = '⚡ Đang mở trình cài đặt Android...';
      dom.dlBannerStats.textContent = '100% • Sẵn sàng';
      dom.dlBannerFill.style.width = '100%';
      setTimeout(function () {
        if (dom.dlBanner) dom.dlBanner.style.display = 'none';
      }, 3500);
    }
    showToast('⚡ Mở cài đặt: ' + cleanAppName(fileName));
  };

  window.onNativeDownloadFailed = function (fileName, errorMsg) {
    if (dom.dlBanner) {
      dom.dlBanner.style.display = 'none';
    }
    showToast('❌ Tải thất bại: ' + errorMsg);
  };

  /* ===== SELF-UPDATE CHECK ===== */
  function checkSelfUpdate() {
    if (!selfUpdateApp || !dom.selfUpdateBanner) return;
    if (!window.ChumNative || typeof window.ChumNative.getSelfAppInfoJson !== 'function') {
      dom.selfUpdateBanner.style.display = 'none';
      return;
    }
    try {
      var selfInfo = JSON.parse(window.ChumNative.getSelfAppInfoJson() || '{}');
      var assetTime = new Date(selfUpdateApp.updated_at || 0).getTime();
      var installedTime = selfInfo.lastUpdateTime || 0;
      if (assetTime > 0 && installedTime > 0 && assetTime > installedTime + 120000) {
        dom.selfUpdateBanner.style.display = 'flex';
        if (dom.selfUpdateMsg) {
          dom.selfUpdateMsg.textContent = 'Đã có bản CHUM STORE mới (' + selfUpdateApp.dateFormatted + ' • ' + selfUpdateApp.sizeFormatted + ') trên kho!';
        }
      } else {
        dom.selfUpdateBanner.style.display = 'none';
      }
    } catch (e) {
      dom.selfUpdateBanner.style.display = 'none';
    }
  }

  /* ===== LAN WI-FI APK RECEIVER (APP) & QR APP DOWNLOAD (WEB) ===== */
  var qrcodeInstance = null;
  function renderQr(text, fallbackEmoji) {
    if (!dom.lanQrBox) return;
    if (text && typeof QRCode !== 'undefined') {
      try {
        dom.lanQrBox.innerHTML = '';
        qrcodeInstance = new QRCode(dom.lanQrBox, {
          text: text,
          width: 142,
          height: 142,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
        return;
      } catch (qrErr) {
        if (dom.lanStatusText) dom.lanStatusText.textContent = '⚠️ ' + qrErr.message;
      }
    }
    dom.lanQrBox.innerHTML = '<div style="font-size:2.5rem;color:#000;">' + (fallbackEmoji || '📡') + '</div>';
  }

  function getWebApkUrl() {
    if (selfUpdateApp && selfUpdateApp.download_url) {
      return selfUpdateApp.download_url;
    }
    try {
      return new URL('./CHUM-STORE.apk', window.location.href).href;
    } catch (e) {
      return 'https://github.com/Chumvn/apktv/releases/download/V1.0/CHUM-STORE.apk';
    }
  }

  function openLanModal() {
    isLanModalOpen = true;
    dom.lanOverlay.style.display = 'flex';

    // Web Mode: Show direct App APK download button + QR code
    if (!window.ChumNative) {
      var apkUrl = getWebApkUrl();
      if (dom.lanModalIcon) dom.lanModalIcon.textContent = '📲';
      if (dom.lanTitle) dom.lanTitle.textContent = 'TẢI APP CHUM STORE (.APK)';
      if (dom.lanModalSub) dom.lanModalSub.textContent = 'Cài trên Điện thoại & Android TV để cài 1 chạm, tự dọn file APK & Nhận APK Wi-Fi';
      if (dom.lanStep1) dom.lanStep1.innerHTML = '1️⃣ Quét mã <b>QR bên cạnh</b> bằng camera Điện thoại để tải nhanh trên máy khác.';
      if (dom.lanStep2) dom.lanStep2.innerHTML = '2️⃣ Hoặc tải file <b>CHUM-STORE.apk</b> trực tiếp từ đường dẫn / nút bên dưới:';
      if (dom.lanStep3) dom.lanStep3.innerHTML = '3️⃣ Mở file <b>.APK</b> vừa tải để cài đặt app CHUM STORE lên thiết bị.';
      if (dom.lanUrlText) dom.lanUrlText.textContent = apkUrl;
      if (dom.btnWebApkDl) {
        dom.btnWebApkDl.href = apkUrl;
        dom.btnWebApkDl.style.display = 'inline-flex';
      }
      if (dom.lanStatusText) {
        var meta = selfUpdateApp ? (' (' + selfUpdateApp.sizeFormatted + ')') : '';
        dom.lanStatusText.textContent = '🟢 Bản cài đặt mới nhất' + meta + ' đã sẵn sàng tải xuống!';
      }
      renderQr(apkUrl, '📲');
      rebuildFocusables();
      return;
    }

    // Native App Mode: Embedded LAN Wi-Fi APK Receiver Server
    if (dom.lanModalIcon) dom.lanModalIcon.textContent = '📡';
    if (dom.lanTitle) dom.lanTitle.textContent = 'NHẬN FILE APK QUA WI-FI (LAN SEND)';
    if (dom.lanModalSub) dom.lanModalSub.textContent = 'Gửi bất kỳ file .APK / .XAPK nào từ Điện thoại sang thiết bị này';
    if (dom.lanStep1) dom.lanStep1.innerHTML = '1️⃣ Kết nối Điện thoại và TV vào <b>cùng một mạng Wi-Fi</b>.';
    if (dom.lanStep2) dom.lanStep2.innerHTML = '2️⃣ Quét mã QR bên cạnh hoặc mở trình duyệt truy cập:';
    if (dom.lanStep3) dom.lanStep3.innerHTML = '3️⃣ Chọn file <b>.APK / .XAPK</b> trên điện thoại — TV sẽ tự động nhận và mở bảng cài đặt ngay!';
    if (dom.btnWebApkDl) dom.btnWebApkDl.style.display = 'none';

    var fullUrl = '';
    try {
      if (typeof window.ChumNative.startLanServer === 'function') {
        fullUrl = window.ChumNative.startLanServer();
      }
      if (!fullUrl && typeof window.ChumNative.getLanServerUrl === 'function') {
        fullUrl = window.ChumNative.getLanServerUrl();
      }
    } catch (e) {
      if (dom.lanStatusText) dom.lanStatusText.textContent = '⚠️ Lỗi: ' + e.message;
    }

    if (!fullUrl) {
      var ip = (typeof window.ChumNative.getDeviceIpAddress === 'function') ? window.ChumNative.getDeviceIpAddress() : '';
      if (ip) {
        fullUrl = 'http://' + ip + ':8888';
      }
    }

    if (fullUrl) {
      if (dom.lanUrlText) dom.lanUrlText.textContent = fullUrl;
      if (dom.lanStatusText) {
        dom.lanStatusText.textContent = '🟢 Server Wi-Fi đang bật. Sẵn sàng nhận file!';
      }
      renderQr(fullUrl, '📡');
    } else {
      if (dom.lanUrlText) dom.lanUrlText.textContent = 'Chưa kết nối Wi-Fi';
      if (dom.lanStatusText) {
        dom.lanStatusText.textContent = '⚠️ Vui lòng kết nối Wi-Fi trên thiết bị để nhận APK.';
      }
      renderQr('', '📡');
    }

    rebuildFocusables();
  }

  function closeLanModal() {
    isLanModalOpen = false;
    dom.lanOverlay.style.display = 'none';
    if (window.ChumNative && typeof window.ChumNative.stopLanServer === 'function') {
      try { window.ChumNative.stopLanServer(); } catch (e) { /* ignore */ }
    }
    rebuildFocusables();
  }

  window.onNativeBackPressed = function () {
    if (isLanModalOpen) {
      closeLanModal();
      return true;
    }
    return false;
  };

  /* ===== TOAST NOTIFICATION ===== */
  var toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    dom.toast.textContent = msg;
    dom.toast.style.display = '';
    void dom.toast.offsetWidth;
    dom.toast.classList.add('show');

    toastTimer = setTimeout(function () {
      dom.toast.classList.remove('show');
      setTimeout(function () {
        dom.toast.style.display = 'none';
      }, 250);
    }, 2800);
  }

  /* ===== SKELETON & ERROR STATES ===== */
  function showSkeleton() {
    dom.skeleton.style.display = '';
    dom.cardsGrid.style.display = 'none';
  }

  function hideSkeleton() {
    dom.skeleton.style.display = 'none';
  }

  function showErrorState(msg) {
    hideSkeleton();
    dom.cardsGrid.style.display = 'none';
    dom.emptyState.style.display = 'none';
    dom.errorMsg.textContent = msg;
    dom.errorState.style.display = '';
    rebuildFocusables();
  }

  /* ===== D-PAD / REMOTE KEYBOARD NAVIGATION (ANDROID TV) ===== */
  function rebuildFocusables() {
    if (isLanModalOpen) {
      focusables = Array.prototype.slice.call(dom.lanOverlay.querySelectorAll('.lan-focusable')).filter(function (el) {
        return el.offsetParent !== null;
      });
      if (focusables.length > 0) {
        var defaultIdx = (!window.ChumNative && focusables.length > 1) ? 1 : 0;
        setFocus(defaultIdx);
      }
      return;
    }

    var all = document.querySelectorAll('.focusable');
    focusables = Array.prototype.slice.call(all).filter(function (el) {
      return el.offsetParent !== null;
    });

    if (currentFocusIndex >= focusables.length) {
      currentFocusIndex = focusables.length - 1;
    }

    if (LAYOUT === 'tv' && currentFocusIndex < 0 && focusables.length > 0) {
      // On TV, auto-focus first app card
      var firstCardIdx = -1;
      for (var i = 0; i < focusables.length; i++) {
        if (focusables[i].getAttribute('data-nav-group') === 'cards') {
          firstCardIdx = i;
          break;
        }
      }
      setFocus(firstCardIdx >= 0 ? firstCardIdx : 0);
    }
  }

  function setFocus(index) {
    if (index < 0 || index >= focusables.length) return;
    if (currentFocusIndex >= 0 && currentFocusIndex < focusables.length) {
      focusables[currentFocusIndex].classList.remove('tv-focused');
    }
    currentFocusIndex = index;
    var el = focusables[currentFocusIndex];
    el.classList.add('tv-focused');
    try {
      el.focus({ preventScroll: true });
    } catch (e1) {
      try { el.focus(); } catch (e2) {}
    }
    try {
      el.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    } catch (e3) {
      try { el.scrollIntoView(); } catch (e4) {}
    }
  }

  var cachedGridCols = 1;
  function updateGridColumns() {
    if (LAYOUT === 'tv') {
      cachedGridCols = window.innerWidth >= 1200 ? 3 : 2;
    } else {
      var w = window.innerWidth;
      if (w >= 1100) cachedGridCols = 3;
      else if (w >= 720) cachedGridCols = 2;
      else cachedGridCols = 1;
    }
  }
  window.addEventListener('resize', updateGridColumns);
  updateGridColumns();

  function getGridColumns() {
    return cachedGridCols;
  }

  function findGroupIndices(groupName) {
    var indices = [];
    for (var i = 0; i < focusables.length; i++) {
      if (focusables[i].getAttribute('data-nav-group') === groupName) {
        indices.push(i);
      }
    }
    return indices;
  }

  function handleKeyDown(e) {
    var key = e.key;

    if (isLanModalOpen) {
      if (key === 'Escape' || key === 'Backspace') {
        e.preventDefault();
        closeLanModal();
        return;
      }
      if (focusables.length > 0) {
        if (key === 'ArrowUp' || key === 'ArrowLeft') {
          e.preventDefault();
          setFocus(Math.max(0, (currentFocusIndex < 0 ? 0 : currentFocusIndex) - 1));
          return;
        }
        if (key === 'ArrowDown' || key === 'ArrowRight') {
          e.preventDefault();
          setFocus(Math.min(focusables.length - 1, (currentFocusIndex < 0 ? 0 : currentFocusIndex) + 1));
          return;
        }
        if (key === 'Enter') {
          e.preventDefault();
          var modalEl = focusables[currentFocusIndex >= 0 ? currentFocusIndex : 0];
          if (modalEl) modalEl.click();
          else closeLanModal();
          return;
        }
      } else if (key === 'Enter') {
        e.preventDefault();
        closeLanModal();
      }
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].indexOf(key) === -1) {
      return;
    }

    if (focusables.length === 0) return;

    if (currentFocusIndex < 0) {
      e.preventDefault();
      setFocus(0);
      return;
    }

    var cur = currentFocusIndex;

    var currentEl = focusables[cur];
    var currentGroup = currentEl ? currentEl.getAttribute('data-nav-group') : 'cards';

    if (key === 'Enter') {
      e.preventDefault();
      if (currentEl) currentEl.click();
      return;
    }

    var cols = getGridColumns();
    var topbarIndices = findGroupIndices('topbar');
    var cardIndices = findGroupIndices('cards');

    if (currentGroup === 'topbar') {
      var topPos = topbarIndices.indexOf(cur);
      if (key === 'ArrowRight') {
        e.preventDefault();
        if (topPos < topbarIndices.length - 1) {
          setFocus(topbarIndices[topPos + 1]);
        }
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        if (topPos > 0) {
          setFocus(topbarIndices[topPos - 1]);
        }
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        if (cardIndices.length > 0) {
          setFocus(cardIndices[0]);
        }
      }
    } else if (currentGroup === 'cards') {
      var cardPos = cardIndices.indexOf(cur);
      if (key === 'ArrowRight') {
        e.preventDefault();
        if (cardPos < cardIndices.length - 1) {
          setFocus(cardIndices[cardPos + 1]);
        }
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        if (cardPos > 0) {
          setFocus(cardIndices[cardPos - 1]);
        }
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        var nextDown = cardPos + cols;
        if (nextDown < cardIndices.length) {
          setFocus(cardIndices[nextDown]);
        } else if (cardPos < cardIndices.length - 1) {
          setFocus(cardIndices[cardIndices.length - 1]);
        }
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        var nextUp = cardPos - cols;
        if (nextUp >= 0) {
          setFocus(cardIndices[nextUp]);
        } else if (topbarIndices.length > 0) {
          setFocus(topbarIndices[0]);
        }
      }
    }
  }

  /* ===== THEME TOGGLE ===== */
  function initTheme() {
    var saved = localStorage.getItem('chum_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('chum_theme', next);
    showToast(next === 'dark' ? '🌙 Chế độ tối' : '☀️ Chế độ sáng');
  }

  /* ===== INITIALIZATION ===== */
  function init() {
    initTheme();

    if (dom.btnRefresh) {
      dom.btnRefresh.addEventListener('click', function () {
        fetchApps(true);
      });
    }

    if (dom.btnTheme) {
      dom.btnTheme.addEventListener('click', toggleTheme);
    }

    if (dom.btnRetry) {
      dom.btnRetry.addEventListener('click', function () {
        fetchApps(true);
      });
    }

    if (dom.btnLanSend) {
      if (!window.ChumNative) {
        var iconSpan = dom.btnLanSend.querySelector('.topbar-btn__icon');
        var labelSpan = dom.btnLanSend.querySelector('.topbar-btn__label');
        if (iconSpan) iconSpan.textContent = '📲';
        if (labelSpan) labelSpan.textContent = 'Tải App APK';
        dom.btnLanSend.setAttribute('aria-label', 'Tải ứng dụng CHUM STORE APK');
        dom.btnLanSend.setAttribute('title', 'Tải CHUM-STORE.apk hoặc quét QR cài đặt');
      }
      dom.btnLanSend.addEventListener('click', openLanModal);
    }

    if (dom.btnLanClose) {
      dom.btnLanClose.addEventListener('click', closeLanModal);
    }

    if (dom.lanOverlay) {
      dom.lanOverlay.addEventListener('click', function (e) {
        if (e.target === dom.lanOverlay) closeLanModal();
      });
    }

    if (dom.btnDlCancel) {
      dom.btnDlCancel.addEventListener('click', function () {
        if (window.ChumNative && typeof window.ChumNative.cancelDownload === 'function') {
          window.ChumNative.cancelDownload(activeDownloadFileName);
        }
        if (dom.dlBanner) dom.dlBanner.style.display = 'none';
        showToast('⏹️ Đã hủy tải ứng dụng.');
      });
    }

    if (dom.btnSelfUpdate) {
      dom.btnSelfUpdate.addEventListener('click', function () {
        if (selfUpdateApp) triggerDownload(selfUpdateApp);
      });
    }

    document.addEventListener('keydown', handleKeyDown);

    fetchApps(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
