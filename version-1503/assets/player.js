(function () {
  var video = document.getElementById("movie-player");
  var overlay = document.getElementById("play-overlay");

  if (!video) {
    return;
  }

  var stream = video.getAttribute("data-stream");
  var prepared = false;
  var hlsInstance = null;

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener("load", function () {
          resolve(window.Hls);
        });
        existing.addEventListener("error", reject);
        if (window.Hls) {
          resolve(window.Hls);
        }
        return;
      }
      var script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async function getHlsClass() {
    if (window.Hls) {
      return window.Hls;
    }
    try {
      var module = await import("./assets/hls-vendor.js");
      return module.H;
    } catch (error) {
      try {
        return await loadScript("https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js");
      } catch (fallbackError) {
        return null;
      }
    }
  }

  async function prepareVideo() {
    if (prepared || !stream) {
      return;
    }
    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    var HlsClass = await getHlsClass();
    if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
      hlsInstance = new HlsClass({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  async function startPlayback() {
    await prepareVideo();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    try {
      await video.play();
    } catch (error) {
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance && hlsInstance.destroy) {
      hlsInstance.destroy();
    }
  });
})();
