/* ============================================================
   app.js — KHO APP CHUM — Mobile-friendly App Catalog
   ============================================================ */
(function () {
  'use strict';

  /* ---------- CONSTANTS ---------- */
  var DATA_URL = 'https://raw.githubusercontent.com/rupanh123-phap/928394040393939339393939949430038458575758933030202020202848485858585949400485858585859402.github.io/refs/heads/main/data.json';
  var FETCH_TIMEOUT = 8000;
  var REFRESH_INTERVAL = 60000;
  var TOAST_DURATION = 2800;
  var TAB_ALL = 'MỚI NHẤT';

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

  /* ---------- FETCH DATA ---------- */
  function fetchData(isAutoRefresh) {
    if (!isAutoRefresh) {
      $skeleton.style.display = '';
      $cardsGrid.style.display = 'none';
      $emptyState.style.display = 'none';
      $errorState.style.display = 'none';
      setStatus('Đang tải dữ liệu...');
    }

    var url = DATA_URL + '?t=' + Date.now();
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var signal = controller ? controller.signal : undefined;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, FETCH_TIMEOUT);

    fetch(url, { signal: signal })
      .then(function (res) {
        clearTimeout(timer);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        processData(json, isAutoRefresh);
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (!err.__retried) {
          err.__retried = true;
          var url2 = DATA_URL + '?t=' + Date.now();
          var c2 = typeof AbortController !== 'undefined' ? new AbortController() : null;
          var s2 = c2 ? c2.signal : undefined;
          var t2 = setTimeout(function () { if (c2) c2.abort(); }, FETCH_TIMEOUT);
          fetch(url2, { signal: s2 })
            .then(function (res) { clearTimeout(t2); if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
            .then(function (json) { processData(json, isAutoRefresh); })
            .catch(function () { clearTimeout(t2); showError(err.message); });
        } else {
          showError(err.message);
        }
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
