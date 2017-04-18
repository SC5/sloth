const config = {
  token: 'slack-token-here', // If you have not registered a Slack app yet, you can do it here: https://api.slack.com/apps
  forceUpdate: false, // Should this script force update the status based on the SSID (overwrites manually set custom statuses).
};

const ssids = [
  {
    ssid: 'ssid of home', // Name of the Wifi SSID, case-insensitive
    status: 'Working remotely', // Status text you want to set
    icon: ':house_with_garden:' // Emoji you want to set
  },
  {
    ssid: 'ssid of work',
    status: 'At office',
    icon: ':office:'
  },
];

module.exports = {
  token,
  ssids,
};