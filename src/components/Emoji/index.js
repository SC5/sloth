import './Emoji.less';

import React from 'react';

import Emojis from '../../utils/Emojis';

class Emoji extends React.Component {
  render = () => {
    if (this.props.emojis && this.props.emojis !== null) {
      const strippedEmoji = this.props.emoji.replace(/:/g, '');
      let source = this.props.emojis[strippedEmoji];

      var regex = new RegExp(/^alias:(.*)/i);
      var matches = regex.exec(source);

      if (matches) {
        source = this.props.emojis[matches[1]];
      }

      if (source) {
        return (
          <img className="emoji" src={source} />
        );
      }
    }

    return <span className="emoji">{Emojis.get(this.props.emoji)}</span>;
  }
}

export default Emoji;
