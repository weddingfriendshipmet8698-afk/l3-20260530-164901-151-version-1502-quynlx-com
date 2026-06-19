(function () {
  var video = document.querySelector('.player-video');
  var button = document.querySelector('[data-player-button]');
  var hlsInstance = null;
  var started = false;

  function bindVideo() {
    if (!video || started) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    started = true;

    if (button) {
      button.classList.add('is-hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', bindVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!started) {
        bindVideo();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
