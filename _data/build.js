// Values fixed at build time (REF-09: the footer copyright ends at the build year).
module.exports = () => ({ year: new Date().getFullYear() });
