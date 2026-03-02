/* ============================================================
   app.js — KHO APP CHUM — Android TV 10-foot UI Controller
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
  var $searchInput  = document.getElementById('search-input');
  var $btnRefresh   = document.getElementById('btn-refresh');
  var $btnTheme     = document.getElementById('btn-theme');
  var $statusLine   = document.getElementById('status-line');
  var $tabsBar      = document.getElementById('tabs-bar');
  var $skeleton     = document.getElementById('skeleton');
  var $cardsGrid    = document.getElementById('cards-grid');
  var $emptyState   = document.getElementById('empty-state');
  var $errorState   = document.getElementById('error-state');
  var $btnRetry     = document.getElementById('btn-retry');
  var $toast        = document.getElementById('toast');

  /* ---------- STATE ---------- */
  var rawData       = [];          // original JSON
  var flatItems     = [];          // flattened items (all)
  var categories    = [];          // category names
  var activeTab     = TAB_ALL;
  var searchQuery   = '';
  var filteredItems = [];
  var toastTimer    = null;
  var refreshTimer  = null;
  var focusedCardId = null;        // track focused card across re-renders

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
  function escapeHTML(str) {
    var div = document.createElement('span');
    div.textContent = str;
    return div.innerHTML;
  }

  function setStatus(msg) {
    $statusLine.textContent = msg;
  }

  function showToast(msg) {
    $toast.textContent = msg;
    $toast.hidden = false;
    $toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(dismissToast, TOAST_DURATION);
  }

  function dismissToast() {
    $toast.classList.remove('show');
    clearTimeout(toastTimer);
    setTimeout(function () { $toast.hidden = true; }, 300);
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
      $skeleton.hidden = false;
      $cardsGrid.hidden = true;
      $emptyState.hidden = true;
      $errorState.hidden = true;
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
        // retry once
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
    applyFilters(isAutoRefresh);
    $skeleton.hidden = true;
    $cardsGrid.hidden = false;
    $errorState.hidden = true;
    setStatus('Cập nhật lúc ' + timeStr() + ' • ' + flatItems.length + ' ứng dụng');
  }

  function showError(msg) {
    $skeleton.hidden = true;
    $cardsGrid.hidden = true;
    $emptyState.hidden = true;
    $errorState.hidden = false;
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
  function applyFilters(preserveFocus) {
    var savedFocus = preserveFocus ? getFocusedCardUid() : null;
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

    filteredItems = items;
    renderCards(savedFocus);
  }

  function getFocusedCardUid() {
    var el = document.activeElement;
    if (el && el.dataset && el.dataset.uid) return el.dataset.uid;
    return focusedCardId;
  }

  function renderCards(restoreUid) {
    var frag = document.createDocumentFragment();

    for (var i = 0; i < filteredItems.length; i++) {
      var it = filteredItems[i];
      var card = document.createElement('div');
      card.className = 'app-card focusable';
      card.setAttribute('role', 'gridcell');
      card.setAttribute('data-nav-group', 'cards');
      card.setAttribute('tabindex', '-1');
      card.dataset.uid = it._uid;
      card.dataset.index = i;
      card.dataset.apkUrl = it.apk_url || '';

      // header
      var header = document.createElement('div');
      header.className = 'app-card__header';

      // icon
      if (it.icon) {
        var img = document.createElement('img');
        img.className = 'app-card__icon';
        img.setAttribute('loading', 'lazy');
        img.setAttribute('alt', '');
        img.src = it.icon;
        img.onerror = function () {
          var ph = document.createElement('div');
          ph.className = 'app-card__icon-placeholder';
          ph.textContent = (this.parentNode && this.parentNode.parentNode) ?
            (this.parentNode.parentNode.querySelector('.app-card__name') || {}).textContent ?
            (this.parentNode.parentNode.querySelector('.app-card__name').textContent || '?')[0] : '?' : '?';
          this.parentNode.replaceChild(ph, this);
        };
        header.appendChild(img);
      } else {
        var ph2 = document.createElement('div');
        ph2.className = 'app-card__icon-placeholder';
        ph2.textContent = (it.name || '?')[0].toUpperCase();
        header.appendChild(ph2);
      }

      // info block
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

      header.appendChild(info);
      card.appendChild(header);

      // actions
      var actions = document.createElement('div');
      actions.className = 'app-card__actions';

      var btnOpen = document.createElement('button');
      btnOpen.className = 'btn-primary focusable';
      btnOpen.setAttribute('data-nav-group', 'card-actions');
      btnOpen.setAttribute('tabindex', '-1');
      btnOpen.dataset.action = 'open';
      btnOpen.dataset.url = it.apk_url || '';
      btnOpen.textContent = 'MỞ LINK';
      actions.appendChild(btnOpen);

      var btnCopy = document.createElement('button');
      btnCopy.className = 'btn-secondary focusable';
      btnCopy.setAttribute('data-nav-group', 'card-actions');
      btnCopy.setAttribute('tabindex', '-1');
      btnCopy.dataset.action = 'copy';
      btnCopy.dataset.url = it.apk_url || '';
      btnCopy.textContent = 'COPY';
      actions.appendChild(btnCopy);

      card.appendChild(actions);
      frag.appendChild(card);
    }

    $cardsGrid.innerHTML = '';
    $cardsGrid.appendChild(frag);

    if (filteredItems.length === 0) {
      $emptyState.hidden = false;
    } else {
      $emptyState.hidden = true;
    }

    // roving tabindex: first card or restored card
    updateRovingTabindex(restoreUid);
  }

  /* ---------- ROVING TABINDEX ---------- */
  function getGridCards() {
    return Array.prototype.slice.call($cardsGrid.querySelectorAll('.app-card'));
  }

  function updateRovingTabindex(restoreUid) {
    var cards = getGridCards();
    if (cards.length === 0) return;

    var target = null;
    if (restoreUid) {
      target = $cardsGrid.querySelector('[data-uid="' + CSS.escape(restoreUid) + '"]');
    }
    if (!target) target = cards[0];

    for (var i = 0; i < cards.length; i++) {
      cards[i].setAttribute('tabindex', cards[i] === target ? '0' : '-1');
    }
    focusedCardId = target.dataset.uid;
  }

  function setCardFocus(card) {
    var cards = getGridCards();
    for (var i = 0; i < cards.length; i++) {
      cards[i].setAttribute('tabindex', cards[i] === card ? '0' : '-1');
    }
    card.focus({ preventScroll: false });
    focusedCardId = card.dataset.uid;
    scrollIntoViewIfNeeded(card);
  }

  function scrollIntoViewIfNeeded(el) {
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  /* ---------- GRID NAV HELPERS ---------- */
  function getGridColumns() {
    var cards = getGridCards();
    if (cards.length < 2) return 1;
    var firstTop = cards[0].getBoundingClientRect().top;
    for (var i = 1; i < cards.length; i++) {
      if (cards[i].getBoundingClientRect().top !== firstTop) return i;
    }
    return cards.length;
  }

  /* ---------- D-PAD NAVIGATION ---------- */
  function handleNavigation(e) {
    var key = e.key;
    var active = document.activeElement;

    // Toast dismiss
    if ((key === 'Escape' || key === 'Backspace') && $toast.classList.contains('show')) {
      e.preventDefault();
      dismissToast();
      return;
    }

    // Tab navigation (within tabs bar)
    if (active && active.classList.contains('tab-btn')) {
      var tabs = Array.prototype.slice.call($tabsBar.querySelectorAll('.tab-btn'));
      var idx = tabs.indexOf(active);
      if (key === 'ArrowRight') {
        e.preventDefault();
        if (idx < tabs.length - 1) { tabs[idx + 1].focus(); rovingTabs(tabs[idx + 1]); }
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        if (idx > 0) { tabs[idx - 1].focus(); rovingTabs(tabs[idx - 1]); }
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        focusFirstCard();
      } else if (key === 'Enter') {
        e.preventDefault();
        selectTab(active.dataset.category);
      }
      return;
    }

    // Card grid navigation
    if (active && active.classList.contains('app-card')) {
      var cards = getGridCards();
      var ci = cards.indexOf(active);
      var cols = getGridColumns();

      if (key === 'ArrowRight') {
        e.preventDefault();
        if (ci < cards.length - 1) setCardFocus(cards[ci + 1]);
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        if (ci > 0) setCardFocus(cards[ci - 1]);
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        if (ci + cols < cards.length) setCardFocus(cards[ci + cols]);
        else if (ci < cards.length - 1) setCardFocus(cards[cards.length - 1]);
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        if (ci - cols >= 0) setCardFocus(cards[ci - cols]);
        else focusActiveTab();
      } else if (key === 'Enter') {
        e.preventDefault();
        var url = active.dataset.apkUrl;
        if (url) window.open(url, '_blank', 'noopener');
      }
      return;
    }

    // Card action buttons
    if (active && active.dataset && active.dataset.action) {
      if (key === 'ArrowUp' || key === 'Escape' || key === 'Backspace') {
        e.preventDefault();
        var parentCard = active.closest('.app-card');
        if (parentCard) setCardFocus(parentCard);
        return;
      }
    }

    // Search input special keys
    if (active === $searchInput) {
      if (key === 'ArrowDown') {
        e.preventDefault();
        focusActiveTab();
        return;
      }
      if (key === 'Escape' || key === 'Backspace') {
        if ($searchInput.value) {
          if (key === 'Escape') {
            e.preventDefault();
            $searchInput.value = '';
            searchQuery = '';
            applyFilters(false);
          }
          return;
        } else if (key === 'Escape') {
          e.preventDefault();
          focusActiveTab();
        }
      }
      return;
    }

    // Topbar button nav
    if (active && active.dataset && active.dataset.navGroup === 'topbar') {
      var topItems = Array.prototype.slice.call(document.querySelectorAll('[data-nav-group="topbar"]'));
      var ti = topItems.indexOf(active);
      if (key === 'ArrowRight' && ti < topItems.length - 1) { e.preventDefault(); topItems[ti + 1].focus(); }
      if (key === 'ArrowLeft' && ti > 0) { e.preventDefault(); topItems[ti - 1].focus(); }
      if (key === 'ArrowDown') { e.preventDefault(); focusActiveTab(); }
      return;
    }

    // Global Escape/Back: clear search or go to top
    if (key === 'Escape' || key === 'Backspace') {
      if (active !== $searchInput) {
        if (searchQuery) {
          e.preventDefault();
          $searchInput.value = '';
          searchQuery = '';
          applyFilters(false);
          focusActiveTab();
        } else {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          focusFirstTab();
        }
      }
    }

    // PageUp/PageDown scrolling
    if (key === 'PageDown') { e.preventDefault(); window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' }); }
    if (key === 'PageUp') { e.preventDefault(); window.scrollBy({ top: -window.innerHeight * 0.75, behavior: 'smooth' }); }
  }

  function rovingTabs(btn) {
    var tabs = Array.prototype.slice.call($tabsBar.querySelectorAll('.tab-btn'));
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].setAttribute('tabindex', tabs[i] === btn ? '0' : '-1');
    }
    scrollIntoViewIfNeeded(btn);
  }

  function focusActiveTab() {
    var tab = $tabsBar.querySelector('[aria-selected="true"]');
    if (tab) { tab.focus(); rovingTabs(tab); }
    else focusFirstTab();
  }

  function focusFirstTab() {
    var tab = $tabsBar.querySelector('.tab-btn');
    if (tab) { tab.focus(); rovingTabs(tab); }
  }

  function focusFirstCard() {
    var cards = getGridCards();
    if (cards.length > 0) setCardFocus(cards[0]);
  }

  function selectTab(category) {
    activeTab = category;
    // update aria
    var tabs = Array.prototype.slice.call($tabsBar.querySelectorAll('.tab-btn'));
    for (var i = 0; i < tabs.length; i++) {
      var sel = tabs[i].dataset.category === category;
      tabs[i].setAttribute('aria-selected', sel ? 'true' : 'false');
      tabs[i].setAttribute('tabindex', sel ? '0' : '-1');
    }
    applyFilters(false);
    focusFirstCard();
  }

  /* ---------- CLIPBOARD ---------- */
  function copyToClipboard(text) {
    if (!text) { showToast('Không có link để sao chép'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () { showToast('Đã sao chép link!'); })
        .catch(function () { promptFallback(text); });
    } else {
      promptFallback(text);
    }
  }

  function promptFallback(text) {
    window.prompt('Sao chép link:', text);
    showToast('Link hiển thị ở hộp thoại');
  }

  /* ---------- EVENT DELEGATION ---------- */
  // Tabs click
  $tabsBar.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab-btn');
    if (btn) selectTab(btn.dataset.category);
  });

  // Cards grid click delegation
  $cardsGrid.addEventListener('click', function (e) {
    var actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      e.stopPropagation();
      if (actionBtn.dataset.action === 'open') {
        var url = actionBtn.dataset.url;
        if (url) window.open(url, '_blank', 'noopener');
        else showToast('Không có link');
      } else if (actionBtn.dataset.action === 'copy') {
        copyToClipboard(actionBtn.dataset.url);
      }
      return;
    }
    // card click
    var card = e.target.closest('.app-card');
    if (card) {
      var cardUrl = card.dataset.apkUrl;
      if (cardUrl) window.open(cardUrl, '_blank', 'noopener');
    }
  });

  // Focus management on card click (update roving)
  $cardsGrid.addEventListener('focusin', function (e) {
    var card = e.target.closest('.app-card');
    if (card && card.classList.contains('app-card')) {
      var cards = getGridCards();
      for (var i = 0; i < cards.length; i++) {
        cards[i].setAttribute('tabindex', cards[i] === card ? '0' : '-1');
      }
      focusedCardId = card.dataset.uid;
    }
  });

  // Search input
  var searchDebounce = null;
  $searchInput.addEventListener('input', function () {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function () {
      searchQuery = $searchInput.value.trim();
      applyFilters(false);
    }, 180);
  });

  // Buttons
  $btnRefresh.addEventListener('click', function () { fetchData(false); });
  $btnTheme.addEventListener('click', toggleTheme);
  $btnRetry.addEventListener('click', function () { fetchData(false); });

  // Keyboard (global)
  document.addEventListener('keydown', handleNavigation);

  /* ---------- AUTO REFRESH ---------- */
  function startAutoRefresh() {
    clearInterval(refreshTimer);
    refreshTimer = setInterval(function () { fetchData(true); }, REFRESH_INTERVAL);
  }

  /* ---------- INIT ---------- */
  fetchData(false);
  startAutoRefresh();

})();
