const DEFAULT_CONFIG = {
  token: '',
  interval: 5,
  forceUpdate: false,
  iface: null,
  ssids: [],
  defaultCollapsed: ['1', '2', '3'],
};

const PRODUCT_NAME = 'Sloth';
const PRODUCT_URL = 'https://github.com/sc5/sloth/releases';

/* eslint-disable */
const MILLISECOND     = 1;
const QUARTER_SECOND  = 250   * MILLISECOND;
const HALF_SECOND     = 2     * QUARTER_SECOND;
const SECOND          = 2     * HALF_SECOND;
const QUARTER_MINUTE  = 15    * SECOND;
const HALF_MINUTE     = 2     * QUARTER_MINUTE;
const MINUTE          = 2     * HALF_MINUTE;
const QUARTER_HOUR    = 15    * MINUTE;
const HALF_HOUR       = 2     * QUARTER_HOUR;
const HOUR            = 2     * HALF_HOUR;
const QUARTER_DAY     = 6     * HOUR;
const HALF_DAY        = 2     * QUARTER_DAY;
const DAY             = 2     * HALF_DAY;
const WEEK            = 7     * DAY;
const MONTH           = 4     * WEEK;
const YEAR            = 365   * DAY;
/* eslint-enable */

const TIMES = {
  MILLISECOND,
  QUARTER_SECOND,
  HALF_SECOND,
  SECOND,
  QUARTER_MINUTE,
  HALF_MINUTE,
  MINUTE,
  QUARTER_HOUR,
  HALF_HOUR,
  HOUR,
  QUARTER_DAY,
  HALF_DAY,
  DAY,
  WEEK,
  MONTH,
  YEAR,
};


const MENU_TEMPLATE = [
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
    ],
  },
  {
    role: 'window',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { type: 'separator' },
      { role: 'close' },
      { role: 'minimize' },
    ],
  },
];

if (process.platform === 'darwin') {
  // Window menu
  MENU_TEMPLATE[1].submenu = [
    { role: 'reload' },
    { role: 'forcereload' },
    { type: 'separator' },
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' },
  ];
}

module.exports = {
  TIMES,
  DEFAULT_CONFIG,
  MENU_TEMPLATE,
  PRODUCT_NAME,
  PRODUCT_URL,
};
