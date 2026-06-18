(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var shell = document.querySelector('.video-shell');
        var video = document.getElementById('movie-player');
        var button = document.querySelector('.player-start');
        var message = document.querySelector('.player-message');

        if (!shell || !video || !button) {
            return;
        }

        var source = shell.getAttribute('data-video-url');
        var hlsInstance = null;
        var initialized = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    setMessage('浏览器拦截了自动播放，请再次点击播放器开始播放。');
                    button.classList.remove('is-hidden');
                });
            }
        }

        function initializePlayer() {
            if (!source) {
                setMessage('未找到可用播放源。');
                return;
            }

            button.classList.add('is-hidden');
            setMessage('正在加载播放源...');

            if (initialized) {
                playVideo();
                return;
            }

            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setMessage('');
                    playVideo();
                });

                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setMessage('播放源加载失败，请刷新页面或稍后重试。');
                        button.classList.remove('is-hidden');
                        if (hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                        }
                        initialized = false;
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    setMessage('');
                    playVideo();
                }, { once: true });
                video.addEventListener('error', function () {
                    setMessage('播放源加载失败，请刷新页面或稍后重试。');
                    button.classList.remove('is-hidden');
                    initialized = false;
                }, { once: true });
            } else {
                setMessage('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或移动端浏览器。');
                button.classList.remove('is-hidden');
                initialized = false;
            }
        }

        button.addEventListener('click', initializePlayer);
        video.addEventListener('click', function () {
            if (!initialized) {
                initializePlayer();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
