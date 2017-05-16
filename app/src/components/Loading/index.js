import './Loading.less';

import React from 'react';

import { Spin } from 'antd';

class Loading extends React.Component {
  render = () => (
    <div className="loading">
      <Spin />
    </div>
  )
}

export default Loading;
