// Stand-in for the YouTube IFrame API. Implements only the documented surface the page uses:
// YT.Player(element, { host, videoId, playerVars, events }), loadVideoById, PlayerState.ENDED,
// onReady / onStateChange / onError, and window.onYouTubeIframeAPIReady.
const script = `
window.__yt = { configs: [], loads: [], players: [] };
window.YT = {
  PlayerState: { ENDED: 0, PLAYING: 1 },
  Player: function (target, cfg) {
    var self = this;
    var el = typeof target === 'string' ? document.getElementById(target) : target;
    var iframe = document.createElement('iframe');
    var host = String(cfg.host || 'https://www.youtube.com').replace(/^https?:\\/\\//, '');
    iframe.src = 'https://' + host + '/embed/' + cfg.videoId + '?autoplay=' + ((cfg.playerVars || {}).autoplay || 0);
    iframe.setAttribute('data-video-id', cfg.videoId);
    el.parentNode.replaceChild(iframe, el);
    self.iframe = iframe;
    window.__yt.configs.push(cfg);
    window.__yt.players.push(self);
    self.loadVideoById = function (id) { iframe.setAttribute('data-video-id', id); window.__yt.loads.push(id); };
    setTimeout(function () { if (cfg.events && cfg.events.onReady) cfg.events.onReady({ target: self }); }, 0);
    window.__ytEnd = function () { cfg.events.onStateChange({ data: 0, target: self }); };
    window.__ytError = function () { cfg.events.onError({ data: 150, target: self }); };
  }
};
if (typeof window.onYouTubeIframeAPIReady === 'function') window.onYouTubeIframeAPIReady();
`;

async function stubYouTube(page, { delayMs = 0, mode = 'ok' } = {}) {
  const counter = { requests: 0 };
  await page.route('https://www.youtube.com/iframe_api', async route => {
    counter.requests += 1;
    if (mode === 'abort') return route.abort();
    if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
    if (mode === 'never') return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* never ready */' });
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: script });
  });
  return counter;
}

module.exports = { stubYouTube };
