(function () {
    var hlsScriptUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
    var hlsPromise = null;

    function loadHls() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (!hlsPromise) {
            hlsPromise = new Promise(function (resolve, reject) {
                var script = document.createElement('script');
                script.src = hlsScriptUrl;
                script.async = true;
                script.onload = function () {
                    resolve(window.Hls);
                };
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        return hlsPromise;
    }

    function attachStream(video, stream) {
        if (video.getAttribute('data-ready') === '1') {
            return Promise.resolve();
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.setAttribute('data-ready', '1');
            return Promise.resolve();
        }

        return loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.setAttribute('data-ready', '1');
            }
        });
    }

    function startPlayer(player) {
        var stream = player.getAttribute('data-stream');
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');

        if (!stream || !video) {
            return;
        }

        video.controls = true;
        if (cover) {
            cover.classList.add('is-hidden');
        }

        attachStream(video, stream).then(function () {
            var playResult = video.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(function () {
                    video.controls = true;
                });
            }
        });
    }

    document.querySelectorAll('.movie-player').forEach(function (player) {
        var cover = player.querySelector('.player-cover');
        var video = player.querySelector('video');

        if (cover) {
            cover.addEventListener('click', function () {
                startPlayer(player);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayer(player);
                }
            });
        }
    });
})();
