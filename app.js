/* ===================================================================
 *  CHUM STORE — SOFT UI EDITION
 *  - Giao diện Soft UI (Neumorphism) đồng bộ cả App Android/TV & Web
 *  - Tự động nhận diện thiết bị chuẩn xác (Android Mobile, Android TV, Desktop Web)
 *  - Danh sách sắp xếp tự động: File tải lên sau cùng hiện ở trên cùng
 *  - Đọc chính xác package name thực từ AndroidManifest.xml (HTTP Range + Map chuẩn)
 *  - Thẻ ứng dụng hiển thị: Tên app, Package chuẩn, Dung lượng, Giờ & Ngày cập nhật
 *  - Nhấn vào thẻ là tải & cài đặt luôn
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

  /* ===== VERIFIED EXACT PACKAGE MAP (FROM REAL AndroidManifest.xml) ===== */
  var EXACT_FILE_PACKAGES = {
    'gvoice-soft-ui.apk': 'com.gvoice.chum',
    'gvoice-chum.apk': 'com.gvoice.chum',
    'gvoice-ver-old.apk': 'com.gvoice.googletv',
    'gvoice-googletv.apk': 'com.gvoice.googletv',
    'g_mark.apk': 'com.chum.gmark',
    'gmark.apk': 'com.chum.gmark',
    'tizentubecobalt-arm-mod-packpage-youtube-tv.apk': 'com.google.android.youtube.tv',
    'tizencobalt-1.0.0-arm.apk': 'io.gh.reisxd.tizentube.cobalt',
    'gdel.apk': 'com.gdebloat',
    'gpowersoft.apk': 'com.gpowersoft',
    'g-power.apk': 'com.gpower',
    'gpower.apk': 'com.gpower',
    'youtube_xanh.apk': 'com.chum.youtube',
    'glaucher-v2.0.0.apk': 'com.chum.glaucher',
    'tiktok_tv-v12.3.4.1-tiktok_tv_patches-v1.0.0.apk': 'com.tiktok.tv',
    'chum_dl.apk': 'com.chum.dl',
    'chumdl.apk': 'com.chum.dl',
    'picsart_v31.2.6_clean.apk': 'com.picsart.studio',
    'wifimod_cleanmod.apk': 'com.halo.wifikey.wifilocating',
    'gpro-fb-lite-dualabi-v536.apk': 'com.gpro.facebook',
    'tv24h-v1.0.0.apk': 'com.tv24h.player',
    'xem-tv.apk': 'com.chum.xemtv',
    'chum-store.apk': 'com.chum.store',
    'x-plore.file.manager.v4.53.01.b45301.apk': 'com.lonelycatgames.Xplore',
    'tiktok-lite-android.apk': 'com.tiktok.lite.go',
    'tiktok-lite-androidtv.apk': 'com.zhiliaoapp.musically.go',
    'airreceiverlitev5.1.3-v8.apk': 'com.softmedia.receiver.lite',
    'airreceiverlite_v5.1.7-v7.apk': 'com.softmedia.receiver.lite',
    'brave-armv8-v2.8.0.apk': 'com.brave.browser',
    'brave-armv7-v2.8.0.apk': 'com.brave.browser',
    'televizo_1.9.9.43.apk': 'com.ottplay.ottplay',
    'custom.youtube.32.56_v7.apk': 'org.smarttuby.stable',
    'key_mapper_4.5.0_xs.apk': 'io.github.sds100.keymapper',
    'karaoke.3.57.apk': 'com.smartkaraoke.playerpro',
    'c.c.c.c.tv.browser.lite.1.6.apk': 'com.coccoc.trinhduyet_tvlite',
    'cobalt-smarttube-beta-android56.apk': 'org.smarttube.beta',
    'cobalt.smarttube.beta100_tizenmod.apk': 'com.liskovsoft.smarttubetv.beta',
    'com.vproject.vapptv_1.0.2_3.apk': 'com.vproject.vapptv',
    'imou.apk': 'com.imoulife.phap',
    'tatcaapp.apk': 'net.easyjoin.applauncher',
    'vaxapp.apk': 'com.vaapp.app',
    'localsend-1.17.0-android-arm64v8.1.apk': 'org.localsend.localsend_app',
    'localsend-1.17.0-android-arm32v7.apk': 'org.localsend.localsend_app',
    'vietplaytv.apk': 'com.nghenhin24h.vietplaytv',
    'buttons_remapper_v1.24.1__premium_.apk': 'com.irishin.buttonsremapper',
    'aptoidetv.apk': 'cm.aptoidetv.pt',
    'cobalt.youtube.tv100.apk': 'com.google.android.youtube.tv',
    'cobalt.smarttube.beta100.apk': 'com.liskovsoft.videomanager.beta',
    'chumtv.apk': 'vn.chumtv.launcher',
    'xem.tv365-v3.apk': 'com.tvonline.hdtv',
    'chumvoice.apk': 'vn.chum.voice',
    'chum_home.apk': 'com.chum.home',
    'chumqr.apk': 'com.chumqr.app',
    'chumtick.apk': 'com.chumtick.camera'
  };

  /* Ordered longest / most-specific patterns (avoids substring collisions) */
  var ORDERED_PACKAGE_PATTERNS = [
    ['tizentubecobalt', 'com.google.android.youtube.tv'],
    ['modpackpageyoutubetv', 'com.google.android.youtube.tv'],
    ['tizencobalt', 'io.gh.reisxd.tizentube.cobalt'],
    ['youtube_xanh', 'com.chum.youtube'],
    ['youtubexanh', 'com.chum.youtube'],
    ['youtube_chum', 'com.chum.youtube'],
    ['youtubechum', 'com.chum.youtube'],
    ['customyoutube', 'org.smarttuby.stable'],
    ['smarttubebetaandroid56', 'org.smarttube.beta'],
    ['beta100tizenmod', 'com.liskovsoft.smarttubetv.beta'],
    ['smarttubebeta100', 'com.liskovsoft.videomanager.beta'],
    ['cobaltyoutubetv', 'com.google.android.youtube.tv'],
    ['gvoicesoftui', 'com.gvoice.chum'],
    ['gvoicechum', 'com.gvoice.chum'],
    ['gvoiceverold', 'com.gvoice.googletv'],
    ['gvoicegoogletv', 'com.gvoice.googletv'],
    ['gpowersoft', 'com.gpowersoft'],
    ['g-power', 'com.gpower'],
    ['gpower', 'com.gpower'],
    ['gmark', 'com.chum.gmark'],
    ['g_mark', 'com.chum.gmark'],
    ['gdel', 'com.gdebloat'],
    ['glaucher', 'com.chum.glaucher'],
    ['gpro-fb', 'com.gpro.facebook'],
    ['gprofblite', 'com.gpro.facebook'],
    ['chum-store', 'com.chum.store'],
    ['chumstore', 'com.chum.store'],
    ['chum_dl', 'com.chum.dl'],
    ['chumdl', 'com.chum.dl'],
    ['chumtv', 'vn.chumtv.launcher'],
    ['chumvoice', 'vn.chum.voice'],
    ['chumtick', 'com.chumtick.camera'],
    ['chumqr', 'com.chumqr.app'],
    ['chum_home', 'com.chum.home'],
    ['luuweb', 'com.chum.luuweb'],
    ['xem-tv', 'com.chum.xemtv'],
    ['xemtv365', 'com.tvonline.hdtv'],
    ['tv365', 'com.tvonline.hdtv'],
    ['tv24h', 'com.tv24h.player'],
    ['vietplaytv', 'com.nghenhin24h.vietplaytv'],
    ['tiktok_tv', 'com.tiktok.tv'],
    ['tiktoktv', 'com.tiktok.tv'],
    ['tiktok-lite-androidtv', 'com.zhiliaoapp.musically.go'],
    ['tiktokliteandroidtv', 'com.zhiliaoapp.musically.go'],
    ['tiktok-lite-android', 'com.tiktok.lite.go'],
    ['tiktokliteandroid', 'com.tiktok.lite.go'],
    ['airreceiver', 'com.softmedia.receiver.lite'],
    ['localsend', 'org.localsend.localsend_app'],
    ['x-plore', 'com.lonelycatgames.Xplore'],
    ['xplore', 'com.lonelycatgames.Xplore'],
    ['televizo', 'com.ottplay.ottplay'],
    ['key_mapper', 'io.github.sds100.keymapper'],
    ['keymapper', 'io.github.sds100.keymapper'],
    ['buttons_remapper', 'com.irishin.buttonsremapper'],
    ['buttonsremapper', 'com.irishin.buttonsremapper'],
    ['tvquickactions', 'dev.vodik7.tvquickactions'],
    ['c.c.c.c', 'com.coccoc.trinhduyet_tvlite'],
    ['cccctv', 'com.coccoc.trinhduyet_tvlite'],
    ['coccoc', 'com.coccoc.trinhduyet_tvlite'],
    ['wifimod', 'com.halo.wifikey.wifilocating'],
    ['picsart', 'com.picsart.studio'],
    ['karaoke', 'com.smartkaraoke.playerpro'],
    ['brave', 'com.brave.browser'],
    ['imou', 'com.imoulife.phap'],
    ['tatcaapp', 'net.easyjoin.applauncher'],
    ['vaxapp', 'com.vaapp.app'],
    ['aptoide', 'cm.aptoidetv.pt'],
    ['smarttubenext', 'com.liskovsoft.smarttubetv.beta'],
    ['smarttube', 'org.smarttube.beta'],
    ['tivimate', 'ar.tvplayer.tv'],
    ['ottnavigator', 'studio.scillarium.ottnavigator'],
    ['kodi', 'org.xbmc.kodi'],
    ['vlc', 'org.videolan.vlc'],
    ['vtvgo', 'vn.vtv.vtvgo'],
    ['fptplay', 'com.fptplay.activity'],
    ['vieon', 'vn.vieon.ewales'],
    ['zalo', 'com.zing.zalo'],
    ['telegram', 'org.telegram.messenger'],
    ['projectivy', 'com.spocky.projengmenu'],
    ['adguard', 'com.adguard.android'],
    ['shizuku', 'moe.shizuku.privileged.api']
  ];

  /* ===== FRIENDLY TITLE OVERRIDES & ICON MAPPING ===== */
  var EXACT_FRIENDLY_NAMES = {
    'tizentubecobalt-arm-mod-packpage-youtube-tv.apk': 'TizenTube Cobalt (YouTube TV)',
    'c.c.c.c.tv.browser.lite.1.6.apk': 'Cốc Cốc TV Browser Lite',
    'x-plore.file.manager.v4.53.01.b45301.apk': 'X-plore File Manager',
    'tiktok_tv-v12.3.4.1-tiktok_tv_patches-v1.0.0.apk': 'TikTok TV',
    'tiktok-lite-android.apk': 'TikTok Lite (Điện thoại)',
    'tiktok-lite-androidtv.apk': 'TikTok Lite (Android TV)',
    'xem-tv.apk': 'XEM TV',
    'chum_dl.apk': 'CHUM DL',
    'chum-store.apk': 'CHUM STORE',
    'g_mark.apk': 'G MARK',
    'gvoice-soft-ui.apk': 'GVoice Soft UI',
    'gvoice-ver-old.apk': 'GVoice Old',
    'gpro-fb-lite-dualabi-v536.apk': 'GPro Facebook Lite',
    'wifimod_cleanmod.apk': 'WiFi Master CleanMod',
    'picsart_v31.2.6_clean.apk': 'Picsart Clean',
    'tizencobalt-1.0.0-arm.apk': 'TizenTube Cobalt',
    'custom.youtube.32.56_v7.apk': 'Custom YouTube (SmartTube)',
    'cobalt-smarttube-beta-android56.apk': 'SmartTube Beta (Android 5/6)',
    'cobalt.smarttube.beta100_tizenmod.apk': 'SmartTube Beta (TizenMod)',
    'cobalt.smarttube.beta100.apk': 'Cobalt SmartTube Beta 100',
    'cobalt.youtube.tv100.apk': 'YouTube TV Cobalt 100',
    'buttons_remapper_v1.24.1__premium_.apk': 'Buttons Remapper Premium',
    'localsend-1.17.0-android-arm64v8.1.apk': 'LocalSend (ARM64-v8)',
    'localsend-1.17.0-android-arm32v7.apk': 'LocalSend (ARM32-v7)',
    'airreceiverlitev5.1.3-v8.apk': 'AirReceiver Lite (v8)',
    'airreceiverlite_v5.1.7-v7.apk': 'AirReceiver Lite (v7)',
    'brave-armv8-v2.8.0.apk': 'Brave Browser (ARMv8)',
    'brave-armv7-v2.8.0.apk': 'Brave Browser (ARMv7)',
    'com.vproject.vapptv_1.0.2_3.apk': 'VApp TV',
    'tatcaapp.apk': 'Tất Cả App',
    'aptoidetv.apk': 'Aptoide TV'
  };

  var APP_ICONS = [
    { keys: ['youtube', 'ytb', 'smarttube', 'stube', 'tizen', 'cobalt'], emoji: '▶️', bg: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
    { keys: ['voice', 'gvoice', 'mic'], emoji: '🎙️', bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
    { keys: ['xem', 'tv24h', 'vtv', 'fpt', 'vieon', 'mytv', 'iptv', 'ott', 'televizo', 'tivimate', 'kodi', 'vietplay', 'vax', 'vapptv'], emoji: '📺', bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
    { keys: ['phim', 'movie', 'cinema', 'netflix', 'stremio', 'film'], emoji: '🎬', bg: 'linear-gradient(135deg,#ec4899,#be185d)' },
    { keys: ['karaoke', 'music', 'nhac', 'zing', 'spotify', 'mp3'], emoji: '🎵', bg: 'linear-gradient(135deg,#10b981,#047857)' },
    { keys: ['x-plore', 'xplore', 'file', 'localsend', 'sendfiles', 'zarchiver'], emoji: '📁', bg: 'linear-gradient(135deg,#f59e0b,#b45309)' },
    { keys: ['wifi', 'vpn', 'adguard', 'imou', 'gdel'], emoji: '🛡️', bg: 'linear-gradient(135deg,#06b6d4,#0e7490)' },
    { keys: ['browser', 'chrome', 'firefox', 'brave', 'c.c.c.c', 'coccoc'], emoji: '🌐', bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
    { keys: ['launcher', 'glaucher', 'projectivy', 'tatcaapp', 'chumtv'], emoji: '🏠', bg: 'linear-gradient(135deg,#6366f1,#4338ca)' },
    { keys: ['key_mapper', 'mapper', 'buttons', 'quickactions', 'airreceiver'], emoji: '🎮', bg: 'linear-gradient(135deg,#14b8a6,#0f766e)' },
    { keys: ['power', 'gpowersoft', 'gmark', 'g_mark', 'chum_dl', 'chumdl'], emoji: '⚡', bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
    { keys: ['store', 'aptoide', 'chum-store', 'chumstore'], emoji: '🛒', bg: 'linear-gradient(135deg,#3b6bf6,#2563eb)' },
    { keys: ['tiktok', 'facebook', 'fb-lite', 'zalo', 'telegram', 'picsart'], emoji: '💬', bg: 'linear-gradient(135deg,#0ea5e9,#0369a1)' }
  ];

  var DEFAULT_GRADIENTS = [
    'linear-gradient(135deg,#3b6bf6,#2563eb)',
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
  var savedFilePkgMap = {}; // fileName -> real packageName
  var cardPkgElements = {}; // fileName -> DOM element for live update
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
    dlBannerBadge: document.getElementById('dl-banner-badge'),
    dlBannerTitle: document.getElementById('dl-banner-title'),
    dlBannerPct: document.getElementById('dl-banner-pct'),
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

  /* ===== DEVICE DETECTION (ANDROID MOBILE vs ANDROID TV vs DESKTOP WEB) ===== */
  function detectLayout() {
    var params = new URLSearchParams(window.location.search);
    var forced = params.get('layout') || params.get('mode');
    if (forced === 'tv' || forced === 'android-tv') return 'tv';
    if (forced === 'mobile' || forced === 'android') return 'mobile';
    if (forced === 'desktop' || forced === 'web' || forced === 'pc') return 'desktop';

    if (window.ChumNative && typeof window.ChumNative.isAndroidTV === 'function') {
      try {
        return window.ChumNative.isAndroidTV() ? 'tv' : 'mobile';
      } catch (e) { /* ignore */ }
    }

    var ua = navigator.userAgent.toLowerCase();
    var isTV = /android tv|smarttv|googletv|crkey|aftb|aftt|aftm|afts|aftkmst|bravia|philipstv|tizen|web0s|webos|netcast|viera|hisense|vidaa|mibox|shield|leanback/i.test(ua);
    if (isTV) return 'tv';

    var isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua);
    if (isMobileUA) return 'mobile';

    if (window.innerWidth > 0 && window.innerWidth <= 640) return 'mobile';

    return 'desktop';
  }

  var LAYOUT = detectLayout();
  document.documentElement.setAttribute('data-layout', LAYOUT);

  window.setDeviceLayout = function (layout) {
    if (layout === 'tv' || layout === 'mobile' || layout === 'desktop') {
      LAYOUT = layout;
      document.documentElement.setAttribute('data-layout', layout);
      updateGridColumns();
      rebuildFocusables();
    }
  };

  /* ===== NATIVE PACKAGE SYNC & REMOTE ANDROIDMANIFEST INSPECTION ===== */
  function syncNativePackages() {
    if (!window.ChumNative) return;
    try {
      var rawFileMap = window.ChumNative.getSavedFilePackageMapJson();
      if (rawFileMap) {
        savedFilePkgMap = JSON.parse(rawFileMap) || {};
      }
    } catch (e) { /* ignore */ }
  }

  var remoteResolveTimer = null;

  function triggerNativeRemotePackageResolve(rawList) {
    if (!window.ChumNative || typeof window.ChumNative.resolveRemotePackagesAsync !== 'function') return;
    if (remoteResolveTimer) clearTimeout(remoteResolveTimer);
    remoteResolveTimer = setTimeout(function () {
      try {
        var unresolved = [];
        for (var i = 0; i < rawList.length; i++) {
          var a = rawList[i];
          var fn = a && a.name ? a.name : '';
          var lower = fn.toLowerCase();
          if (!fn || lower.slice(-4) !== '.apk') continue;
          if (EXACT_FILE_PACKAGES[lower] || savedFilePkgMap[fn]) continue;
          unresolved.push({
            name: fn,
            url: a.browser_download_url,
            size: a.size || 0,
            updated_at: a.updated_at || a.created_at || ''
          });
        }
        if (unresolved.length > 0) {
          window.ChumNative.resolveRemotePackagesAsync(JSON.stringify(unresolved));
        }
      } catch (e) { /* ignore */ }
    }, 650);
  }

  window.onNativeRemotePackagesResolved = function (resolvedMap) {
    if (!resolvedMap || typeof resolvedMap !== 'object') return;
    for (var fileName in resolvedMap) {
      if (!resolvedMap.hasOwnProperty(fileName)) continue;
      var realPkg = resolvedMap[fileName];
      if (!realPkg || realPkg.indexOf('.') === -1) continue;
      savedFilePkgMap[fileName] = realPkg;
      for (var i = 0; i < allApps.length; i++) {
        if (allApps[i].name === fileName) {
          allApps[i].packageName = realPkg;
          break;
        }
      }
      var el = cardPkgElements[fileName];
      if (el) {
        el.textContent = '📦 ' + realPkg;
        el.title = 'Package chuẩn: ' + realPkg;
      }
    }
  };

  window.onNativeApkParsed = function (fileName, pkgName) {
    if (!fileName || !pkgName) return;
    var obj = {};
    obj[fileName] = pkgName;
    window.onNativeRemotePackagesResolved(obj);
  };

  /* ===== CACHE STORAGE ===== */
  var CACHE_KEY = 'chum_store_apps_cache_v9';

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
      var payload = { ts: Date.now(), assets: assets };
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (e) { /* quota exceeded */ }
  }

  /* ===== STRING & DATE/TIME HELPERS ===== */
  function normalizeStr(str) {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function cleanAppName(filename) {
    var lowerFn = filename.toLowerCase();
    if (EXACT_FRIENDLY_NAMES[lowerFn]) {
      return EXACT_FRIENDLY_NAMES[lowerFn];
    }
    var name = filename.replace(/\.(apk|xapk|apks|apkm)$/i, '');
    // Replace separators carefully while preserving hyphens in common product names like X-plore
    name = name.replace(/[_]+/g, ' ').replace(/\.(?!\d)/g, ' ');
    // Strip version chunks like v1.2.3, 32.56, v2.8.0, b45301, 1.0.0
    name = name.replace(/\bv?\d+(\.\d+)+[a-z0-9._-]*\b/gi, ' ');
    name = name.replace(/\bb\d{4,}\b/gi, ' ');
    name = name.replace(/[-]+/g, ' ');
    name = name.replace(/\b(release|debug|signed|unsigned|apk|dualabi|arm64v8|arm32v7|armv8|armv7|arm)\b/gi, ' ');
    name = name.replace(/\s{2,}/g, ' ').trim();
    if (!name) name = filename.replace(/\.(apk|xapk|apks|apkm)$/i, '');
    return name.split(' ').map(function (w) {
      if (w.toUpperCase() === w && w.length >= 2) return w;
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

  // Format BOTH Time (HH:mm) AND Date (DD/MM/YYYY) in local timezone
  function formatDateTime(isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      var hours = ('0' + d.getHours()).slice(-2);
      var mins = ('0' + d.getMinutes()).slice(-2);
      var day = ('0' + d.getDate()).slice(-2);
      var month = ('0' + (d.getMonth() + 1)).slice(-2);
      var year = d.getFullYear();
      return hours + ':' + mins + ' • ' + day + '/' + month + '/' + year;
    } catch (e) {
      return '';
    }
  }

  /* ===== PACKAGE NAME RESOLUTION (EXACT + REAL MANIFEST) ===== */
  function isValidAndroidPackage(pkg) {
    if (!pkg || typeof pkg !== 'string') return false;
    var parts = pkg.split('.');
    if (parts.length < 3) return false;
    if (/^\d/.test(parts[0]) || /^v\d+$/i.test(parts[0])) return false;
    var prefixOk = /^(com|org|net|io|vn|ai|dev|me|cm|ru|se|tv|pl|ar|studio|app)$/i.test(parts[0]);
    if (!prefixOk) return false;
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i] || /^\d+$/.test(parts[i])) return false;
    }
    return /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*){2,}$/.test(pkg);
  }

  function resolvePackageName(fileName) {
    var lower = fileName.toLowerCase();

    // 1. Authoritative package read directly from AndroidManifest.xml via Native Bridge
    if (savedFilePkgMap && savedFilePkgMap[fileName] && savedFilePkgMap[fileName].indexOf('.') !== -1) {
      return savedFilePkgMap[fileName];
    }

    // 2. Exact filename dictionary verified directly from AndroidManifest.xml
    if (EXACT_FILE_PACKAGES[lower]) {
      return EXACT_FILE_PACKAGES[lower];
    }

    // 3. Extract explicit reverse-domain package embedded in filename (e.g. com.vproject.vapptv)
    var rawNoExt = fileName.replace(/\.(apk|xapk|apks|apkm)$/i, '');
    var dotMatches = rawNoExt.match(/[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*){2,}/g);
    if (dotMatches) {
      for (var d = 0; d < dotMatches.length; d++) {
        if (isValidAndroidPackage(dotMatches[d])) {
          return dotMatches[d];
        }
      }
    }

    // 4. Ordered specific pattern lookup (longest keys first, zero substring collisions)
    var compactLower = normalizeStr(lower).replace(/[^a-z0-9_-]/g, '');
    var ultraCompact = normalizeStr(lower).replace(/[^a-z0-9]/g, '');
    for (var i = 0; i < ORDERED_PACKAGE_PATTERNS.length; i++) {
      var pat = ORDERED_PACKAGE_PATTERNS[i][0];
      var targetPkg = ORDERED_PACKAGE_PATTERNS[i][1];
      var patCompact = pat.replace(/[^a-z0-9]/g, '');
      if (compactLower.indexOf(pat) !== -1 || ultraCompact.indexOf(patCompact) !== -1) {
        return targetPkg;
      }
    }

    // 5. Honest status if brand-new unknown APK is viewed on Web before Android scans AndroidManifest.xml
    return window.ChumNative ? 'Đang đọc package chuẩn...' : 'Chờ xác định package từ APK';
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
      var cached = getCachedData(false);
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
      var isoTime = a.updated_at || a.created_at;
      var formattedDT = formatDateTime(isoTime);

      if (lower.indexOf('chum-store') !== -1 || lower.indexOf('chum_store') !== -1 || lower.indexOf('chumstore') !== -1) {
        selfUpdateApp = {
          name: a.name,
          cleanName: 'CHUM STORE',
          sizeFormatted: formatBytes(a.size || 0),
          dateFormatted: formattedDT,
          download_url: a.browser_download_url,
          updated_at: isoTime
        };
      }

      var pkg = resolvePackageName(a.name);

      items.push({
        id: a.id || i,
        name: a.name,
        cleanName: cName,
        packageName: pkg,
        size: a.size || 0,
        sizeFormatted: formatBytes(a.size || 0),
        dateFormatted: formattedDT,
        created_at: a.created_at,
        updated_at: isoTime,
        download_url: a.browser_download_url,
        iconData: getAppIconData(a.name, cName)
      });
    }

    // Newest upload always appears at top
    items.sort(function (a, b) {
      var tA = new Date(a.updated_at || a.created_at || 0).getTime();
      var tB = new Date(b.updated_at || b.created_at || 0).getTime();
      return tB - tA;
    });

    allApps = items;
    hideSkeleton();
    renderCards();
    checkSelfUpdate();

    // Ask Android Native Bridge to verify real AndroidManifest packages in background
    triggerNativeRemotePackageResolve(rawList);
  }

  /* ===== CARD ELEMENT (SOFT UI: TÊN • PACKAGE • DL • GIỜ & NGÀY CẬP NHẬT) ===== */
  function createCardElement(app, index) {
    var card = document.createElement('div');
    card.className = 'app-card focusable';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('data-nav-group', 'cards');
    card.setAttribute('data-index', index);
    card.setAttribute('data-filename', app.name);
    card.setAttribute('aria-label', app.cleanName + ', ' + app.packageName + ', ' + app.sizeFormatted + ', ' + app.dateFormatted);

    var icon = document.createElement('div');
    icon.className = 'app-card__icon' + (app.iconData.isEmoji ? ' app-card__icon--emoji' : '');
    icon.style.background = app.iconData.bg;
    icon.textContent = app.iconData.text;

    var info = document.createElement('div');
    info.className = 'app-card__info';

    var name = document.createElement('div');
    name.className = 'app-card__name';
    name.textContent = app.cleanName;
    name.title = app.name;

    var pkgEl = document.createElement('div');
    pkgEl.className = 'app-card__pkg';
    pkgEl.textContent = '📦 ' + app.packageName;
    pkgEl.title = 'Package: ' + app.packageName;
    cardPkgElements[app.name] = pkgEl;

    var meta = document.createElement('div');
    meta.className = 'app-card__meta';

    var bSize = document.createElement('span');
    bSize.className = 'badge-size';
    bSize.textContent = '💾 ' + app.sizeFormatted;
    meta.appendChild(bSize);

    if (app.dateFormatted) {
      var bDate = document.createElement('span');
      bDate.className = 'badge-date';
      bDate.textContent = '🕒 ' + app.dateFormatted;
      meta.appendChild(bDate);
    }

    info.appendChild(name);
    info.appendChild(pkgEl);
    info.appendChild(meta);

    card.appendChild(icon);
    card.appendChild(info);

    card.addEventListener('click', function (e) {
      e.preventDefault();
      triggerDownload(app);
    });

    return card;
  }

  function renderCards() {
    dom.cardsGrid.innerHTML = '';
    cardPkgElements = {};

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
  var webDlHideTimer = null;

  function setDownloadBannerState(badge, title, pctText, statsText, pctWidth) {
    if (!dom.dlBanner) return;
    dom.dlBanner.style.display = 'block';
    if (dom.dlBannerBadge) dom.dlBannerBadge.textContent = badge;
    if (dom.dlBannerTitle) dom.dlBannerTitle.textContent = title;
    if (dom.dlBannerPct) dom.dlBannerPct.textContent = pctText;
    if (dom.dlBannerStats) dom.dlBannerStats.textContent = statsText;
    if (dom.dlBannerFill) dom.dlBannerFill.style.width = pctWidth + '%';
  }

  function triggerDownload(app) {
    if (!app || !app.download_url) return;

    activeDownloadFileName = app.name;

    if (window.ChumNative && typeof window.ChumNative.downloadAndInstall === 'function') {
      try {
        if (dom.btnDlCancel) dom.btnDlCancel.textContent = '✕ Hủy';
        setDownloadBannerState('⬇️', app.cleanName, '0%', app.sizeFormatted + ' • Đang kết nối...', 0);
        window.ChumNative.downloadAndInstall(app.download_url, app.name, app.cleanName, true);
        return;
      } catch (e) { /* fallback */ }
    }

    if (dom.btnDlCancel) dom.btnDlCancel.textContent = '✕ Đóng';
    setDownloadBannerState('⬇️', app.cleanName, 'Tải ngay', (app.sizeFormatted ? app.sizeFormatted + ' • ' : '') + 'Trình duyệt đang tải xuống...', 100);
    if (webDlHideTimer) clearTimeout(webDlHideTimer);
    webDlHideTimer = setTimeout(function () {
      if (!window.ChumNative && dom.dlBanner) dom.dlBanner.style.display = 'none';
    }, 5000);

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

  window.onNativeDownloadProgress = function (fileName, progress, downloadedBytes, totalBytes, speedBps, status) {
    if (!dom.dlBanner) return;
    var pct = Math.min(100, Math.max(0, Number(progress) || 0));
    var appTitle = cleanAppName(fileName);

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
      setDownloadBannerState('⚡', 'Mở cài đặt: ' + appTitle, '100%', 'Hoàn tất • Đang mở trình cài đặt...', 100);
      setTimeout(function () {
        if (dom.dlBanner) dom.dlBanner.style.display = 'none';
      }, 3500);
      showToast('⚡ Mở cài đặt: ' + appTitle);
      return;
    }
    if (status === 'extracting_xapk') {
      setDownloadBannerState('📦', 'Đang giải nén: ' + appTitle, '100%', 'Đang chuẩn bị cài đặt gói XAPK...', 100);
      return;
    }
    if (status === 'connecting') {
      setDownloadBannerState('🔗', 'Đang kết nối: ' + appTitle, '0%', 'Đang chuẩn bị tải...', 2);
      return;
    }

    var sizeText = (totalBytes > 0)
      ? (formatBytes(downloadedBytes) + ' / ' + formatBytes(totalBytes))
      : formatBytes(downloadedBytes);
    setDownloadBannerState('⬇️', appTitle, pct + '%', formatSpeed(speedBps) + (sizeText ? ' • ' + sizeText : ''), pct);
  };

  window.onNativeDownloadComplete = function (fileName) {
    var appTitle = cleanAppName(fileName);
    setDownloadBannerState('⚡', 'Mở cài đặt: ' + appTitle, '100%', 'Hoàn tất • Sẵn sàng', 100);
    setTimeout(function () {
      if (dom.dlBanner) dom.dlBanner.style.display = 'none';
    }, 3500);
    showToast('⚡ Mở cài đặt: ' + appTitle);
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
  function renderQr(text, fallbackEmoji) {
    if (!dom.lanQrBox) return;
    if (text && typeof QRCode !== 'undefined') {
      try {
        dom.lanQrBox.innerHTML = '';
        new QRCode(dom.lanQrBox, {
          text: text,
          width: 142,
          height: 142,
          colorDark: '#1e293b',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
        return;
      } catch (qrErr) {
        if (dom.lanStatusText) dom.lanStatusText.textContent = '⚠️ ' + qrErr.message;
      }
    }
    dom.lanQrBox.innerHTML = '<div style="font-size:2.5rem;color:#3b6bf6;">' + (fallbackEmoji || '📡') + '</div>';
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

  /* ===== D-PAD / REMOTE KEYBOARD NAVIGATION ===== */
  function rebuildFocusables() {
    if (isLanModalOpen) {
      focusables = [];
      if (dom.btnLanClose) focusables.push(dom.btnLanClose);
      if (dom.btnWebApkDl && dom.btnWebApkDl.style.display !== 'none') focusables.push(dom.btnWebApkDl);
      if (focusables.length > 0) {
        var defaultIdx = (!window.ChumNative && focusables.length > 1) ? 1 : 0;
        setFocus(defaultIdx);
      }
      return;
    }

    focusables = [];
    if (dom.btnRefresh) focusables.push(dom.btnRefresh);
    if (dom.btnLanSend) focusables.push(dom.btnLanSend);
    if (dom.btnTheme) focusables.push(dom.btnTheme);
    if (dom.selfUpdateBanner && dom.selfUpdateBanner.style.display !== 'none' && dom.btnSelfUpdate) {
      focusables.push(dom.btnSelfUpdate);
    }
    if (dom.cardsGrid && dom.cardsGrid.style.display !== 'none') {
      var cards = dom.cardsGrid.children;
      for (var c = 0; c < cards.length; c++) {
        focusables.push(cards[c]);
      }
    }
    if (dom.errorState && dom.errorState.style.display !== 'none' && dom.btnRetry) {
      focusables.push(dom.btnRetry);
    }

    if (currentFocusIndex >= focusables.length) {
      currentFocusIndex = focusables.length - 1;
    }

    if (LAYOUT === 'tv' && currentFocusIndex < 0 && focusables.length > 0) {
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
        if (topPos < topbarIndices.length - 1) setFocus(topbarIndices[topPos + 1]);
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        if (topPos > 0) setFocus(topbarIndices[topPos - 1]);
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        if (cardIndices.length > 0) setFocus(cardIndices[0]);
      }
    } else if (currentGroup === 'cards') {
      var cardPos = cardIndices.indexOf(cur);
      if (key === 'ArrowRight') {
        e.preventDefault();
        if (cardPos < cardIndices.length - 1) setFocus(cardIndices[cardPos + 1]);
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        if (cardPos > 0) setFocus(cardIndices[cardPos - 1]);
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

  /* ===== SOFT UI THEME TOGGLE (DEFAULT: SOFT LIGHT) ===== */
  var THEME_KEY = 'chum_theme_v9';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#1c212e' : '#e6ecf5');
    }
    if (window.ChumNative && typeof window.ChumNative.setSystemUiTheme === 'function') {
      try {
        window.ChumNative.setSystemUiTheme(theme);
      } catch (e) { /* ignore */ }
    }
  }

  function initTheme() {
    var saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    var next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
    showToast(next === 'dark' ? '🌙 Soft UI Tối' : '☀️ Soft UI Sáng');
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
        if (webDlHideTimer) clearTimeout(webDlHideTimer);
        if (dom.dlBanner) dom.dlBanner.style.display = 'none';
        if (window.ChumNative && typeof window.ChumNative.cancelDownload === 'function') {
          window.ChumNative.cancelDownload(activeDownloadFileName);
          showToast('⏹️ Đã hủy tải ứng dụng.');
        }
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
