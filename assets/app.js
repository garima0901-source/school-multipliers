(function () {
  "use strict";
  var D = window.SM;
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } }
  var TIER = { now: "Now", next: "Next", later: "Later" };

  // Why-now insights
  $("insights").innerHTML = D.insights.map(function (i) {
    return '<div class="insight"><p class="num">' + esc(i.num) + "</p><p>" + esc(i.text) +
      '</p><p class="src">Source: <a href="' + esc(i.source) + '" target="_blank" rel="noopener">' + esc(host(i.source)) + "</a></p></div>";
  }).join("");

  // Multiplier cards with a priority filter
  function renderCards(tier) {
    $("cards").innerHTML = D.multipliers.filter(function (m) { return tier === "all" || m.tier === tier; }).map(function (m) {
      return '<article class="card">' +
        '<p class="kind">' + esc(m.type) + '<span class="tier ' + m.tier + '">' + TIER[m.tier] + "</span></p>" +
        "<h3>" + esc(m.name) + "</h3>" +
        '<p class="fact">' + esc(m.fact) + "</p>" +
        '<p><span class="lbl">Why they\'d say yes</span>' + esc(m.why) + "</p>" +
        '<p class="ask"><span class="lbl">The ask</span>' + esc(m.ask) + "</p>" +
        '<p class="src">Source: <a href="' + esc(m.source) + '" target="_blank" rel="noopener">' + esc(host(m.source)) + "</a></p>" +
        "</article>";
    }).join("");
  }
  var filter = $("tier-filter");
  filter.innerHTML = [["all", "All"], ["now", "Now"], ["next", "Next"], ["later", "Later"]].map(function (t, i) {
    return '<button type="button" aria-pressed="' + (i === 0) + '" data-t="' + t[0] + '">' + t[1] + "</button>";
  }).join("");
  filter.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    filter.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
    renderCards(b.getAttribute("data-t"));
  });
  renderCards("all");

  // Funnel model
  function funnel() {
    var c = +$("f-contacted").value || 0, r = (+$("f-reply").value || 0) / 100, s = (+$("f-sign").value || 0) / 100,
        st = +$("f-students").value || 0, m = +$("f-months").value || 0;
    var contacted = c * m, replied = Math.round(contacted * r), partners = Math.round(replied * s), students = partners * st;
    var steps = [
      ["Schools contacted", contacted],
      ["Schools that reply", replied],
      ["Partner schools signed", partners],
      ["Students registered through partners", students]
    ];
    var max = Math.max(contacted, students, 1);
    $("funnel-out").innerHTML = steps.map(function (st2) {
      var w = Math.max(2, Math.round(st2[1] / max * 100));
      return '<div class="step"><span>' + esc(st2[0]) + "</span><b>" + st2[1].toLocaleString("en-IN") + '</b><div class="bar"><span style="width:' + w + '%"></span></div></div>';
    }).join("") + '<p class="note">Over ' + m + " months at " + c + " schools a month. Change any input to see the effect.</p>";
  }
  ["f-contacted", "f-reply", "f-sign", "f-students", "f-months"].forEach(function (id) { $(id).addEventListener("input", funnel); });
  funnel();

  // Sources, deduplicated
  var seen = {}, srcs = [];
  D.insights.concat(D.multipliers).forEach(function (x) { if (!seen[x.source]) { seen[x.source] = 1; srcs.push(x.source); } });
  [
    "https://news.careers360.com/598-kendriya-vidyalaya-students-shortlisted-for-inspire-manak-awards-2025"
  ].forEach(function (u) { if (!seen[u]) { seen[u] = 1; srcs.push(u); } });
  $("source-list").innerHTML = srcs.map(function (u) {
    return '<li><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u) + "</a></li>";
  }).join("");
})();
