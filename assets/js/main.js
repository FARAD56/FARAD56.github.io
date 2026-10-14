(function () {
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.querySelectorAll(".theme").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("aa-theme", next); } catch (e) {}
    });
  });

  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll(".copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var label = btn.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(btn.getAttribute("data-copy")).then(function () {
          btn.textContent = "Copied";
          btn.classList.add("done");
          setTimeout(function () { btn.textContent = label; btn.classList.remove("done"); }, 1600);
        }, function () {});
      }
    });
  });

  document.querySelectorAll(".spot").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  var reveals = document.querySelectorAll(".reveal");
  if (hasIO && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + "ms";
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  var word = document.querySelector(".rotate-word");
  if (word && !reduceMotion) {
    var words = word.getAttribute("data-words").split("|");
    (async function () {
      var i = 0;
      for (;;) {
        await sleep(2200);
        var current = words[i % words.length];
        for (var k = current.length; k >= 0; k--) { word.textContent = current.slice(0, k); await sleep(32); }
        i++;
        var next = words[i % words.length];
        for (var j = 1; j <= next.length; j++) { word.textContent = next.slice(0, j); await sleep(55); }
      }
    })();
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var start = performance.now();
    var duration = 1300;
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals) + (t === 1 ? (el.getAttribute("data-suffix") || "") : "");
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (hasIO && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { countUp(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  var term = document.querySelector(".term-body");
  if (term) {
    var lines = term.querySelectorAll(".ln");
    var play = async function () {
      for (;;) {
        lines.forEach(function (l) { l.classList.remove("on"); });
        await sleep(500);
        for (var i = 0; i < lines.length; i++) {
          lines[i].classList.add("on");
          await sleep(i === 3 ? 1100 : 650);
        }
        await sleep(5000);
      }
    };
    if (reduceMotion || !hasIO) {
      lines.forEach(function (l) { l.classList.add("on"); });
    } else {
      var to = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { to.disconnect(); play(); }
      }, { threshold: 0.4 });
      to.observe(term);
    }
  }

  var modal = document.getElementById("video-modal");
  if (modal && typeof modal.showModal === "function") {
    var frame = modal.querySelector("iframe");
    var title = modal.querySelector(".video-title");
    var close = function () { modal.close(); };
    modal.addEventListener("close", function () { frame.removeAttribute("src"); });
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    modal.querySelector(".video-close").addEventListener("click", close);
    document.querySelectorAll("[data-video]").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        title.textContent = link.getAttribute("data-video-title") || "";
        frame.setAttribute("src", link.getAttribute("data-video"));
        modal.showModal();
      });
    });
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if (hasIO && sections.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id); });
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { so.observe(s); });
  }
})();
