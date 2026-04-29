(function () {
  "use strict";

  var BASE_URL = "https://volimto.sk";

  function init() {
    var scripts = document.querySelectorAll("script[data-chart]");
    scripts.forEach(function (script) {
      var chart = script.getAttribute("data-chart") || "polls";
      var theme = script.getAttribute("data-theme") || "light";
      var height = script.getAttribute("data-height") || "400";
      var parties = script.getAttribute("data-parties") || "";

      if (chart !== "polls") return;

      var params = new URLSearchParams();
      params.set("theme", theme);
      params.set("height", height);
      if (parties) params.set("parties", parties);

      var src = BASE_URL + "/embed/" + chart + "?" + params.toString();

      var iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.style.border = "none";
      iframe.style.width = "100%";
      iframe.style.height = parseInt(height, 10) + 32 + "px"; // +32 for attribution bar
      iframe.style.display = "block";
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute("title", "VolímTo — volebné prieskumy");
      iframe.setAttribute("allowfullscreen", "false");

      script.parentNode.insertBefore(iframe, script.nextSibling);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
