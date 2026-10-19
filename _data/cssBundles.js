const fs = require('fs');
const path = require('path');

// The page areas that have a CSS bundle (less/pages/<area>.less -> /assets/css/<area>.min.css).
// head/styles links the bundle whose name matches the page's page_id.
module.exports = () => fs.readdirSync(path.join(__dirname, '../less/pages'))
    .filter(f => f.endsWith('.less'))
    .map(f => path.basename(f, '.less'));
