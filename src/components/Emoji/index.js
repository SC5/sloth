import './Emoji.css';

import React from 'react';

import Utils from '../../utils';
const utils = new Utils();

class Emoji extends React.Component {
  render = () => {
    if (this.props.emojis && this.props.emojis !== null) {
      const strippedEmoji = this.props.emoji.replace(/:/g, '');
      const source = this.props.emojis[strippedEmoji];

      if (source) {
        return (
          <img className="emoji" src={source} />
        );
      }
    }

    return <span className="emoji">{utils.getEmoji(this.props.emoji)}</span>;
  }
}

export default Emoji;
