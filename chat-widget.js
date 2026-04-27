// aldamiz-chat widget — embebible en cualquier página
// Uso:
//   <link rel="stylesheet" href="/chat-widget.css">
//   <script src="/chat-widget.js" defer
//     data-page="peso"
//     data-accent="#10B981"
//     data-title="Asistente de peso"
//     data-greeting="Pregúntame sobre tu evolución."
//     data-suggest='["¿Voy bien?","Explica mi % grasa","Compara con el mes pasado"]'></script>

(function () {
  "use strict";

  const WORKER_URL = "https://aldamiz-chat.aldamiz.workers.dev";
  const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

  const script = document.currentScript || document.querySelector('script[src*="chat-widget.js"]');
  const cfg = {
    page: script?.dataset.page || "peso",
    accent: script?.dataset.accent || "#0EA5E9",
    title: script?.dataset.title || "Asistente",
    greeting: script?.dataset.greeting || "¿En qué te ayudo?",
    suggest: parseJSON(script?.dataset.suggest, []),
    contextSelector: script?.dataset.contextSelector || "main, body",
  };

  function parseJSON(raw, fallback) {
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch { return fallback; }
  }

  // Estado
  const state = {
    open: false,
    messages: [],
    pendingImage: null,
    busy: false,
  };

  // Build DOM
  const root = document.createElement("div");
  root.className = "aldamiz-chat-root";
  root.style.setProperty("--ach-accent", cfg.accent);

  root.innerHTML = `
    <button class="aldamiz-chat-fab" aria-label="Abrir chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>
    <div class="aldamiz-chat-backdrop"></div>
    <div class="aldamiz-chat-panel" role="dialog" aria-label="Chat">
      <div class="aldamiz-chat-header">
        <h3>${escapeHTML(cfg.title)}</h3>
        <div class="ach-actions">
          <button class="ach-clear" aria-label="Limpiar conversación" title="Limpiar conversación">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            </svg>
          </button>
          <button class="ach-close" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="aldamiz-chat-messages" id="ach-messages"></div>
      <div class="aldamiz-chat-imgpreview hidden" id="ach-imgpreview">
        <img id="ach-imgthumb" alt="">
        <div class="ach-imginfo">Foto adjunta</div>
        <button class="ach-imgremove" aria-label="Quitar foto">×</button>
      </div>
      <form class="aldamiz-chat-form" id="ach-form" autocomplete="off">
        <button type="button" class="ach-iconbtn ach-photo" aria-label="Subir foto" title="Subir foto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
        <input type="file" id="ach-file" accept="image/*" style="display:none">
        <input type="text" id="ach-input" placeholder="Escribe tu pregunta..." autocomplete="off">
        <button type="submit" class="ach-iconbtn ach-send" aria-label="Enviar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  `;

  document.body.appendChild(root);

  const els = {
    fab: root.querySelector(".aldamiz-chat-fab"),
    backdrop: root.querySelector(".aldamiz-chat-backdrop"),
    panel: root.querySelector(".aldamiz-chat-panel"),
    close: root.querySelector(".ach-close"),
    clear: root.querySelector(".ach-clear"),
    messages: root.querySelector("#ach-messages"),
    form: root.querySelector("#ach-form"),
    input: root.querySelector("#ach-input"),
    photo: root.querySelector(".ach-photo"),
    file: root.querySelector("#ach-file"),
    send: root.querySelector(".ach-send"),
    imgPreview: root.querySelector("#ach-imgpreview"),
    imgThumb: root.querySelector("#ach-imgthumb"),
    imgRemove: root.querySelector(".ach-imgremove"),
  };

  // Eventos
  els.fab.addEventListener("click", openPanel);
  els.close.addEventListener("click", closePanel);
  els.backdrop.addEventListener("click", closePanel);
  els.clear.addEventListener("click", () => {
    if (state.busy) return;
    state.messages = [];
    renderEmpty();
  });
  els.photo.addEventListener("click", () => els.file.click());
  els.file.addEventListener("change", onFile);
  els.imgRemove.addEventListener("click", clearImage);
  els.form.addEventListener("submit", onSubmit);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && state.open) closePanel(); });

  renderEmpty();

  function openPanel() {
    state.open = true;
    els.backdrop.classList.add("open");
    els.panel.classList.add("open");
    setTimeout(() => els.input.focus(), 220);
  }
  function closePanel() {
    state.open = false;
    els.backdrop.classList.remove("open");
    els.panel.classList.remove("open");
  }

  function renderEmpty() {
    if (state.messages.length > 0) return;
    els.messages.innerHTML = `
      <div class="aldamiz-chat-empty">
        <div class="ach-emoji">💬</div>
        <div class="ach-title">${escapeHTML(cfg.title)}</div>
        <div class="ach-sub">${escapeHTML(cfg.greeting)}</div>
        ${cfg.suggest.length ? `<div class="aldamiz-chat-suggest">${cfg.suggest.map((s, i) => `<button data-idx="${i}">${escapeHTML(s)}</button>`).join("")}</div>` : ""}
      </div>
    `;
    els.messages.querySelectorAll(".aldamiz-chat-suggest button").forEach((b) => {
      b.addEventListener("click", () => {
        const txt = cfg.suggest[parseInt(b.dataset.idx, 10)];
        if (txt) sendUserMessage(txt);
      });
    });
  }

  function appendMessage({ role, text, imgDataUrl }) {
    const empty = els.messages.querySelector(".aldamiz-chat-empty");
    if (empty) empty.remove();
    const div = document.createElement("div");
    div.className = `aldamiz-chat-msg ${role}`;
    if (imgDataUrl) {
      const img = document.createElement("img");
      img.src = imgDataUrl;
      div.appendChild(img);
    }
    if (text) {
      const txt = document.createElement("span");
      txt.textContent = text;
      div.appendChild(txt);
    }
    els.messages.appendChild(div);
    els.messages.scrollTop = els.messages.scrollHeight;
    return div;
  }

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      alert("Imagen demasiado grande (máx. 4 MB).");
      els.file.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.pendingImage = reader.result;
      els.imgThumb.src = reader.result;
      els.imgPreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    state.pendingImage = null;
    els.imgPreview.classList.add("hidden");
    els.imgThumb.src = "";
    els.file.value = "";
  }

  function onSubmit(e) {
    e.preventDefault();
    if (state.busy) return;
    const text = els.input.value.trim();
    if (!text && !state.pendingImage) return;
    sendUserMessage(text);
  }

  async function sendUserMessage(text) {
    if (state.busy) return;

    const imgDataUrl = state.pendingImage;
    appendMessage({ role: "user", text, imgDataUrl });

    const userContent = imgDataUrl
      ? [
          { type: "text", text: text || "(foto adjunta)" },
          { type: "image_url", image_url: { url: imgDataUrl } },
        ]
      : text;

    state.messages.push({ role: "user", content: userContent });
    els.input.value = "";
    clearImage();

    state.busy = true;
    els.send.disabled = true;
    els.input.disabled = true;

    const botEl = appendMessage({ role: "bot", text: "" });
    botEl.classList.add("streaming");

    let acc = "";
    try {
      const messagesForLLM = state.messages.map((m, i, arr) => {
        // Solo enviar imágenes en el último mensaje del usuario para no saturar
        if (i < arr.length - 1 && Array.isArray(m.content)) {
          const t = m.content.find((c) => c.type === "text");
          return { role: m.role, content: t?.text || "" };
        }
        return m;
      });

      const pageContext = extractPageContext();

      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: cfg.page,
          messages: messagesForLLM,
          page_context: pageContext,
        }),
      });

      if (!res.ok) {
        let errMsg = `Error ${res.status}`;
        try { const j = await res.json(); if (j.error) errMsg = j.error; } catch {}
        botEl.classList.remove("streaming");
        botEl.textContent = `⚠️ ${errMsg}`;
        return;
      }

      // Stream SSE
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split("\n\n");
        buf = events.pop() || "";
        for (const block of events) {
          const lines = block.split("\n");
          let isDone = false;
          let dataLine = null;
          for (const l of lines) {
            if (l.startsWith("event: done")) isDone = true;
            else if (l.startsWith("data:")) dataLine = l.slice(5).trim();
          }
          if (isDone) continue;
          if (!dataLine) continue;
          try {
            const json = JSON.parse(dataLine);
            if (json.delta) {
              acc += json.delta;
              botEl.textContent = acc;
              els.messages.scrollTop = els.messages.scrollHeight;
            }
            if (json.error) {
              botEl.textContent = `⚠️ ${json.error}`;
            }
          } catch {}
        }
      }

      botEl.classList.remove("streaming");
      if (!acc) botEl.textContent = "⚠️ Sin respuesta. Intenta de nuevo.";
      else state.messages.push({ role: "assistant", content: acc });
    } catch (err) {
      botEl.classList.remove("streaming");
      botEl.textContent = `⚠️ ${err.message || "Error de red"}`;
    } finally {
      state.busy = false;
      els.send.disabled = false;
      els.input.disabled = false;
      els.input.focus();
    }
  }

  function extractPageContext() {
    try {
      const sel = cfg.contextSelector;
      const node = document.querySelector(sel) || document.body;
      const clone = node.cloneNode(true);
      // Quitar nuestro propio widget si está dentro
      clone.querySelectorAll(".aldamiz-chat-root, script, style, noscript").forEach((n) => n.remove());
      const text = (clone.innerText || clone.textContent || "")
        .replace(/\s+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      return text.slice(0, 18000);
    } catch {
      return "";
    }
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
})();
