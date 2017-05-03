const path = require('path');

let emoji;
try      { emoji = require('node-emoji'); }
catch(e) { emoji = require(path.resolve(__dirname, '../../../../executables/node_modules/node-emoji/index.js')); }

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
