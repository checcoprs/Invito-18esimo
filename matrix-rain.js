(function () {
  var canvas = document.getElementById("matrixRain");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var chars = "アイウエオカキクケコ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var fontSize = 16;
  var drops = [];

  function resize() {
    var w = Math.max(window.innerWidth, 1);
    var h = Math.max(window.innerHeight, 1);
    canvas.width = w;
    canvas.height = h;
    var n = Math.floor(w / fontSize);
    drops = new Array(n);
    for (var i = 0; i < n; i++) {
      drops[i] = Math.random() * (h / fontSize);
    }
  }

  function draw() {
    var w = canvas.width;
    var h = canvas.height;
    if (!w || !h) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#00ff41";
    ctx.font = fontSize + "px Courier New, monospace";
    for (var i = 0; i < drops.length; i++) {
      ctx.fillText(
        chars[Math.floor(Math.random() * chars.length)],
        i * fontSize,
        drops[i] * fontSize
      );
      if (drops[i] * fontSize > h && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.35;
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", function () {
    setTimeout(resize, 200);
  });
})();
