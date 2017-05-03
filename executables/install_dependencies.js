const execSync = require('child_process').execSync;

const Package = require('../package.json');
const parentDependencies = Object.keys(Package.dependencies);
const dependencies = [
  {
    name: 'asar-require',
    version: null
  },
  ...parentDependencies
  .filter(dep => ['slack', 'node-emoji', 'node-wifi'].includes(dep))
  .map(dep => ({
    name: dep,
    version: Package.dependencies[dep],
  }))
];

dependencies.map(dep => {
  const package = dep.name + (dep.version ? `@${dep.version}` : '');
  console.log('', package);
  const output = execSync(`npm install --save ${package}`).toString();
});
