/* Сочный вертел — логика страницы. Без зависимостей. */
(function () {
  "use strict";
  const C = window.SV_CONFIG || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const rub = (n) => (Number(n) || 0).toLocaleString("ru-RU") + " ₽";
  const rubHtml = (n) => `${(Number(n) || 0).toLocaleString("ru-RU")} <span class="cur">₽</span>`;

  /* ------------------------------------------------------------ contacts */
  function bindContacts() {
    const tel = "tel:" + (C.phoneRaw || "").replace(/[^\d+]/g, "");
    $$("[data-tel]").forEach((a) => (a.href = tel));
    $$("[data-phone]").forEach((el) => (el.textContent = C.phone || ""));
    $$("[data-address]").forEach((el) => (el.textContent = C.address || ""));
    $$("[data-hours]").forEach((el) => (el.textContent = C.hours || ""));
    $$("[data-legal]").forEach((el) => (el.textContent = C.legal || ""));
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    $$("[data-min-order]").forEach((el) => (el.textContent = (C.delivery && C.delivery.minOrder) || ""));
    $$("[data-drum-threshold]").forEach((el) => (el.textContent = (C.drum && C.drum.threshold) || 500));

    const waText = encodeURIComponent("Здравствуйте! Хочу сделать заказ в «Сочный вертел».");
    $$("[data-wa]").forEach((a) => {
      if (C.whatsapp) a.href = `https://wa.me/${C.whatsapp}?text=${waText}`;
      else a.hidden = true;
    });
    $$("[data-yandex-eda]").forEach((a) => {
      if (C.yandexEda) { a.href = C.yandexEda; a.hidden = false; } else a.hidden = true;
    });

    const social = $("[data-social]");
    if (social) {
      const links = [];
      if (C.instagram) links.push(`<a href="https://instagram.com/${esc(C.instagram)}" target="_blank" rel="noopener">📸 Instagram</a>`);
      if (C.telegram) links.push(`<a href="https://t.me/${esc(C.telegram)}" target="_blank" rel="noopener">✈️ Telegram</a>`);
      if (C.vk) links.push(`<a href="https://vk.com/${esc(C.vk)}" target="_blank" rel="noopener">VK</a>`);
      if (C.whatsapp) links.push(`<a href="https://wa.me/${esc(C.whatsapp)}" target="_blank" rel="noopener">💬 WhatsApp</a>`);
      social.innerHTML = links.join("");
    }
  }

  /* ------------------------------------------------------------ delivery */
  function renderDelivery() {
    const d = C.delivery || {};
    const h = $("[data-delivery-headline]");
    if (h && d.headline) h.textContent = d.headline;
    const pts = $("[data-delivery-points]");
    if (pts) {
      pts.innerHTML = (d.points || []).map((p, i) => `
        <div class="point">
          <div class="point-num">${i + 1}</div>
          <div><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>
        </div>`).join("");
    }
    const cmp = $("[data-compare]");
    const heroSave = $("[data-compare-save-hero]");
    if (cmp && d.compare && d.compare.phone && d.compare.app) {
      cmp.hidden = false;
      $("[data-compare-item]").textContent = d.compare.item || "";
      $("[data-compare-phone]").innerHTML = rubHtml(d.compare.phone);
      $("[data-compare-app]").innerHTML = rubHtml(d.compare.app);
      $("[data-compare-save]").textContent = rub(d.compare.app - d.compare.phone);
      if (heroSave) heroSave.innerHTML = "до " + rubHtml(d.compare.app - d.compare.phone);
    } else if (heroSave) {
      const stat = heroSave.closest(".hero-stat");
      if (stat) {
        $(".hero-stat-label", stat).textContent = "Цены как на витрине";
        heroSave.innerHTML = rubHtml(0);
        $(".hero-stat-sub", stat).textContent = "наценки агрегатора при заказе по телефону";
      }
    }
  }

  /* ------------------------------------------------------------ embers (brand fire) */
  function renderEmbers() {
    const box = $(".embers");
    if (!box || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const n = innerWidth < 700 ? 18 : 34;
    let html = "";
    for (let i = 0; i < n; i++) {
      const left = Math.random() * 100;
      const dur = 9 + Math.random() * 12;
      const delay = -Math.random() * dur;
      const size = 2 + Math.random() * 4;
      const dx = (Math.random() - 0.5) * 160;
      html += `<i style="left:${left.toFixed(1)}%;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;--dx:${dx.toFixed(0)}px;animation-duration:${dur.toFixed(1)}s;animation-delay:${delay.toFixed(1)}s"></i>`;
    }
    box.innerHTML = html;
  }

  /* ------------------------------------------------------------ promos */
  function renderPromos(promos) {
    const grid = $("[data-promos]");
    if (!grid) return;
    grid.innerHTML = promos.map((p, i) => `
      <button class="promo" type="button" data-promo="${i}">
        ${p.badge ? `<span class="promo-badge">${esc(p.badge)}</span>` : ""}
        <span class="promo-ico">${esc(p.icon || "🎁")}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.short)}</p>
        <span class="promo-more">Подробнее →</span>
      </button>`).join("");
    grid.addEventListener("click", (e) => {
      const b = e.target.closest("[data-promo]");
      if (!b) return;
      const p = promos[+b.dataset.promo];
      if (p.link && p.link.startsWith("#") && $(p.link)) {
        $(p.link).scrollIntoView({ behavior: "smooth" });
        return;
      }
      openModal(p.icon, p.title, p.details || p.short);
    });
  }

  function openModal(ico, title, text) {
    const m = $("[data-modal]");
    $("[data-modal-ico]").textContent = ico || "🎁";
    $("[data-modal-title]").textContent = title;
    $("[data-modal-text]").textContent = text;
    m.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    $("[data-modal]").hidden = true;
    document.body.style.overflow = "";
  }
  $$("[data-modal-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

  /* ------------------------------------------------------------ drum */
  const GROUPS = {
    next: { title: "На следующий визит", hint: "при следующем заказе в течение 7 дней" },
    now: { title: "Сразу на кассе", hint: "получаете в этом заказе" },
    jackpot: { title: "Джекпоты", hint: "главные призы барабана" },
  };
  const BALL_COLORS = ["#ff2c2c", "#ff5e2c", "#ffffff", "#ffb347", "#ff2c2c", "#d9d9d9", "#ff5e2c"];

  function renderPrizes(prizes) {
    const box = $("[data-prizes]");
    if (!box) return;
    const byGroup = { next: [], now: [], jackpot: [] };
    prizes.forEach((p) => {
      const list = byGroup[p.group] || (byGroup[p.group] = []);
      if (!list.some((x) => x.name === p.name && x.note === p.note)) list.push(p);
    });
    box.innerHTML = Object.keys(GROUPS).filter((g) => byGroup[g] && byGroup[g].length).map((g) => `
        <div class="prize-group">
          <div class="prize-group-title ${g}"><span>${GROUPS[g].title}</span></div>
          <div class="prize-list">
            ${byGroup[g].map((p) => `
              <div class="prize ${g}">
                <span class="prize-ico">${esc(p.icon || "🎁")}</span>
                <span>${esc(p.name)}</span>
                ${p.note ? `<small>${esc(p.note)}</small>` : ""}
              </div>`).join("")}
          </div>
        </div>`).join("");
  }

  function renderBalls() {
    const box = $("[data-balls]");
    if (!box) return;
    const n = 26;
    let html = "";
    for (let i = 0; i < n; i++) {
      // random point inside a circle (lower half heavier, like real drum)
      const r = Math.sqrt(Math.random()) * 0.82;
      const a = Math.random() * Math.PI * 2;
      const x = 50 + r * 50 * Math.cos(a);
      const y = 50 + r * 50 * Math.sin(a) * 0.9 + 4;
      const c = BALL_COLORS[i % BALL_COLORS.length];
      html += `<div class="ball" style="--c:${c};left:calc(${x.toFixed(1)}% - 17px);top:calc(${y.toFixed(1)}% - 17px)"></div>`;
    }
    box.innerHTML = html;
  }

  function setupSpin(prizes) {
    const btn = $("[data-spin]");
    const wheel = $("[data-wheel]");
    const res = $("[data-drum-result]");
    if (!btn || !wheel || !res) return;
    let angle = 0, busy = false;
    const pool = [];
    prizes.forEach((p) => { for (let i = 0; i < (+p.count || 0); i++) pool.push(p); });
    btn.addEventListener("click", () => {
      if (busy || !pool.length) return;
      busy = true;
      btn.disabled = true;
      res.classList.remove("win", "pop");
      $(".drum-result-label", res).textContent = "Крутим…";
      $(".drum-result-prize", res).textContent = "🎲";
      angle += 720 + Math.floor(Math.random() * 360);
      wheel.style.transform = `rotate(${angle}deg)`;
      setTimeout(() => {
        const p = pool[Math.floor(Math.random() * pool.length)];
        $(".drum-result-label", res).textContent = p.group === "jackpot" ? "ДЖЕКПОТ!" : GROUPS[p.group] ? GROUPS[p.group].title : "Ваш шарик";
        $(".drum-result-prize", res).textContent = `${p.name}${p.note ? " · " + p.note : ""}`;
        res.classList.add("pop");
        if (p.group === "jackpot") res.classList.add("win");
        busy = false;
        btn.disabled = false;
        btn.textContent = "Ещё раз";
      }, 3200);
    });
  }

  function renderWinners(winners) {
    const box = $("[data-winners]");
    const cnt = $("[data-winners-count]");
    if (!box) return;
    const list = (winners || []).filter((w) => w && (w.name || w.prize));
    const limit = (C.drum && C.drum.showLast) || 12;
    if (cnt) cnt.textContent = list.length ? `Всего выигрышей: ${list.length}` : "";
    if (!list.length) {
      box.innerHTML = `<div class="empty">Барабан крутится на кассе — первые выигрыши появятся здесь.</div>`;
      return;
    }
    box.innerHTML = list.slice(0, limit).map((w) => {
      const initial = (w.name || "?").trim().charAt(0).toUpperCase();
      const jp = isJackpot(w);
      return `
        <div class="winner ${jp ? "jackpot" : ""}">
          <div class="winner-ava">${esc(initial)}</div>
          <div class="winner-body">
            <div class="winner-name">${esc(w.name || "Гость")} ${jp ? "🏆" : ""}</div>
            <div class="winner-prize">${esc(w.prize || "")}</div>
            <div class="winner-date">${[w.date, w.code].filter(Boolean).map(esc).join(" · ")}</div>
          </div>
        </div>`;
    }).join("");
  }
  function isJackpot(w) {
    const v = String(w.jackpot ?? "").trim().toLowerCase();
    if (["1", "да", "yes", "true", "джекпот", "+"].includes(v)) return true;
    return /джекпот|сертификат|каждый день|30 дней/i.test(w.prize || "");
  }

  /* ------------------------------------------------------------ menu */
  function formatItemPrice(m) {
    if (m.priceChicken && m.priceBeef) {
      return `<div class="price-dual">
        <span class="price-line"><span class="price-kind">курица</span>${rubHtml(m.priceChicken)}</span>
        <span class="price-line"><span class="price-kind">говядина</span>${rubHtml(m.priceBeef)}</span>
      </div>`;
    }
    if (Array.isArray(m.variants) && m.variants.length) {
      return `<div class="price-dual">
        ${m.variants.map((v) => `<span class="price-line"><span class="price-kind">${esc(v.label)}</span>${rubHtml(v.price)}</span>`).join("")}
      </div>`;
    }
    return m.price ? rubHtml(m.price) : "";
  }

  function renderMenu(menu) {
    const tabs = $("[data-menu-tabs]");
    const list = $("[data-menu]");
    if (!tabs || !list) return;
    const cats = [];
    menu.forEach((m) => { if (m.category && !cats.includes(m.category)) cats.push(m.category); });
    let active = "all";
    const draw = () => {
      tabs.innerHTML = [`<button class="tab ${active === "all" ? "active" : ""}" data-cat="all">Всё</button>`]
        .concat(cats.map((c) => `<button class="tab ${active === c ? "active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`)).join("");
      const rows = [];
      cats.filter((c) => active === "all" || c === active).forEach((c) => {
        if (active === "all") rows.push(`<div class="menu-cat">${esc(c)}</div>`);
        menu.filter((m) => m.category === c).forEach((m) => rows.push(`
          <div class="item">
            <div>
              <div class="item-name">${esc(m.name)} ${m.tag ? `<span class="item-tag">${esc(m.tag)}</span>` : ""}</div>
              ${m.desc ? `<div class="item-desc">${esc(m.desc)}</div>` : ""}
            </div>
            <div class="item-price">${formatItemPrice(m)}</div>
          </div>`));
      });
      list.innerHTML = rows.join("") || `<div class="empty">Меню скоро появится</div>`;
    };
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      active = b.dataset.cat;
      draw();
    });
    draw();
  }

  /* ------------------------------------------------------------ map */
  function renderMap() {
    const lat = C.lat, lon = C.lon;
    const org = String(C.yandexOrgId || "").trim();
    const q = encodeURIComponent(`Сочный Вертел, ${C.address || "Анапа"}`);
    const orgPage = org ? `https://yandex.ru/maps/org/${org}/` : `https://yandex.ru/maps/?text=${q}`;
    const iframe = $("[data-map]");
    if (iframe) {
      if (org && lat && lon) {
        iframe.src = `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=17&oid=${encodeURIComponent(org)}&ol=biz&lang=ru_RU`;
      } else if (org) {
        iframe.src = `https://yandex.ru/map-widget/v1/?oid=${encodeURIComponent(org)}&ol=biz&lang=ru_RU`;
      } else if (lat && lon) {
        iframe.src = `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=17&pt=${lon}%2C${lat}%2Cpm2orl&lang=ru_RU`;
      } else {
        iframe.src = `https://yandex.ru/map-widget/v1/?text=${q}&z=16&lang=ru_RU`;
      }
    }
    const route = $("[data-route]");
    if (route) {
      route.href = org
        ? `${orgPage}routes/`
        : (lat && lon ? `https://yandex.ru/maps/?rtext=~${lat}%2C${lon}&rtt=auto` : `https://yandex.ru/maps/?text=${q}`);
    }
    $$("[data-ymaps]").forEach((a) => { a.href = orgPage; });
    const g = $("[data-2gis]");
    if (g) g.href = `https://2gis.ru/anapa/search/${encodeURIComponent("Сочный Вертел, " + (C.address || "Анапа"))}`;
  }

  /* ------------------------------------------------------------ RSVP */
  function setupRsvp() {
    const form = $("[data-rsvp-form]");
    if (!form) return;
    const status = $("[data-rsvp-status]");
    const hint = $("[data-rsvp-hint]");
    const btn = $("[data-rsvp-submit]");
    const useApi = !!C.rsvpUrl;
    if (hint) hint.textContent = useApi
      ? "Отметка попадёт напрямую к нам. Телефон нужен только если хотите, чтобы мы перезвонили."
      : (C.whatsapp ? "Откроется WhatsApp с готовым сообщением — просто нажмите «Отправить»." : "");
    if (!useApi && !C.whatsapp) { form.hidden = true; return; }

    const already = localStorage.getItem("sv_rsvp");
    if (already) showStatus("ok", "Вы уже отметились — ждём вас! 🌯 Можно отметиться ещё раз на другой день.");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      if (fd.get("website")) return; // bot
      const data = {
        name: String(fd.get("name") || "").trim(),
        when: fd.get("when"), time: fd.get("time"), people: fd.get("people"),
        phone: String(fd.get("phone") || "").trim(), comment: String(fd.get("comment") || "").trim(),
        source: location.href, ua: navigator.userAgent.slice(0, 120),
      };
      if (!data.name) { showStatus("err", "Напишите, как вас зовут 🙂"); form.name.focus(); return; }

      if (!useApi) {
        const msg = `Здравствуйте! Я приду в «Сочный вертел».\nИмя: ${data.name}\nКогда: ${data.when}${data.time ? " " + data.time : ""}\nЧеловек: ${data.people}${data.comment ? "\nКомментарий: " + data.comment : ""}`;
        window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
        localStorage.setItem("sv_rsvp", Date.now());
        showStatus("ok", "Спасибо! Отправьте сообщение в WhatsApp — и мы будем вас ждать 🌯");
        return;
      }

      btn.disabled = true; btn.textContent = "Отправляем…";
      try {
        const r = await fetch(C.rsvpUrl, { method: "POST", body: JSON.stringify({ action: "rsvp", ...data }), headers: { "Content-Type": "text/plain;charset=utf-8" } });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j.ok === false) throw new Error(j.error || "bad response");
        localStorage.setItem("sv_rsvp", Date.now());
        showStatus("ok", `Спасибо, ${esc(data.name)}! Ждём вас ${String(data.when).toLowerCase()} 🌯`);
        form.reset();
        if (typeof j.today === "number") setCounter(j.today);
      } catch (err) {
        console.warn("rsvp failed", err);
        if (C.whatsapp) {
          const msg = `Здравствуйте! Я приду в «Сочный вертел». Имя: ${data.name}, когда: ${data.when} ${data.time || ""}, человек: ${data.people}.`;
          showStatus("err", `Не получилось отправить автоматически. <a href="https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener"><u>Отправить в WhatsApp</u></a>`);
        } else showStatus("err", "Не получилось отправить. Позвоните нам — мы будем рады 📞");
      } finally {
        btn.disabled = false; btn.textContent = "Я приду!";
      }
    });

    function showStatus(kind, html) {
      status.className = "rsvp-status " + kind;
      status.innerHTML = html;
      status.hidden = false;
    }
  }
  function setCounter(n) {
    const c = $("[data-rsvp-counter]");
    if (!c) return;
    if (n > 0) { $("[data-rsvp-today]").textContent = n; c.hidden = false; } else c.hidden = true;
  }

  /* ------------------------------------------------------------ data */
  async function loadJson(path, fallback) {
    try { const r = await fetch(path, { cache: "no-cache" }); if (!r.ok) throw 0; return await r.json(); }
    catch { return fallback; }
  }

  // tiny CSV parser (handles quotes / newlines inside quotes)
  function parseCsv(text) {
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += ch;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    if (!rows.length) return [];
    const head = rows[0].map((h) => h.trim().toLowerCase());
    return rows.slice(1).filter((r) => r.some((c) => c.trim())).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }
  async function loadSheet(name) {
    if (!C.sheetId) return null;
    try {
      const url = `https://docs.google.com/spreadsheets/d/${C.sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
      const r = await fetch(url, { cache: "no-cache" });
      if (!r.ok) throw 0;
      return parseCsv(await r.text());
    } catch (e) { console.warn("sheet", name, "unavailable", e); return null; }
  }
  const pick = (o, ...keys) => { for (const k of keys) if (o[k] !== undefined && o[k] !== "") return o[k]; return ""; };

  async function loadAll() {
    const [menuJ, promosJ, prizesJ, winnersJ] = await Promise.all([
      loadJson("data/menu.json", []), loadJson("data/promos.json", []),
      loadJson("data/prizes.json", []), loadJson("data/winners.json", []),
    ]);
    let menu = menuJ, promos = promosJ, winners = winnersJ;

    if (C.sheetId) {
      const [p, w] = await Promise.all([loadSheet("Акции"), loadSheet("Победители")]);
      if (p && p.length) promos = p.map((r) => ({ icon: pick(r, "иконка", "icon") || "🎁", title: pick(r, "название", "title"), short: pick(r, "кратко", "short"), details: pick(r, "подробно", "details"), badge: pick(r, "бейдж", "badge"), link: pick(r, "ссылка", "link") })).filter((x) => x.title);
      if (w && w.length) winners = w.map((r) => ({ date: pick(r, "дата", "date"), name: pick(r, "имя", "name"), prize: pick(r, "приз", "prize"), jackpot: pick(r, "джекпот", "jackpot") })).reverse();
    }
    if (C.rsvpUrl) {
      try {
        const r = await fetch(C.rsvpUrl + (C.rsvpUrl.includes("?") ? "&" : "?") + "action=state", { cache: "no-cache" });
        const j = await r.json();
        if (Array.isArray(j.winners) && j.winners.length) winners = j.winners;
        if (typeof j.today === "number") setCounter(j.today);
      } catch (e) { console.warn("rsvp api unavailable", e); }
    }
    return { menu, promos, prizes: prizesJ, winners };
  }

  /* ------------------------------------------------------------ init */
  document.addEventListener("DOMContentLoaded", async () => {
    bindContacts();
    renderEmbers();
    renderDelivery();
    renderMap();
    renderBalls();
    setupRsvp();
    const d = await loadAll();
    renderPromos(d.promos);
    renderPrizes(d.prizes);
    setupSpin(d.prizes);
    renderWinners(d.winners);
    renderMenu(d.menu);
  });
})();
