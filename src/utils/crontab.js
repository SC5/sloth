const execSync = require('child_process').execSync;

const argument = process.argv[2] || 'install';

let output;
const install = "crontab -l 2> /dev/null | grep -q '# ssid-to-slack-status' && echo 'Already installed in crontab' || ((crontab -l 2>/dev/null; echo \"*/5 * * * * $(pwd)/execute-in-crontab.sh >/dev/null 2>&1 # ssid-to-slack-status\") | crontab - && echo 'Installed in crontab')";
const uninstall = "crontab -l 2> /dev/null | grep -q '# ssid-to-slack-status' && crontab -l 2>/dev/null | grep -v '# ssid-to-slack-status' | crontab - && echo 'Uninstalled from crontab' || echo 'Was not installed in crontab'";

const parseOutput = command => (
  execSync(command).toString().replace(/^\s+|\s+$/g, '')
)

switch (argument) {
  case 'install': {
    output = parseOutput(install);
    break;
  }
  case 'uninstall': {
    output = parseOutput(uninstall);
    break;
  }
  case 'reinstall': {
    const uninstallStatus = parseOutput(uninstall);
    const installStatus = parseOutput(install);

    output = "Reinstalled in crontab";
    if (uninstallStatus === 'Was not installed in crontab') {
      output = 'Installed in crontab';
    }
    break;
  }
  default: {
    output = `No such option "${argument}"`;
    break;
  }
}

console.log(output);