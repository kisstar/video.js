/**
 * @file loader.js
 */
import Component from '../component.js';
import Tech from './tech.js';
import {toTitleCase} from '../utils/string-cases.js';
import mergeOptions from '../utils/merge-options.js';

/**
 * The `MediaLoader` is the `Component` that decides which playback technology to load
 * when a player is initialized.
 *
 * @extends Component
 */
// “MediaLoader”是决定加载哪种播放技术的“组件”
class MediaLoader extends Component {

  /**
   * Create an instance of this class.
   *
   * @param {Player} player
   *        The `Player` that this class should attach to.
   *
   * @param {Object} [options]
   *        The key/value store of player options.
   *
   * @param {Component~ReadyCallback} [ready]
   *        The function that is run when this component is ready.
   */
  constructor(player, options, ready) {
    // MediaLoader has no element
    const options_ = mergeOptions({createEl: false}, options);

    super(player, options_, ready);

    // If there are no sources when the player is initialized,
    // load the first supported playback technology.
    // 如果播放器初始化时没有任何源，
    // 加载浏览器第一个支持的播放技术。

    if (!options.playerOptions.sources || options.playerOptions.sources.length === 0) {
      for (let i = 0, j = options.playerOptions.techOrder; i < j.length; i++) {
        const techName = toTitleCase(j[i]);
        let tech = Tech.getTech(techName);

        // Support old behavior of techs being registered as components.
        // Remove once that deprecated behavior is removed.
        // 支持 techs 注册为组件的旧行为。
        // 一旦不推荐的行为被删除，就删除。
        if (!techName) {
          tech = Component.getComponent(techName);
        }

        // Check if the browser supports this technology
        if (tech && tech.isSupported()) {
          player.loadTech_(techName);
          break;
        }
      }
    } else {
      // Loop through playback technologies (HTML5, Flash) and check for support.
      // Then load the best source.
      // A few assumptions here:
      //   All playback technologies respect preload false.
      // 循环播放技术（HTML5，Flash）并检查支持。
      // 然后加载最佳源。
      // 这里有几个假设：
      // 所有播放技术都尊重预加载错误。
      player.src(options.playerOptions.sources);
    }
  }
}

Component.registerComponent('MediaLoader', MediaLoader);
export default MediaLoader;
