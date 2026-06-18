(function () {
  function setup(stage) {
    var video = stage.querySelector('video');
    var button = stage.querySelector('[data-play-button]');
    var stream = stage.getAttribute('data-stream');
    var connected = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function connect() {
      if (connected) {
        return;
      }
      connected = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      connect();
      if (button) {
        button.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    stage.addEventListener('click', function (event) {
      if (event.target === video || event.target === stage) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setup);
  });
})();
