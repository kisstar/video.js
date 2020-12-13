import videojs from './js';

window.myvideo = videojs('video-player', {
  controls: true,
  // autoplay: true,
  controlBar: true
});

export default videojs;
