/* Лендинг розыгрыша — без барабана и RSVP. */
(function () {
  "use strict";
  const SCRIPT_BASE = document.currentScript
    ? new URL("./", document.currentScript.src)
    : new URL(location.pathname.includes("/promo") ? "./" : "./promo/", location.href);
  const C = window.SV_CONFIG || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const rubHtml = (n) => `${(Number(n) || 0).toLocaleString("ru-RU")} <span class="cur">₽</span>`;

  function bindContacts() {
    const tel = "tel:" + (C.phoneRaw || "").replace(/[^\d+]/g, "");
    $$("[data-tel]").forEach((a) => (a.href = tel));
    $$("[data-phone]").forEach((el) => (el.textContent = C.phone || ""));
    $$("[data-address]").forEach((el) => (el.textContent = C.address || ""));
    $$("[data-hours]").forEach((el) => (el.textContent = C.hours || ""));
    $$("[data-legal]").forEach((el) => (el.textContent = C.legal || ""));
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

    const waText = encodeURIComponent("Здравствуйте! Хочу сделать заказ в «Сочный вертел» — участвую в розыгрыше.");
    $$("[data-wa]").forEach((a) => {
      if (C.whatsapp) a.href = `https://wa.me/${C.whatsapp}?text=${waText}`;
      else a.hidden = true;
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

  function renderPromo(p) {
    if (!p) return;
    const tag = $("[data-promo-tag]");
    const h1 = $(".promo-hero h1");
    const lead = $("[data-promo-lead]");
    if (tag && p.tag) tag.textContent = p.tag;
    if (h1 && p.title) {
      const parts = String(p.title).split(",");
      h1.innerHTML = `<span class="red">${esc(parts[0].trim())}</span>${parts.slice(1).length ? ", " + esc(parts.slice(1).join(",").trim()) : ""}`;
    }
    if (lead && p.lead) lead.textContent = p.lead;
    const prizes = $("[data-promo-prizes]");
    if (prizes && Array.isArray(p.prizes) && p.prizes.length) {
      prizes.innerHTML = p.prizes.map((x) => `<li><span>${esc(x.icon || "🎁")}</span> ${esc(x.name)}</li>`).join("");
    }
    const rules = $("[data-promo-rules]");
    if (rules && Array.isArray(p.rules) && p.rules.length) {
      rules.innerHTML = p.rules.map((r) => `<li>${esc(r)}</li>`).join("");
    }
  }

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

  async function loadJson(path, fallback) {
    try {
      const r = await fetch(path, { cache: "no-cache" });
      if (!r.ok) throw 0;
      return await r.json();
    } catch {
      return fallback;
    }
  }

  async function loadMenu() {
    return loadJson(new URL("../data/menu.json", SCRIPT_BASE).href, []);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    bindContacts();
    renderEmbers();
    renderMap();
    const [promo, menu] = await Promise.all([
      loadJson(new URL("data/promo.json", SCRIPT_BASE).href, null),
      loadMenu(),
    ]);
    renderPromo(promo);
    renderMenu(menu);
  });
})();
