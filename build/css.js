/* eslint-disable function-paren-newline */

const sh = require('shelljs');

sh.exec(
  "npx sass --load-path='./' --no-source-map src/css/vjs.scss dist/video-js.css"
);
