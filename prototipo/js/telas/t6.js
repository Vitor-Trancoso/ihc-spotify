(function () {
  "use strict";

  function log(alvo, meta) {
    try { window.Telemetria && window.Telemetria.log("T6", alvo, meta || {}); } catch (e) {}
  }

  function setDeviceBg(color) {
    var device = document.querySelector(".t6-device");
    if (device) device.style.backgroundColor = color;
  }

  function fmtCount(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
    return String(n);
  }

  function parseCount(txt) {
    if (!txt) return 0;
    var s = txt.replace(",", ".").trim();
    if (/M$/i.test(s)) return Math.round(parseFloat(s) * 1000000);
    if (/k$/i.test(s)) return Math.round(parseFloat(s) * 1000);
    var n = parseInt(s, 10);
    return isNaN(n) ? 0 : n;
  }

  function bindClip(clip) {
    var id = clip.dataset.clipId;

    var like = clip.querySelector('[data-act="like"]');
    if (like) {
      like.addEventListener("click", function () {
        var pressed = like.getAttribute("aria-pressed") === "true";
        var next = !pressed;
        like.setAttribute("aria-pressed", String(next));
        var countEl = like.querySelector(".t6-action__count");
        if (countEl) {
          var n = parseCount(countEl.textContent);
          countEl.textContent = fmtCount(n + (next ? 1 : -1));
        }
        log(next ? "like_clip" : "unlike_clip", { id: id });
      });
    }

    var save = clip.querySelector('[data-act="save"]');
    if (save) {
      save.addEventListener("click", function () {
        log("save_clip", { id: id });
        save.setAttribute("aria-pressed", "true");
      });
    }

    var share = clip.querySelector('[data-act="share"]');
    if (share) {
      share.addEventListener("click", function () { log("share_clip", { id: id }); });
    }

    var more = clip.querySelector('[data-act="more"]');
    if (more) {
      more.addEventListener("click", function () { log("more_clip", { id: id }); });
    }

    var play = clip.querySelector('[data-act="play"]');
    if (play) {
      play.addEventListener("click", function () {
        var playing = play.getAttribute("aria-pressed") === "true";
        var next = !playing;
        play.setAttribute("aria-pressed", String(next));
        clip.classList.toggle("is-paused", !next);
        var iconEl = play.querySelector("[data-lucide]");
        if (iconEl) {
          iconEl.setAttribute("data-lucide", next ? "pause" : "play");
          if (window.lucide) window.lucide.createIcons();
        }
        play.setAttribute("aria-label", next ? "Pausar prévia" : "Reproduzir prévia");
        log(next ? "play_clip" : "pause_clip", { id: id });
      });
    }
  }

  function init() {
    if (window.lucide) window.lucide.createIcons();

    var feed = document.getElementById("t6-feed");
    if (!feed) return;
    var clips = feed.querySelectorAll(".t6-clip");
    clips.forEach(bindClip);

    if (clips.length) {
      setDeviceBg(clips[0].dataset.bg || "#000");
      log("view_clip", { id: clips[0].dataset.clipId });
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            var clip = entry.target;
            setDeviceBg(clip.dataset.bg || "#000");
            log("view_clip", { id: clip.dataset.clipId });
            clips.forEach(function (c) { c.classList.toggle("is-paused", c !== clip); });
          }
        });
      }, { root: feed, threshold: [0.6] });
      clips.forEach(function (c) { io.observe(c); });
    }

    var tabs = document.querySelectorAll(".t6-topbar__tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("t6-topbar__tab--active");
          t.setAttribute("aria-pressed", "false");
        });
        tab.classList.add("t6-topbar__tab--active");
        tab.setAttribute("aria-pressed", "true");
        log("switch_tab", { tab: tab.textContent.trim() });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
