// The only interactive surface on the page: two buttons that copy a
// command. writeText rejects when the clipboard permission is denied or
// the document isn't focused, which the presence of navigator.clipboard
// does not rule out — hence the "press ⌘C" fallback rather than a
// silent failure.
(function () {
  var buttons = document.querySelectorAll(".copy");
  for (var i = 0; i < buttons.length; i++) {
    (function (btn) {
      var label = btn.textContent;
      var flash = function (text, cls) {
        btn.textContent = text;
        btn.classList.add(cls);
        setTimeout(function () {
          btn.textContent = label;
          btn.classList.remove(cls);
        }, 1400);
      };
      var fail = function () {
        flash("press ⌘C", "failed");
      };
      btn.addEventListener("click", function () {
        if (navigator.clipboard)
          navigator.clipboard
            .writeText(btn.dataset.copy)
            .then(function () {
              flash("copied", "done");
            }, fail);
        else fail();
      });
    })(buttons[i]);
  }
})();
