(function () {
    function attach(video, src) {
        if (!video || !src) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(src);
            hls.attachMedia(video);
            return;
        }

        video.src = src;
    }

    function play(shell) {
        var video = shell.querySelector('video');
        var src = shell.getAttribute('data-hls');

        if (!video) {
            return;
        }

        if (!shell.getAttribute('data-ready')) {
            attach(video, src);
            shell.setAttribute('data-ready', '1');
        }

        shell.classList.add('is-playing');
        video.controls = true;

        var promise = video.play();

        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    document.querySelectorAll('[data-player]').forEach(function (shell) {
        var button = shell.querySelector('.play-cover');
        var video = shell.querySelector('video');

        if (button) {
            button.addEventListener('click', function () {
                play(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play(shell);
                }
            });
        }
    });
})();
