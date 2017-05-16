const emoji = require('node-emoji');

class Emojis {
  /**
   *
   * @param {String} text - Emoji.
   */
  static get(text) {
    return emoji.get(text);
  }

  /**
   *
   */
  static loadStandard() {
    return emoji.search('');
  }
}

module.exports = new Emojis();
