import { H as Hls } from './hls-vendor-dru42stk.js';

export function startMoviePlayer(url) {
  const video = document.querySelector('[data-movie-video]');
  const cover = document.querySelector('[data-player-cover]');

  if (!video || !url) {
    return;
  }

  let prepared = false;

  function prepare() {
    if (prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function play() {
    prepare();
    if (cover) {
      cover.classList.add('hidden');
    }
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('play', function () {
    if (cover) {
      cover.classList.add('hidden');
    }
  });
}
