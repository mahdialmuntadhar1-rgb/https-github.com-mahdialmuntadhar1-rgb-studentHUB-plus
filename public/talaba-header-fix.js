(function () {
  function getCurrentLang() {
    var htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    var saved =
      localStorage.getItem("language") ||
      localStorage.getItem("lang") ||
      localStorage.getItem("i18nextLng") ||
      localStorage.getItem("talaba-language") ||
      "";
    saved = saved.toLowerCase();

    if (htmlLang.startsWith("ar") || saved.startsWith("ar")) return "ar";
    if (htmlLang.startsWith("ku") || htmlLang.startsWith("ckb") || saved.startsWith("ku") || saved.startsWith("ckb")) return "ku";
    return "en";
  }

  function setDirection(lang) {
    document.documentElement.lang = lang === "ku" ? "ku" : lang;
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
  }

  function saveLanguage(lang) {
    localStorage.setItem("language", lang);
    localStorage.setItem("lang", lang);
    localStorage.setItem("talaba-language", lang);
    localStorage.setItem("i18nextLng", lang);
    setDirection(lang);
  }

  function clickExistingLanguage(lang) {
    var words = {
      ar: ["العربية", "عربي", "Arabic", "AR"],
      ku: ["کوردی", "كوردي", "Kurdish", "KU", "CKB"],
      en: ["English", "EN"]
    };

    var all = Array.from(document.querySelectorAll("button, a, [role='button'], select, option"));
    var target = all.find(function (el) {
      if (el.closest("#talaba-clean-topbar")) return false;
      var text = (el.innerText || el.textContent || el.value || "").trim();
      return words[lang].some(function (w) {
        return text.toLowerCase().includes(w.toLowerCase());
      });
    });

    if (target) {
      try { target.click(); } catch (e) {}
      return true;
    }

    return false;
  }

  function clickExistingLogin() {
    var all = Array.from(document.querySelectorAll("a, button, [role='button']"));

    var target = all.find(function (el) {
      if (el.closest("#talaba-clean-topbar")) return false;

      var text = (el.innerText || el.textContent || el.getAttribute("aria-label") || "").trim().toLowerCase();
      var href = (el.getAttribute("href") || "").toLowerCase();

      return (
        text.includes("login") ||
        text.includes("sign in") ||
        text.includes("تسجيل") ||
        text.includes("دخول") ||
        text.includes("چوونەژوور") ||
        href.includes("login") ||
        href.includes("signin")
      );
    });

    if (target) {
      try { target.click(); } catch (e) {}
      return true;
    }

    window.location.hash = "#/login";
    return false;
  }

  function hideOldCrowdedHeader() {
    var candidates = Array.from(document.querySelectorAll(
      "header, nav, [class*='Header'], [class*='header'], [class*='Navbar'], [class*='navbar'], [class*='Top'], [class*='top']"
    ));

    candidates.forEach(function (el) {
      if (el.id === "talaba-clean-topbar" || el.closest("#talaba-clean-topbar")) return;

      var rect = el.getBoundingClientRect();
      if (rect.top > 170) return;

      var text = (el.innerText || el.textContent || "").toLowerCase();

      var looksLikeTopHeader =
        text.includes("talaba") ||
        text.includes("talava") ||
        text.includes("login") ||
        text.includes("english") ||
        text.includes("العربية") ||
        text.includes("کوردی") ||
        text.includes("كوردی") ||
        el.querySelector("img, svg, button, a");

      if (looksLikeTopHeader) {
        el.classList.add("talaba-hide-old-header");
      }
    });
  }

  function createCleanHeader() {
    if (document.getElementById("talaba-clean-topbar")) return;

    var currentLang = getCurrentLang();
    setDirection(currentLang);

    var bar = document.createElement("div");
    bar.id = "talaba-clean-topbar";
    bar.innerHTML =
      '<div class="talaba-main-row">' +
        '<div class="talaba-brand">Talaba</div>' +
        '<button class="talaba-login-btn" type="button">Login</button>' +
      '</div>' +
      '<div class="talaba-lang-row">' +
        '<button class="talaba-lang-btn" data-lang="ar" type="button"><span>🇮🇶</span><span>العربية</span></button>' +
        '<button class="talaba-lang-btn" data-lang="ku" type="button"><span class="talaba-kurdistan-flag"></span><span>کوردی</span></button>' +
        '<button class="talaba-lang-btn" data-lang="en" type="button"><span>🇺🇸</span><span>English</span></button>' +
      '</div>';

    document.body.insertBefore(bar, document.body.firstChild);

    bar.querySelector(".talaba-login-btn").addEventListener("click", function () {
      clickExistingLogin();
    });

    bar.querySelectorAll(".talaba-lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        saveLanguage(lang);
        clickExistingLanguage(lang);

        bar.querySelectorAll(".talaba-lang-btn").forEach(function (b) {
          b.classList.toggle("talaba-active", b.getAttribute("data-lang") === lang);
        });

        setTimeout(function () {
          window.dispatchEvent(new Event("languagechange"));
        }, 50);
      });

      btn.classList.toggle("talaba-active", btn.getAttribute("data-lang") === currentLang);
    });
  }

  function runFix() {
    createCleanHeader();
    hideOldCrowdedHeader();
  }

  runFix();

  var observer = new MutationObserver(function () {
    runFix();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
