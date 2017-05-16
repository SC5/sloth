import React from 'react';

import { Spin } from 'antd';

import './Loading.less';

const Loading = () => (
  <div className="loading">
    <Spin />
  </div>
);

export default Loading;
