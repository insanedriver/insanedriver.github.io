const core = require('../assets/js/home-core.js');

// What the inline boot gate in _layouts/home.html needs at build time: the
// sessionStorage key home-core.js reads and writes for repeat views.
module.exports = () => ({ key: core.BOOT_KEY });
