import React from 'react';
import PropTypes from 'prop-types';

import './Emoji.less';

import Emojis from '../../utils/Emojis';

const Emoji = (props) => {
  if (props.emojis && props.emojis !== null) {
    const strippedEmoji = props.emoji.replace(/:/g, '');
    let source = props.emojis[strippedEmoji];

    const regex = new RegExp(/^alias:(.*)/i);
    const matches = regex.exec(source);

    if (matches) {
      source = props.emojis[matches[1]];
    }

    if (source) {
      return (
        <img className="emoji" src={source} alt="" />
      );
    }
  }

  return <span className="emoji">{Emojis.get(props.emoji)}</span>;
};

Emoji.propTypes = {
  emojis: PropTypes.instanceOf(Object).isRequired,
  emoji: PropTypes.string.isRequired,
};

export default Emoji;
