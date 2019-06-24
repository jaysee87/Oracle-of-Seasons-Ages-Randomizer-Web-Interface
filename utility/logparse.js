const fs = require('fs');
const log = fs.readFileSync('./ooatest.txt', {encoding: 'utf8'});
const locations = [];
const items = [];
const lines = log.split('\r\n');

lines.forEach(line => {
  if (line.indexOf(' <-') > -1){
    const location = line.split(' <-').map(item=>item.trim());
    locations.push(location[0])
    items.push(location[1]);
  }
})