const emoji = require('node-emoji');

class Emojis {
  /**
   * 
   * @param {String} text - Emoji.
   */
  get(text) {
    return emoji.get(text);
  }

  /**
   * 
   */
  loadStandard() {
    return emoji.search('');
  }
}

module.exports = new Emojis();