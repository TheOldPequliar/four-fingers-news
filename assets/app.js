// &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
// WORLD MONITOR &#8212; ENGINE
// &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;

// &#9472;&#9472; Particles &#9472;&#9472;
(function initParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
    container.appendChild(p);
  }
})();

// &#9472;&#9472; Clock &#9472;&#9472;
function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('clock').innerHTML = timeStr;
  document.getElementById('clockDate').innerHTML = dateStr;
}
setInterval(updateClock, 1000);
updateClock();

// &#9552;&#9552;&#9552; LIVE DATA: STOCKS &#9552;&#9552;&#9552;
const STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'GOOG', name: 'Alphabet Inc.' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
  { symbol: 'BTC-USD', name: 'Bitcoin' },
];

let stockData = {};

// Attempt Yahoo Finance via AllOrigins proxy

// CORS PROXY HELPERS
const PROXIES=[
  url=>"https://api.allorigins.win/raw?url="+encodeURIComponent(url)+"&_t="+Date.now(),
  url=>"https://corsproxy.io/?"+encodeURIComponent(url),
  url=>"https://api.codetabs.com/v1/proxy?quest="+encodeURIComponent(url)
];
function timeAgoGlobal(dateStr) {
  var d = new Date(dateStr);
  var now = new Date();
  var diff = Math.floor((now - d) / 1000);
  if (diff < 60) return diff + 's ago';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
}
async function fetchViaProxy(url,timeoutMs){
  timeoutMs=timeoutMs||6000;
  for(var i=0;i<PROXIES.length;i++){try{
    var ctrl=new AbortController();var timer=setTimeout(function(){ctrl.abort();},timeoutMs);
    var resp=await fetch(PROXIES[i](url),{signal:ctrl.signal});clearTimeout(timer);
    if(resp.ok)return resp;
  }catch(e){}}
  return null;
}
async function fetchESPNRaw(path){
  var url="https://site.api.espn.com/apis/site/v2/sports/"+path;
  try{var ctrl=new AbortController();var timer=setTimeout(function(){ctrl.abort();},5000);
    var resp=await fetch(url,{signal:ctrl.signal});clearTimeout(timer);
    if(resp.ok)return resp;
  }catch(e){}
  return await fetchViaProxy(url);
}
async function fetchESPN(path){
  var r=await fetchESPNRaw(path);
  if(r)return r.json();
  return null;
}

async function fetchStockData() {
  var fetched=0;
  for(var j=0;j<STOCKS.length;j++){try{var sym=STOCKS[j].symbol;var resp=null;
  try{var ctrl=new AbortController();var timer=setTimeout(function(){ctrl.abort();},4000);
  resp=await fetch("https://query1.finance.yahoo.com/v8/finance/chart/"+sym+"?interval=1d&range=2d",{signal:ctrl.signal});
  clearTimeout(timer);if(!resp.ok)resp=null;}catch(e){resp=null;}
  if(!resp)resp=await fetchViaProxy("https://query1.finance.yahoo.com/v8/finance/chart/"+sym+"?interval=1d&range=2d");
  if(resp){var data=await resp.json();var meta=data&&data.chart&&data.chart.result&&data.chart.result[0]&&data.chart.result[0].meta;
  if(meta&&meta.regularMarketPrice){stockData[sym]={price:meta.regularMarketPrice,
  change:meta.previousClose?((meta.regularMarketPrice-meta.previousClose)/meta.previousClose)*100:0,
  prevClose:meta.previousClose||meta.regularMarketPrice,name:STOCKS[j].name};fetched++;}}}catch(e){console.log("Stock fail",e);}}
  if(fetched>0){renderStocks();renderTicker();return;}
  useSimulatedStocks();renderStocks();renderTicker();
}

function useSimulatedStocks() {
  const simulated = {
    'AAPL': { price: 242.58, change: 1.24, name: 'Apple Inc.' },
    'MSFT': { price: 478.92, change: 0.87, name: 'Microsoft Corp.' },
    'AMZN': { price: 218.45, change: -0.34, name: 'Amazon.com Inc.' },
    'NVDA': { price: 147.63, change: 2.15, name: 'NVIDIA Corp.' },
    'GOOG': { price: 193.27, change: 0.52, name: 'Alphabet Inc.' },
    'SPY': { price: 598.14, change: 0.68, name: 'S&P 500 ETF' },
    'QQQ': { price: 527.81, change: 0.93, name: 'Nasdaq 100 ETF' },
    'BTC-USD': { price: 87241, change: 1.47, name: 'Bitcoin' },
  };
  stockData = simulated;
  // Simulate subtle live movement
  setInterval(() => {
    Object.keys(stockData).forEach(sym => {
      const d = stockData[sym];
      const jitter = (Math.random() - 0.48) * d.price * 0.0008;
      d.price = Math.round((d.price + jitter) * 100) / 100;
      d.change = Math.round((d.change + (Math.random() - 0.48) * 0.05) * 100) / 100;
    });
    renderStocks();
    renderTicker();
  }, 3000);
  renderStocks();
  renderTicker();
}

function renderStocks() {
  const grid = document.getElementById('stockGrid');
  if (!grid) return;
  grid.innerHTML = '';
  STOCKS.forEach(s => {
    const d = stockData[s.symbol];
    if (!d) return;
    const up = d.change >= 0;
    const priceStr = s.symbol === 'BTC-USD' ? '$' + Math.round(d.price).toLocaleString() : '$' + d.price.toFixed(2);
    const changeStr = (up ? '+' : '') + d.change.toFixed(2) + '%';
    const card = document.createElement('div');
    card.className = 'stock-card fade-in';
    card.innerHTML = `
      <div class="stock-top">
        <span class="stock-symbol">${s.symbol === 'BTC-USD' ? 'BTC' : s.symbol}</span>
        <span class="stock-badge ${up ? 'up' : 'down'}">${changeStr}</span>
      </div>
      <div class="stock-price">${priceStr}</div>
      <div class="stock-name">${d.name || s.name}</div>
      <div class="sparkline-container"><canvas id="spark-${s.symbol}" width="200" height="40"></canvas></div>
    `;
    grid.appendChild(card);
    drawSparkline(`spark-${s.symbol}`, d.price, up);
  });

  // Update sidebar finance numbers
  document.getElementById('btcPrice').innerHTML = stockData['BTC-USD'] ? '$' + Math.round(stockData['BTC-USD'].price).toLocaleString() : '--';
}

function drawSparkline(canvasId, currentPrice, up) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Generate realistic-ish sparkline
  const points = 30;
  const data = [];
  let val = currentPrice * (1 - (Math.random() * 0.02));
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.47) * currentPrice * 0.003;
    data.push(val);
  }
  data.push(currentPrice);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  ctx.beginPath();
  ctx.strokeStyle = up ? '#00e68a' : '#ff4d6a';
  ctx.lineWidth = 1.5;
  data.forEach((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Gradient fill
  const last = data.length - 1;
  ctx.lineTo((last / (data.length - 1)) * w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, up ? 'rgba(0, 230, 138, 0.15)' : 'rgba(255, 77, 106, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fill();
}

function renderTicker() {
  const ticker = document.getElementById('ticker');
  let items = '';
  const tickerQuips = [
    '&#9749; Coffee futures looking strong',
    '&#127956;&#65039; Mt. Rainier still there (checked)',
    '&#128202; Stonks only go... well...',
  ];
  STOCKS.forEach(s => {
    const d = stockData[s.symbol];
    if (!d) return;
    const up = d.change >= 0;
    const sym = s.symbol === 'BTC-USD' ? 'BTC' : s.symbol;
    const priceStr = s.symbol === 'BTC-USD' ? '$' + Math.round(d.price).toLocaleString() : '$' + d.price.toFixed(2);
    items += `
      <div class="ticker-item">
        <span class="ticker-symbol">${sym}</span>
        <span class="ticker-price">${priceStr}</span>
        <span class="ticker-change ${up ? 'up' : 'down'}">${up ? '&#9650;' : '&#9660;'} ${Math.abs(d.change).toFixed(2)}%</span>
      </div>
      <span class="ticker-sep">&#9670;</span>
    `;
  });
  // Add quips to ticker
  tickerQuips.forEach(q => {
    items += `<div class="ticker-item"><span style="color: var(--text-muted); font-style: italic;">${q}</span></div><span class="ticker-sep">&#9670;</span>`;
  });
  // Duplicate for seamless loop
  ticker.innerHTML = items + items;
}

// &#9552;&#9552;&#9552; SPORTS DATA &#9552;&#9552;&#9552;
async function fetchSportsData() {
  // Try ESPN API for live scores
  const teams = {
    seahawks: { espnId: '26', league: 'football/nfl' },
    mariners: { espnId: '12', league: 'baseball/mlb' },
    kraken: { espnId: '24', league: 'hockey/nhl' },
  };

  // Seahawks
  try {
    const resp = await fetchESPNRaw('football/nfl/teams/26');
    if (resp && resp.ok) {
      const data = await resp.json();
      const team = data.team;
      const record = team.record?.items?.[0]?.summary || '--';
      const standing = team.standingSummary || '';
      document.getElementById('seahawksRecord').innerHTML = record;
      document.getElementById('seahawksDetail').innerHTML = standing;
    }
  } catch (e) { console.log('Seahawks fetch failed', e); }

  // Also try scoreboard for next game
  try {
    const resp = await fetchESPNRaw('football/nfl/teams/26/schedule');
    if (resp && resp.ok) {
      const data = await resp.json();
      const events = data.events || [];
      const now = new Date();
      const next = events.find(e => new Date(e.date) > now);
      if (next) {
        const d = new Date(next.date);
        document.getElementById('seahawksNext').innerHTML = `NEXT: ${next.shortName || next.name} &#8212; ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        document.getElementById('seahawksNext').innerHTML = '2026 SEASON: SEP';
      }
    }
  } catch (e) {
    document.getElementById('seahawksNext').innerHTML = '2026 SEASON: SEP';
  }

  // Mariners
  try {
    const resp = await fetchESPNRaw('baseball/mlb/teams/12');
    if (resp && resp.ok) {
      const data = await resp.json();
      const team = data.team;
      const record = team.record?.items?.[0]?.summary || 'Spring Training';
      const standing = team.standingSummary || 'AL West';
      document.getElementById('marinersRecord').innerHTML = record;
      document.getElementById('marinersDetail').innerHTML = standing;
    }
  } catch (e) {
    document.getElementById('marinersRecord').innerHTML = 'Spring Training';
    document.getElementById('marinersDetail').innerHTML = 'Hope springs eternal';
  }

  // Opening Weekend banner records - Seattle (12) and Cleveland (5)
  try {
    const seaResp = await fetchESPNRaw('baseball/mlb/teams/12');
    if (seaResp && seaResp.ok) {
      const d = await seaResp.json();
      const r = d.team?.record?.items?.[0]?.summary || '0-0';
      var seaEl = document.getElementById('seaRecord');
      if (seaEl) seaEl.innerHTML = '2026: ' + r;
      document.querySelectorAll('.chyronMLB').forEach(function(el){
        el.innerHTML = 'Mariners 2026: ' + r + ' &bull; 50th year of Mariners baseball';
      });
    }
  } catch(e){}
  try {
    const clevResp = await fetchESPNRaw('baseball/mlb/teams/5');
    if (clevResp && clevResp.ok) {
      const d = await clevResp.json();
      const r = d.team?.record?.items?.[0]?.summary || '0-0';
      var clevEl = document.getElementById('clevRecord');
      if (clevEl) clevEl.innerHTML = '2026: ' + r;
    }
  } catch(e){}

  try {
    const resp = await fetchESPNRaw('baseball/mlb/scoreboard');
    if (resp && resp.ok) {
      const data = await resp.json();
      const marGame = data.events?.find(e =>
        e.competitions?.[0]?.competitors?.some(c => c.team?.abbreviation === 'SEA')
      );
      if (marGame) {
        const comp = marGame.competitions[0];
        const away = comp.competitors.find(c => c.homeAway === 'away');
        const home = comp.competitors.find(c => c.homeAway === 'home');
        document.getElementById('marinersNext').innerHTML = `TODAY: ${away.team.abbreviation} @ ${home.team.abbreviation}`;
        // Extract betting odds
        const odds = comp.odds?.[0];
        if (odds) {
          const seaIsHome = home?.team?.abbreviation === 'SEA';
          const mlEl = document.getElementById('mlOdds');
          const mlDet = document.getElementById('mlDetail');
          const rlEl = document.getElementById('rlOdds');
          const rlDet = document.getElementById('rlDetail');
          // Money line
          const homeMl = odds.homeTeamOdds?.moneyLine;
          const awayMl = odds.awayTeamOdds?.moneyLine;
          if (mlEl && homeMl != null && awayMl != null) {
            const seaMl = seaIsHome ? homeMl : awayMl;
            mlEl.textContent = (seaMl > 0 ? '+' : '') + seaMl;
            if (mlDet) mlDet.textContent = 'SEA ' + (seaMl > 0 ? '+' : '') + seaMl + ' / ' + (seaIsHome ? away : home).team.abbreviation + ' ' + ((!seaIsHome ? homeMl : awayMl) > 0 ? '+' : '') + (!seaIsHome ? homeMl : awayMl);
          }
          // Spread / run line
          const spread = odds.spread;
          const overUnder = odds.overUnder;
          if (rlEl && (spread != null || overUnder != null)) {
            if (spread != null) {
              const seaSpread = seaIsHome ? parseFloat(spread) * -1 : parseFloat(spread);
              rlEl.textContent = (seaSpread > 0 ? '+' : '') + seaSpread.toFixed(1);
              if (rlDet) rlDet.textContent = 'SEA ' + (seaSpread > 0 ? '+' : '') + seaSpread.toFixed(1) + (overUnder ? ' \u2022 O/U ' + overUnder : '');
            } else if (overUnder != null) {
              rlEl.textContent = 'O/U ' + overUnder;
              if (rlDet) rlDet.textContent = 'Total runs over/under';
            }
          }
        }
      }
    }
  } catch (e) {}

  // Kraken
  try {
    const resp = await fetchESPNRaw('hockey/nhl/teams/sea');
    if (resp && resp.ok) {
      const data = await resp.json();
      const team = data.team;
      const record = team.record?.items?.[0]?.summary || '--';
      const standing = team.standingSummary || '';
      document.getElementById('krakenRecord').innerHTML = record;
      document.getElementById('krakenDetail').innerHTML = standing;
      // Update chyron with live data
      document.querySelectorAll('.chyronKraken').forEach(function(el){
        el.innerHTML = record + ' &bull; ' + (standing || 'Season in progress');
      });
    }
  } catch (e) { console.log('Kraken fetch failed', e); }

  try {
    const resp = await fetchESPNRaw('hockey/nhl/scoreboard');
    if (resp && resp.ok) {
      const data = await resp.json();
      const krkGame = data.events?.find(e =>
        e.competitions?.[0]?.competitors?.some(c => c.team?.abbreviation === 'SEA')
      );
      if (krkGame) {
        const d = new Date(krkGame.date);
        document.getElementById('krakenNext').innerHTML = `NEXT: ${krkGame.shortName} &#8212; ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      }
    }
  } catch (e) {}

  // UW Football
  try {
    const resp = await fetchESPNRaw('football/college-football/teams/264');
    if (resp && resp.ok) {
      const data = await resp.json();
      const team = data.team;
      const record = team.record?.items?.[0]?.summary || 'Off-Season';
      const standing = team.standingSummary || 'Big Ten';
      document.getElementById('uwRecord').innerHTML = record;
      document.getElementById('uwDetail').innerHTML = standing;
    }
  } catch (e) {
    document.getElementById('uwRecord').innerHTML = 'Off-Season';
    document.getElementById('uwDetail').innerHTML = 'Big Ten Conference';
  }
  document.getElementById('uwNext').innerHTML = 'SEASON STARTS: AUG 2026';
}


// &#9552;&#9552;&#9552; PRACTICAL FINANCE DATA &#9552;&#9552;&#9552;
function initPracticalFinance() {
  // These are harder to get via free APIs, so we use realistic current estimates
  // that can be replaced with API calls later
  var ty = document.getElementById('tenYear'); if (ty) ty.innerHTML = '4.25%';
  var gp = document.getElementById('gasPrice'); if (gp) gp.innerHTML = '$3.42';
  var fg = document.getElementById('fearGreed'); if (fg) fg.innerHTML = '58 &#8212; NEUTRAL';
  var vx = document.getElementById('vixValue'); if (vx) vx.innerHTML = '16.8';
  var fr = document.getElementById('fedRate'); if (fr) fr.innerHTML = '4.25 - 4.50%';
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ IRAN / GEOPOLITICAL Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ
async function fetchIranData() {
  // Fetch Iran-related news via RSS
  let iranHeadlines = [];

  try {
    var rssUrl = 'https://news.google.com/rss/search?q=Iran+war+military+strikes&hl=en-US&gl=US&ceid=US:en';
    var resp = await fetchViaProxy(rssUrl);
    if (resp && resp.ok) {
      const text = await resp.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = xml.querySelectorAll('item');
      items.forEach((item, i) => {
        if (i >= 6) return;
        const title = item.querySelector('title')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const source = item.querySelector('source')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        if (title) {
          iranHeadlines.push({ title, timeAgo: pubDate ? timeAgoGlobal(pubDate) : '', source, link });
        }
      });
    }
  } catch (e) {
    console.log('Iran news fetch failed', e);
  }

  // Also try Reuters/AP feeds for Iran
  try {
    var rssUrl2 = 'https://news.google.com/rss/search?q=Iran+conflict+Middle+East+military&hl=en-US&gl=US&ceid=US:en';
    var resp2 = await fetchViaProxy(rssUrl2);
    if (resp2.ok) {
      const text = await resp2.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = xml.querySelectorAll('item');
      items.forEach((item, i) => {
        if (i >= 3) return;
        const title = item.querySelector('title')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const source = item.querySelector('source')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        if (title && !iranHeadlines.find(h => h.title === title)) {
          iranHeadlines.push({ title, timeAgo: pubDate ? timeAgoGlobal(pubDate) : '', source, link });
        }
      });
    }
  } catch (e) {}

  // Render headlines (elements removed — null-guarded)
  const newsEl = document.getElementById('iranNewsItems');
  if (newsEl) {
    if (iranHeadlines.length > 0) {
      newsEl.innerHTML = iranHeadlines.slice(0, 5).map(h =>
        h.link ? `<a href="${h.link}" target="_blank" rel="noopener" style="display:block;padding: 4px 0; border-bottom: 1px solid var(--border); text-decoration:none; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'">
          <span style="color: var(--accent);">${h.title}</span>
          <span style="color: var(--text-muted); font-size: 10px; margin-left: 6px;">${h.source ? '&#8212; ' + h.source : ''} ${h.timeAgo}</span>
        </a>` : `<div style="padding: 4px 0; border-bottom: 1px solid var(--border);">
          <span style="color: var(--text);">${h.title}</span>
          <span style="color: var(--text-muted); font-size: 10px; margin-left: 6px;">${h.source ? '&#8212; ' + h.source : ''} ${h.timeAgo}</span>
        </div>`
      ).join('');
    } else {
      newsEl.innerHTML = '<div style="color: var(--text-muted); font-style: italic;">Unable to fetch live headlines. Refresh to retry.</div>';
    }
  }

  // Situation summary
  const statusEl = document.getElementById('iranStatus');
  if (statusEl && iranHeadlines.length > 0) {
    statusEl.innerHTML = `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
      <span style="display: inline-block; width: 10px; height: 10px; background: var(--red); border-radius: 50%; animation: livePulse 1.5s ease-in-out infinite;"></span>
      <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--red); font-weight: 600; letter-spacing: 1px;">ACTIVE SITUATION</span>
    </div>
    <div style="font-size: 13px; color: var(--text); line-height: 1.6;">Live headlines updating from AP, Reuters, and major outlets.</div>`;
  }

  // Conflict-sensitive commodity data (null-guarded)
  var oilEl = document.getElementById('oilPrice'); if (oilEl) oilEl.innerHTML = '$94 &#9650;';
  var iwBrent = document.getElementById('iwBrentPrice'); if (iwBrent) iwBrent.innerHTML = '$103 &#9650;';
  var defEl = document.getElementById('defenseETF'); if (defEl) defEl.innerHTML = '$142.80 &#9650; 2.3%';
  var iwGold = document.getElementById('iwGoldPrice'); if (iwGold) iwGold.innerHTML = '$3,340 &#9650;';
  var eurEl = document.getElementById('usdEur'); if (eurEl) eurEl.innerHTML = '0.880';
}

// &#9552;&#9552;&#9552; REFRESH TIMESTAMP &#9552;&#9552;&#9552;
function updateRefreshTime() {
  const now = new Date();
  document.getElementById('lastRefresh').innerHTML = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' PT';
}



// &#9552;&#9552;&#9552; INIT &#9552;&#9552;&#9552;


// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ MARINERS ODDS FALLBACK Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ
async function fetchMarinersOdds() {
  // If odds weren't populated by scoreboard, try the-odds-api (free tier)
  var mlEl = document.getElementById('mlOdds');
  if (mlEl && mlEl.textContent !== '--') return; // already populated
  try {
    // Try ESPN odds endpoint
    var resp = await fetchESPNRaw('baseball/mlb/scoreboard?dates=' + new Date().toISOString().slice(0,10).replace(/-/g,''));
    if (resp && resp.ok) {
      var data = await resp.json();
      var game = data.events?.find(function(e) {
        return e.competitions?.[0]?.competitors?.some(function(c) { return c.team?.abbreviation === 'SEA'; });
      });
      if (game) {
        var comp = game.competitions[0];
        var odds = comp.odds?.[0];
        var home = comp.competitors.find(function(c) { return c.homeAway === 'home'; });
        var away = comp.competitors.find(function(c) { return c.homeAway === 'away'; });
        var seaIsHome = home?.team?.abbreviation === 'SEA';
        if (odds) {
          var homeMl = odds.homeTeamOdds?.moneyLine;
          var awayMl = odds.awayTeamOdds?.moneyLine;
          if (homeMl != null && awayMl != null) {
            var seaMl = seaIsHome ? homeMl : awayMl;
            var oppMl = seaIsHome ? awayMl : homeMl;
            var oppAbbr = (seaIsHome ? away : home).team.abbreviation;
            mlEl.textContent = (seaMl > 0 ? '+' : '') + seaMl;
            var mlDetEl = document.getElementById('mlDetail');
            if (mlDetEl) mlDetEl.textContent = 'SEA ' + (seaMl > 0 ? '+' : '') + seaMl + ' / ' + oppAbbr + ' ' + (oppMl > 0 ? '+' : '') + oppMl;
          }
          var spread = odds.spread;
          var ou = odds.overUnder;
          var rlEl = document.getElementById('rlOdds');
          var rlDetEl = document.getElementById('rlDetail');
          if (rlEl) {
            if (ou != null) { rlEl.textContent = 'O/U ' + ou; if (rlDetEl) rlDetEl.textContent = 'Total runs'; }
            if (spread != null) {
              var seaSp = seaIsHome ? parseFloat(spread) * -1 : parseFloat(spread);
              rlEl.textContent = (seaSp > 0 ? '+' : '') + seaSp.toFixed(1);
              if (rlDetEl) rlDetEl.textContent = 'SEA ' + (seaSp > 0 ? '+' : '') + seaSp.toFixed(1) + (ou ? ' \u2022 O/U ' + ou : '');
            }
          }
        } else {
          mlEl.textContent = 'TBD';
          var mlDetEl2 = document.getElementById('mlDetail');
          if (mlDetEl2) mlDetEl2.textContent = 'Lines not yet posted';
          var rlOddsEl = document.getElementById('rlOdds');
          if (rlOddsEl) rlOddsEl.textContent = 'TBD';
          var rlDetEl2 = document.getElementById('rlDetail');
          if (rlDetEl2) rlDetEl2.textContent = 'Check closer to game time';
        }
      }
    }
  } catch(e) { console.log('Odds fallback failed', e); }
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ WORLD MONITOR CARD UPDATERS Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ
async function fetchWorldCards() {
  var topics = [
    { query: 'artificial+intelligence+AI+technology', headlineEl: 'aiHeadline', detailEl: 'aiDetail', fallbackHeadline: 'FRONTIER MODELS', keywords: ['AI','GPT','Claude','Gemini','robot','chip','neural','LLM','OpenAI','Anthropic','Google','Apple','Microsoft','Meta'] },
    { query: 'medical+breakthrough+health+science', headlineEl: 'medHeadline', detailEl: 'medDetail', fallbackHeadline: 'BREAKTHROUGHS', keywords: ['drug','FDA','cancer','vaccine','CRISPR','gene','trial','therapy','diagnosis','treatment','hospital','disease'] },
    { query: 'global+conflict+war+geopolitics', headlineEl: 'conflictStatus', detailEl: 'conflictDetail', fallbackHeadline: 'ELEVATED', keywords: ['war','military','strike','conflict','troops','NATO','sanctions','nuclear','missile','attack','ceasefire','peace'] },
    { query: 'NASA+SpaceX+space+exploration', headlineEl: 'spaceHeadline', detailEl: 'spaceDetail', fallbackHeadline: 'STARSHIP ERA', keywords: ['SpaceX','NASA','rocket','orbit','moon','Mars','satellite','launch','astronaut','Artemis','Starship','ISS'] },
    { query: 'climate+change+environment+wildfire', headlineEl: null, detailEl: 'climateDetail', fallbackHeadline: null, keywords: ['climate','wildfire','flood','heat','storm','carbon','emission','drought','ice','temperature','weather','fire'] }
  ];
  for (var t = 0; t < topics.length; t++) {
    try {
      var rssUrl = 'https://news.google.com/rss/search?q=' + topics[t].query + '&hl=en-US&gl=US&ceid=US:en&_=' + Date.now();
      var resp = await fetchViaProxy(rssUrl);
      if (!resp || !resp.ok) continue;
      var text = await resp.text();
      var parser = new DOMParser();
      var xml = parser.parseFromString(text, 'text/xml');
      var items = xml.querySelectorAll('item');
      var headlines = [];
      for (var i = 0; i < items.length && headlines.length < 3; i++) {
        var title = items[i].querySelector('title')?.textContent || '';
        if (title && title.length > 15 && title.length < 200) {
          headlines.push(title);
        }
      }
      if (headlines.length > 0) {
        // Set headline to first 2-3 key words from top story
        if (topics[t].headlineEl) {
          var hEl = document.getElementById(topics[t].headlineEl);
          if (hEl) {
            var words = headlines[0].split(/[\s\-:,]+/);
            var keyWords = [];
            for (var w = 0; w < words.length && keyWords.length < 3; w++) {
              if (words[w].length > 2) keyWords.push(words[w].toUpperCase());
            }
            hEl.textContent = keyWords.join(' ');
          }
        }
        // Set detail to condensed headlines
        var dEl = document.getElementById(topics[t].detailEl);
        if (dEl) {
          var summaries = headlines.map(function(h) {
            return h.length > 80 ? h.substring(0, 77) + '...' : h;
          });
          dEl.textContent = summaries.join(' \u2022 ');
        }
      }
    } catch (e) {
      console.log('World card fetch failed for ' + topics[t].query, e);
    }
  }
}

(async function init() {
  initPracticalFinance();
  updateRefreshTime();
  await Promise.all([
    fetchStockData(),
    fetchSportsData(),
    fetchIranData(),
    fetchWorldCards(),
  ]);
  await fetchMarinersOdds();
  updateRefreshTime();

  // Auto-refresh every 5 minutes
  setInterval(async () => {
    await Promise.all([
      fetchStockData(),
      fetchSportsData(),
      fetchIranData(),
      fetchWorldCards(),
    ]);
    await fetchMarinersOdds();
    updateRefreshTime();
  }, 5 * 60 * 1000);
})();


// ===== GAME DAY COUNTDOWN =====
(function initGamedayCountdown() {
  var gameTime = new Date(2026, 2, 28, 18, 40, 0); // Mar 28 2026 6:40 PM
  function update() {
    var now = new Date();
    var diff = gameTime - now;
    var el = document.getElementById('gamedayCountdown');
    if (!el) return;
    if (diff <= 0) { el.innerHTML = 'GAME ON &#9918;'; return; }
    var d = Math.floor(diff / 86400000);
    var hrs = Math.floor((diff % 86400000) / 3600000);
    var min = Math.floor((diff % 3600000) / 60000);
    var sec = Math.floor((diff % 60000) / 1000);
    el.innerHTML = d + 'd ' + hrs.toString().padStart(2,'0') + 'h ' + min.toString().padStart(2,'0') + 'm ' + sec.toString().padStart(2,'0') + 's';
  }
  update();
  setInterval(update, 1000);
})();

// ===== COUNTDOWN STRIP =====
(function initCountdowns() {
  var targets = {
    draftCountdown: new Date(2026, 3, 23),   // NFL Draft Apr 23
    midtermCountdown: new Date(2026, 10, 3),  // Midterms Nov 3
    fomcCountdown: new Date(2026, 4, 6),      // Next FOMC May 6
    spacexCountdown: new Date(2026, 3, 15)    // Approx next Starship
  };
  function update() {
    var now = new Date();
    for (var id in targets) {
      var el = document.getElementById(id);
      if (!el) continue;
      var diff = Math.ceil((targets[id] - now) / 86400000);
      el.innerHTML = diff > 0 ? diff : 'NOW';
    }
  }
  update();
  setInterval(update, 3600000);
})();

// ===== DEFENSE SPENDING TICKER =====
(function initDefenseSpend() {
  var annualBudget = 886000000000;
  var perSecond = annualBudget / (365.25 * 24 * 3600);
  var startOfYear = new Date(2026, 0, 1);
  function update() {
    var now = new Date();
    var elapsed = (now - startOfYear) / 1000;
    var spent = elapsed * perSecond;
    var el = document.getElementById('defenseSpend');
    if (el) el.innerHTML = '$' + (spent / 1e9).toFixed(3) + 'B';
  }
  update();
  setInterval(update, 100);
})();


// ===== EPSTEIN DAY COUNTER =====
(function(){
  // Epstein died August 10, 2019
  var deathDate = new Date(2019, 7, 10);
  var now = new Date();
  var days = Math.floor((now - deathDate) / 86400000);
  var el = document.getElementById('epsteinDays');
  if(el) el.innerHTML = days.toLocaleString();
})();



// ===== DAILY QUOTE ROTATOR =====
(function initDailyQuote() {
  var quotes = [
    {q:"The only way to do great work is to love what you do.",s:"Steve Jobs"},
    {q:"We are what we repeatedly do. Excellence, then, is not an act, but a habit.",s:"Aristotle"},
    {q:"The unexamined life is not worth living.",s:"Socrates"},
    {q:"In the middle of difficulty lies opportunity.",s:"Albert Einstein"},
    {q:"The best time to plant a tree was 20 years ago. The second best time is now.",s:"Chinese Proverb"},
    {q:"Be the change you wish to see in the world.",s:"Gandhi"},
    {q:"It is not the strongest that survive, nor the most intelligent, but the most responsive to change.",s:"Darwin"},
    {q:"What we achieve inwardly will change outer reality.",s:"Plutarch"},
    {q:"The impediment to action advances action. What stands in the way becomes the way.",s:"Marcus Aurelius"},
    {q:"You have power over your mind, not outside events. Realize this, and you will find strength.",s:"Marcus Aurelius"},
    {q:"Man is condemned to be free.",s:"Jean-Paul Sartre"},
    {q:"He who has a why to live can bear almost any how.",s:"Nietzsche"},
    {q:"The world breaks everyone, and afterward, some are strong at the broken places.",s:"Hemingway"},
    {q:"Do I contradict myself? Very well then I contradict myself. I am large, I contain multitudes.",s:"Whitman"},
    {q:"We suffer more often in imagination than in reality.",s:"Seneca"}
  ];
  var dayOfYear = Math.floor((new Date() - new Date(2026,0,1)) / 86400000);
  var q = quotes[dayOfYear % quotes.length];
  var el = document.getElementById('quoteText');
  var src = document.getElementById('quoteSource');
  if (el) el.innerHTML = q.q;
  if (src) src.innerHTML = '\u2014 ' + q.s;
})();

// ===== THIS DAY IN HISTORY =====
(function initHistory() {
  var events = {
    '3-26': {e:'1979: Anwar Sadat and Menachem Begin sign the Egypt-Israel Peace Treaty at the White House.',s:'Camp David Accords'},
    '3-27': {e:'1964: The Great Alaska Earthquake (9.2 magnitude) strikes, the most powerful in North American history.',s:'Good Friday Earthquake'},
    '3-28': {e:'1979: Three Mile Island nuclear accident begins in Pennsylvania. Also: David Pedersen is born (1986).',s:'A day of meltdowns'},
    '3-29': {e:'1973: Last US combat troops leave Vietnam, ending direct American military involvement.',s:'End of an era'},
    '3-30': {e:'1867: US purchases Alaska from Russia for $7.2 million. Roughly 2 cents per acre.',s:'Seward\'s Folly'},
    '3-31': {e:'1889: The Eiffel Tower is officially opened to the public in Paris.',s:'324 meters of audacity'}
  };
  var now = new Date();
  var key = (now.getMonth()+1) + '-' + now.getDate();
  var ev = events[key] || {e:'History is happening right now. You just might not recognize it yet.',s:'Every day'};
  var el = document.getElementById('historyText');
  var src = document.getElementById('historySource');
  if (el) el.innerHTML = ev.e;
  if (src) src.innerHTML = ev.s;
})();

// ===== PHILOSOPHICAL QUESTION ROTATOR =====
(function initPhilQuestion() {
  var qs = [
    "If you could live your life over knowing everything you know now, would you change anything?",
    "Is it possible to know something and still not believe it?",
    "Does free will exist, or is every decision the inevitable result of prior causes?",
    "If you had to choose between being respected and being liked, which would you pick?",
    "What would you attempt if you knew you could not fail?",
    "Is suffering necessary for growth?",
    "Would you want to know the exact date of your death?",
    "Are we morally obligated to help strangers?",
    "Is there a meaningful difference between killing and letting die?",
    "Can something be true and unknowable at the same time?"
  ];
  var dayOfYear = Math.floor((new Date() - new Date(2026,0,1)) / 86400000);
  var el = document.getElementById('philQuestion');
  if (el) el.innerHTML = qs[dayOfYear % qs.length];
})();

// ===== DAYLIGHT CALCULATOR =====
(function initDaylight() {
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 1);
  var dayOfYear = Math.floor((now - start) / 86400000);
  var lat = 47.6062 * Math.PI / 180;
  var decl = 23.45 * Math.sin(2 * Math.PI * (284 + dayOfYear) / 365) * Math.PI / 180;
  var ha = Math.acos(-Math.tan(lat) * Math.tan(decl));
  var daylight = 2 * ha * 24 / (2 * Math.PI);
  var hrs = Math.floor(daylight);
  var mins = Math.round((daylight - hrs) * 60);
  var el = document.getElementById('daylightHours');
  if (el) el.innerHTML = hrs + 'h ' + mins.toString().padStart(2,'0') + 'm';
})();

// ===== FEAR & GREED SIMULATION =====
(function initFearGreed() {
  // Simulate based on day - will be replaced with real API when available
  var dayOfYear = Math.floor((new Date() - new Date(2026,0,1)) / 86400000);
  var val = 35 + Math.floor(Math.sin(dayOfYear * 0.1) * 25 + Math.cos(dayOfYear * 0.07) * 15);
  val = Math.max(0, Math.min(100, val));
  var label = val < 25 ? 'EXTREME FEAR' : val < 40 ? 'FEAR' : val < 60 ? 'NEUTRAL' : val < 75 ? 'GREED' : 'EXTREME GREED';
  var cls = val < 25 ? 'fg-extreme-fear' : val < 40 ? 'fg-fear' : val < 60 ? 'fg-neutral' : val < 75 ? 'fg-greed' : 'fg-extreme-greed';
  var needle = document.getElementById('fgNeedle');
  var fgVal = document.getElementById('fgValue');
  var fgLbl = document.getElementById('fgLabel');
  if (needle) needle.style.transform = 'rotate(' + (val * 1.8 - 90) + 'deg)';
  if (fgVal) { fgVal.innerHTML = val; fgVal.className = 'fg-value ' + cls; }
  if (fgLbl) { fgLbl.innerHTML = label; fgLbl.className = 'fg-label-text ' + cls; }
})();

// ===== MARKET TICKERS =====
(async function initMarketTickers() {
  function setTicker(priceId, changeId, cardId, price, changePct, prefix, suffix) {
    var priceEl = document.getElementById(priceId);
    var changeEl = document.getElementById(changeId);
    var cardEl = document.getElementById(cardId);
    if (!priceEl) return;
    priceEl.innerHTML = (prefix||'') + price + (suffix||'');
    var dir = changePct > 0.05 ? 'up' : changePct < -0.05 ? 'down' : 'flat';
    var arrow = changePct > 0 ? '&#9650; +' : changePct < 0 ? '&#9660; ' : '';
    changeEl.innerHTML = arrow + changePct.toFixed(2) + '%';
    changeEl.className = 'ticker-change ' + dir;
    if (cardEl) { cardEl.className = 'ticker-card ' + dir; }
  }
  // Fetch from Yahoo Finance v8 via CORS proxy
  var symbols = ['^GSPC','^IXIC','^VIX','BTC-USD','GC=F','^TNX','FNKO'];
  var names = ['spPrice','ndxPrice','vixPrice','btcPrice','goldPrice','tnxPrice','fnkoPrice'];
  var changes = ['spChange','ndxChange','vixChange','btcChange','goldChange','tnxChange','fnkoChange'];
  var cards = ['tickerSP','tickerNDX','tickerVIX','tickerBTC','tickerGold','tickerTNX','tickerFNKO'];
  var prefixes = ['','','','$','$','','$'];
  var suffixes = ['','','','','','%',''];
  try {
    // Fetch each symbol via v8 chart API (v7 is deprecated)
    var populated = 0;
    var fetches = symbols.map(function(sym, idx) {
      return fetchViaProxy('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=2d')
        .then(function(resp) { return resp ? resp.json() : null; })
        .then(function(data) {
          if (!data || !data.chart || !data.chart.result) return;
          var meta = data.chart.result[0].meta;
          var price = meta.regularMarketPrice;
          var prev = meta.chartPreviousClose || meta.previousClose || price;
          var pct = prev ? ((price - prev) / prev) * 100 : 0;
          var display = price > 10000 ? Math.round(price).toLocaleString() : price > 100 ? price.toFixed(1) : price.toFixed(2);
          setTicker(names[idx], changes[idx], cards[idx], display, pct, prefixes[idx], suffixes[idx]);
          populated++;
        }).catch(function() {});
    });
    await Promise.all(fetches);
    if (populated === 0) throw new Error('No data');
  } catch(e) {
    // Fallback: try Alpha Vantage-free or just simulate from day seed
    console.log('Market ticker fetch failed, using simulated data:', e);
    var day = Math.floor((new Date() - new Date(2026,0,1))/86400000);
    var seed = function(n){return Math.sin(day*0.1+n)*0.5+Math.cos(day*0.07+n*2)*0.3};
    var sims = [
      {p:5650+Math.round(seed(1)*200), pct:seed(1)*2.5},
      {p:18200+Math.round(seed(2)*600), pct:seed(2)*3.0},
      {p:(16+seed(3)*8).toFixed(1), pct:seed(3)*12},
      {p:Math.round(87500+seed(4)*5000), pct:seed(4)*4},
      {p:Math.round(3050+seed(5)*100), pct:seed(5)*1.5},
      {p:(4.15+seed(6)*0.3).toFixed(2), pct:seed(6)*3},
      {p:(3.55+seed(7)*0.25).toFixed(2), pct:-(Math.abs(seed(7))*6+1)}
    ];
    sims.forEach(function(s,i){
      var display = typeof s.p === 'string' ? s.p : s.p > 10000 ? s.p.toLocaleString() : s.p.toString();
      setTicker(names[i], changes[i], cards[i], display, s.pct, prefixes[i], suffixes[i]);
    });
  }
  // FNKO quip rotator
  var fnkoQuips = [
    "Trevor's employer. Pray for him.",
    "Pop! goes the stock price.",
    "At least the bobbleheads are happy.",
    "Collectible losses since 2022.",
    "Your 401k is also a collectible now.",
    "Vinyl figures worth more than shares.",
    "The rarest Funko: a green candle.",
    "Bag holder's anonymous, table for Trevor.",
    "The Pop! that keeps on dropping."
  ];
  var fnkoLabel = document.getElementById('fnkoLabel');
  if(fnkoLabel){
    var fnkoIdx = 0;
    setInterval(function(){
      fnkoIdx = (fnkoIdx + 1) % fnkoQuips.length;
      fnkoLabel.innerHTML = fnkoQuips[fnkoIdx];
    }, 8000);
  }
})();

// ===== ENERGY MONITOR =====
(async function initEnergy() {
  function setEnergy(priceId, changeId, price, changePct) {
    var priceEl = document.getElementById(priceId);
    var changeEl = document.getElementById(changeId);
    if (!priceEl) return;
    priceEl.innerHTML = '$' + price;
    // For energy: price UP = red (bad for consumers), DOWN = green
    var dir = changePct > 0.05 ? 'up' : changePct < -0.05 ? 'down' : 'flat';
    var arrow = changePct > 0 ? '&#9650; +' : changePct < 0 ? '&#9660; ' : '';
    if (changeEl) {
      changeEl.innerHTML = arrow + changePct.toFixed(2) + '%';
      changeEl.className = 'energy-change ' + dir;
    }
  }
  try {
    // Fetch energy via v8 chart API (v7 deprecated)
    var energySyms = [{sym:'CL=F',pId:'wtiPrice',cId:'wtiChange'},{sym:'BZ=F',pId:'brentPrice',cId:'brentChange'},{sym:'NG=F',pId:'natgasPrice',cId:'natgasChange'}];
    var ePop = 0;
    var eFetches = energySyms.map(function(e) {
      return fetchViaProxy('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(e.sym) + '?interval=1d&range=2d')
        .then(function(resp) { return resp ? resp.json() : null; })
        .then(function(data) {
          if (!data || !data.chart || !data.chart.result) return;
          var meta = data.chart.result[0].meta;
          var price = meta.regularMarketPrice;
          var prev = meta.chartPreviousClose || meta.previousClose || price;
          var pct = prev ? ((price - prev) / prev) * 100 : 0;
          setEnergy(e.pId, e.cId, price.toFixed(2), pct);
          ePop++;
        }).catch(function() {});
    });
    await Promise.all(eFetches);
    if (ePop === 0) throw new Error('No energy data');
  } catch(e) {
    console.log('Energy fetch failed, using simulated data:', e);
    var day = Math.floor((new Date() - new Date(2026,0,1))/86400000);
    var s = function(n){return Math.sin(day*0.04+n)*0.5+Math.cos(day*0.09+n)*0.3};
    setEnergy('wtiPrice','wtiChange', (71.50+s(1)*4).toFixed(2), s(1)*3);
    setEnergy('brentPrice','brentChange', (75.20+s(2)*4).toFixed(2), s(2)*2.8);
    setEnergy('natgasPrice','natgasChange', (3.85+s(3)*0.5).toFixed(2), s(3)*5);
  }
  // Link gas price from gas tracker
  setTimeout(function() {
    var gpEl = document.getElementById('gasPrice');
    var egEl = document.getElementById('energyGasPrice');
    var ecEl = document.getElementById('energyGasChange');
    if (gpEl && egEl && gpEl.textContent !== '--') {
      egEl.innerHTML = gpEl.textContent;
      if (ecEl) { ecEl.innerHTML = '&#9650; +72% vs 2020'; ecEl.className = 'energy-change up'; }
    }
  }, 5000);
})();

// ===== WHAT IF YOU BOUGHT =====
(function initWhatIf() {
  // NVDA was ~$8 adjusted on Mar 28 2016, now ~$130ish in 2026
  var buyPrice = 8.0;
  var currentPrice = 135;
  var invested = 1000;
  var shares = invested / buyPrice;
  var currentVal = Math.round(shares * currentPrice);
  var el = document.getElementById('whatIfValue');
  if (el) el.innerHTML = '$' + currentVal.toLocaleString();
})();

// ===== AQI FETCH =====
(function initAQI(){
  var aqiUrl='https://air-quality-api.open-meteo.com/v1/air-quality?latitude=47.6062&longitude=-122.3321&current=us_aqi&timezone=America/Los_Angeles';
  function setAQI(aqi){
    var el=document.getElementById('aqiValue');
    if(!el)return;
    var label=aqi<=50?'Good':aqi<=100?'Moderate':aqi<=150?'Unhealthy (Sensitive)':'Unhealthy';
    el.innerHTML='AQI: '+aqi+' ('+label+')';
  }
  function tryFetch(){
    fetch(aqiUrl)
      .then(function(r){return r.json()})
      .then(function(d){
        if(d&&d.current&&d.current.us_aqi!=null){setAQI(d.current.us_aqi);}
        else{throw new Error('no data');}
      })
      .catch(function(){
        fetchViaProxy(aqiUrl)
          .then(function(r){return r?r.json():null})
          .then(function(d){
            if(d&&d.current&&d.current.us_aqi!=null){setAQI(d.current.us_aqi);}
            else{var el=document.getElementById('aqiValue');if(el)el.innerHTML='AQI: 30 (Good)';}
          })
          .catch(function(){var el=document.getElementById('aqiValue');if(el)el.innerHTML='AQI: 30 (Good)';});
      });
  }
  tryFetch();
  setInterval(tryFetch,1800000);
})();


// ===== IRAN WAR LIVE COUNTER =====
(function initIranCounter() {
  // Bombing began Feb 28, 2026 = Day 1 (US + Israel strikes; Khamenei killed).
  // WPR 60-day clock also triggered Feb 28. Formula: floor(diff_days) + 1 = current war day.
  var warStart = new Date(2026, 1, 28); // Feb 28, 2026
  function update() {
    var now = new Date();
    var dayNum = Math.floor((now - warStart) / 86400000) + 1;
    var el1 = document.getElementById('iranWarDay');
    var el2 = document.getElementById('iranDuration');
    var el3 = document.getElementById('iranDayCount');
    if (el1) el1.innerHTML = dayNum;
    if (el2) el2.innerHTML = 'DAY ' + dayNum;
    if (el3) el3.innerHTML = dayNum;
    document.querySelectorAll('.iran-day-count').forEach(function(el){ el.innerHTML = dayNum; });
    // Update banner title
    var bannerTitle = document.querySelector('#iranWarBanner .iw-title');
    if (bannerTitle) bannerTitle.innerHTML = 'DAY ' + dayNum + ' &middot; US&ndash;IRAN WAR';
  }
  update();
  setInterval(update, 60000);
})();

// ===== TRUMP GREATEST HITS ROTATOR =====
(function initTrumpQuotes() {
  var quotes = [
    { text: "It's not possible for us to take care of daycare.", meta: "Easter Lunch speech, April 1 2026 (slurring)" },
    { text: "I think I'm entitled to personal attacks.", meta: "Presidential debate, 2024" },
    { text: "We're going to have so much winning, you're going to get sick and tired of winning.", meta: "Campaign rally" },
    { text: "I know words. I have the best words.", meta: "Campaign speech, 2015" },
    { text: "Trade wars are good, and easy to win.", meta: "March 2018, pre-Liberation Day" },
    { text: "Tariffs are the greatest thing ever invented.", meta: "White House remarks" },
    { text: "I alone can fix it.", meta: "RNC acceptance speech, 2016" },
    { text: "I'm a very stable genius.", meta: "Twitter, 2018" },
    { text: "Nobody knows more about taxes than I do, maybe in the history of the world.", meta: "Interview, 2016" },
    { text: "I could stand in the middle of Fifth Avenue and shoot somebody, and I wouldn't lose any voters.", meta: "Campaign rally, 2016" },
    { text: "The concept of global warming was created by and for the Chinese.", meta: "Twitter, 2012" },
    { text: "I will build a great, great wall on our southern border, and I will have Mexico pay for that wall.", meta: "Campaign announcement, 2015" },
    { text: "We're putting a 10% tariff on the whole world. Happy Liberation Day!", meta: "April 2, 2025" },
    { text: "I think I am, actually humble. I think I'm much more humble than you would understand.", meta: "60 Minutes interview" },
    { text: "Nobody has better respect for intelligence than Donald Trump.", meta: "Campaign event, 2015" }
  ];
  var idx = 0;
  function show() {
    var q = quotes[idx];
    var el = document.getElementById('trumpQuote');
    var meta = document.getElementById('trumpQuoteMeta');
    if (el) el.innerHTML = '&ldquo;' + q.text + '&rdquo;';
    if (meta) meta.innerHTML = '&mdash; Donald J. Trump &bull; ' + q.meta;
    idx = (idx + 1) % quotes.length;
  }
  // Shuffle start based on time
  idx = Math.floor(Date.now() / 1000) % quotes.length;
  show();
  setInterval(show, 12000); // rotate every 12 seconds
})();

// ===== TRUTH SOCIAL LIVE FEED =====
(function initTruthFeed() {
  var TRUTH_URL = 'https://ix.cnn.io/data/truth-social/truth_archive.json';
  var FALLBACK_URL = 'https://raw.githubusercontent.com/stiles/trump-truth-social-archive/main/data/truth_archive.json';
  var listEl = document.getElementById('truthFeedList');
  var statusEl = document.getElementById('truthFeedStatus');
  var lastPostId = null;

  function timeAgo(dateStr) {
    var d = new Date(dateStr);
    var now = new Date();
    var diff = Math.floor((now - d) / 1000);
    if (diff < 60) return diff + 's ago';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
    return d.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'});
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric', year:'numeric'}) +
      ' at ' + d.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
  }

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    // Convert links to visible text
    var links = tmp.querySelectorAll('a');
    links.forEach(function(a) {
      var span = document.createElement('span');
      span.style.color = 'var(--accent)';
      span.textContent = a.textContent;
      a.parentNode.replaceChild(span, a);
    });
    // Remove invisible spans and clean up
    var text = tmp.innerHTML;
    // Remove class attributes and simplify
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>\s*<p[^>]*>/gi, '\n\n');
    return text.replace(/<[^>]+>/g, '').trim();
  }

  function renderPosts(posts) {
    if (!listEl) return;
    // Sort by date descending and take latest 15
    posts.sort(function(a,b) { return new Date(b.created_at) - new Date(a.created_at); });
    var latest = posts.slice(0, 15);
    if (latest.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:28px 20px;color:var(--ts-muted);font-size:13px;">No posts found.</div>';
      return;
    }
    // Check for new posts
    if (lastPostId && latest[0].id !== lastPostId) {
      // Flash notification
      var panel = document.getElementById('truthFeedPanel');
      if (panel) { panel.style.borderColor = 'var(--ts-red)'; setTimeout(function(){ panel.style.borderColor = ''; }, 3000); }
    }
    lastPostId = latest[0].id;
    var html = '';
    latest.forEach(function(post) {
      var content = stripHtml(post.content || '');
      if (!content) return; // skip empty
      var truncated = content.length > 500 ? content.substring(0, 500) + '...' : content;
      var reblogs = (post.reblogs_count !== undefined ? (post.reblogs_count || 0) : '').toLocaleString();
      var faves = (post.favourites_count !== undefined ? (post.favourites_count || 0) : '').toLocaleString();
      var replies = (post.replies_count !== undefined ? (post.replies_count || 0) : '').toLocaleString();
      html += '<div class="truth-item">';
      html += '<div class="truth-avatar" aria-hidden="true">DJT</div>';
      html += '<div class="truth-body">';
      html += '<div class="truth-item-head">';
      html += '<span class="truth-item-name">Donald J. Trump</span>';
      html += '<span class="truth-item-handle">@realDonaldTrump</span>';
      html += '<span class="truth-item-dot">&middot;</span>';
      html += '<span class="truth-item-time" title="' + formatDate(post.created_at) + '">' + timeAgo(post.created_at) + '</span>';
      html += '</div>';
      html += '<div class="truth-item-text">' + truncated.replace(/\n/g, '<br>') + '</div>';
      html += '<div class="truth-item-engagement">';
      html += '<span class="eng eng-reply"><span class="eng-icon">&#128172;</span>' + replies + '</span>';
      html += '<span class="eng eng-retruth"><span class="eng-icon">&#8634;</span>' + reblogs + '</span>';
      html += '<span class="eng eng-like"><span class="eng-icon">&hearts;</span>' + faves + '</span>';
      if (post.url) {
        html += '<a class="eng eng-view" href="' + post.url + '" target="_blank" rel="noopener" title="Open source"><span class="eng-icon">&#8599;</span></a>';
      }
      html += '</div>';
      html += '</div>'; // /truth-body
      html += '</div>'; // /truth-item
    });
    listEl.innerHTML = html;
    if (statusEl) statusEl.textContent = 'LIVE \u2022 ' + latest.length + ' POSTS \u2022 ' + new Date().toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
  }

  function fetchTruths(url, fallback) {
    fetch(url).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function(data) {
      var posts = Array.isArray(data) ? data : [];
      renderPosts(posts);
    }).catch(function(e) {
      console.warn('Truth feed primary failed:', e);
      if (fallback) {
        fetchTruths(fallback, null);
      } else {
        if (listEl) listEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--red);font-size:11px;">Could not load Truth Social feed. CORS or network issue.</div>';
        if (statusEl) statusEl.textContent = 'OFFLINE';
      }
    });
  }

  // Initial load
  fetchTruths(TRUTH_URL, FALLBACK_URL);
  // Refresh every 5 minutes
  setInterval(function() { fetchTruths(TRUTH_URL, FALLBACK_URL); }, 300000);
})();

// ===== LIBERATION DAY SCOREBOARD =====
(function initLiberation() {
  var libDate = new Date(2025, 3, 2); // April 2, 2025
  var now = new Date();
  var elapsed = Math.floor((now - libDate) / 86400000);
  var el = document.getElementById('liberationDays');
  if (el) el.innerHTML = elapsed.toLocaleString();
  // Populate scoreboard with context
  var spEl = document.getElementById('libSP');
  var cpiEl = document.getElementById('libCPI');
  var tradeEl = document.getElementById('libTrade');
  var gasEl = document.getElementById('libGas');
  // S&P was ~5670 on April 2 2025, use current ticker if available
  setTimeout(function() {
    var spNow = document.getElementById('spPrice');
    if (spEl && spNow && spNow.textContent !== '--') {
      var current = parseFloat(spNow.textContent.replace(/,/g,''));
      var pct = ((current - 5670) / 5670 * 100).toFixed(1);
      spEl.innerHTML = (pct >= 0 ? '+' : '') + pct + '%';
      spEl.style.color = pct >= 0 ? 'var(--green)' : 'var(--red)';
    } else if (spEl) { spEl.innerHTML = 'TBD'; }
    // Gas: link to gas price tracker
    var gpNow = document.getElementById('gasPrice');
    if (gasEl && gpNow && gpNow.textContent !== '--') {
      gasEl.innerHTML = gpNow.textContent;
    } else if (gasEl) { gasEl.innerHTML = '~$5.75'; }
    // CPI: consumer prices up since tariffs
    if (cpiEl) cpiEl.innerHTML = '+3.8%';
    // Trade deficit
    if (tradeEl) tradeEl.innerHTML = 'WIDER';
  }, 5000);
})();

// ===== GAS PRICES (Seattle Area) =====
(function initGasPrices() {
  function setGas(regular, mid, premium, diesel) {
    var el = document.getElementById('gasPrice');
    var sub = document.getElementById('gasSub');
    var c1 = document.getElementById('chyronGas1');
    var c2 = document.getElementById('chyronGas2');
    if (el) el.innerHTML = '$' + regular.toFixed(2);
    if (sub) sub.innerHTML = 'Mid $' + mid.toFixed(2) + ' &bull; Prem $' + premium.toFixed(2);
    var chyronText = 'Seattle avg: $' + regular.toFixed(2) + '/gal &bull; Diesel $' + diesel.toFixed(2);
    if (c1) c1.innerHTML = chyronText;
    if (c2) c2.innerHTML = chyronText;
  }
  // Try fetching from AAA gas prices via proxy
  function tryFetch() {
    var gasUrl = 'https://gasprices.aaa.com/?state=WA';
    fetchViaProxy(gasUrl)
      .then(function(r) { return r ? r.text() : null; })
      .then(function(html) {
        if (!html) throw new Error('no data');
        // Parse average prices from AAA page
        var regMatch = html.match(/Regular[\s\S]*?\$(\d+\.\d+)/);
        var midMatch = html.match(/Mid-Grade[\s\S]*?\$(\d+\.\d+)/);
        var premMatch = html.match(/Premium[\s\S]*?\$(\d+\.\d+)/);
        var dieMatch = html.match(/Diesel[\s\S]*?\$(\d+\.\d+)/);
        if (regMatch) {
          setGas(
            parseFloat(regMatch[1]),
            midMatch ? parseFloat(midMatch[1]) : parseFloat(regMatch[1]) + 0.30,
            premMatch ? parseFloat(premMatch[1]) : parseFloat(regMatch[1]) + 0.60,
            dieMatch ? parseFloat(dieMatch[1]) : parseFloat(regMatch[1]) + 0.20
          );
        } else { throw new Error('parse failed'); }
      })
      .catch(function() {
        // Fallback: use EIA data or simulate from known WA average (~$4.05 regular as of Mar 2026)
        var day = Math.floor((new Date() - new Date(2026,0,1)) / 86400000);
        var base = 5.65 + Math.sin(day * 0.03) * 0.12 + Math.cos(day * 0.07) * 0.08;
        setGas(
          base,
          base + 0.25,
          base + 0.50,
          base + 0.15
        );
      });
  }
  tryFetch();
  setInterval(tryFetch, 3600000); // refresh every hour
})();

    // ===== NATIONAL GAS PRICES (AAA) =====
    (function initNationalGasPrices() {
      function setNatlGas(data) {
        var ids = [{key:"regular",priceId:"natlGasRegular",chgId:"natlGasRegularChg"},{key:"mid",priceId:"natlGasMid",chgId:"natlGasMidChg"},{key:"premium",priceId:"natlGasPrem",chgId:"natlGasPremChg"},{key:"diesel",priceId:"natlGasDiesel",chgId:"natlGasDieselChg"},{key:"e85",priceId:"natlGasE85",chgId:"natlGasE85Chg"}];
        ids.forEach(function(item) {
          var el = document.getElementById(item.priceId);
          var chgEl = document.getElementById(item.chgId);
          if (el && data[item.key]) {
            el.innerHTML = "$" + data[item.key].toFixed(3);
            if (chgEl && data.yesterday && data.yesterday[item.key]) {
              var diff = data[item.key] - data.yesterday[item.key];
              var cents = Math.round(diff * 100);
              var arrow = cents > 0 ? "&#9650;" : cents < 0 ? "&#9660;" : "&#9644;";
              var dir = cents > 0 ? "up" : cents < 0 ? "down" : "flat";
              chgEl.innerHTML = arrow + " " + Math.abs(cents) + "&cent; vs yesterday";
              chgEl.className = "gas-card-change " + dir;
            }
          }
        });
        var comps = [{label:"yesterday",valId:"natlGasVsYest",deltaId:"natlGasVsYestDelta"},{label:"weekAgo",valId:"natlGasVsWeek",deltaId:"natlGasVsWeekDelta"},{label:"monthAgo",valId:"natlGasVsMonth",deltaId:"natlGasVsMonthDelta"},{label:"yearAgo",valId:"natlGasVsYear",deltaId:"natlGasVsYearDelta"}];
        comps.forEach(function(comp) {
          var valEl = document.getElementById(comp.valId);
          var dEl = document.getElementById(comp.deltaId);
          if (valEl && data[comp.label] && data[comp.label].regular) {
            valEl.innerHTML = "$" + data[comp.label].regular.toFixed(3);
            var diff = data.regular - data[comp.label].regular;
            var cents = Math.round(diff * 100);
            var arrow = cents > 0 ? "&#9650;" : cents < 0 ? "&#9660;" : "&#9644;";
            var dir = cents > 0 ? "up" : cents < 0 ? "down" : "flat";
            dEl.innerHTML = arrow + " " + (cents > 0 ? "+" : "") + cents + "&cent;";
            dEl.className = "gas-detail-delta " + dir;
          }
        });
        var c1 = document.getElementById("chyronGasNatl");
        var c2 = document.getElementById("chyronGasNatl2");
        if (data.regular) {
          var diff = data.yesterday ? Math.round((data.regular - data.yesterday.regular) * 100) : 0;
          var arrow = diff > 0 ? "\u25B2" : diff < 0 ? "\u25BC" : "\u25AC";
          var chTxt = "Nat'l avg: $" + data.regular.toFixed(3) + " " + arrow + Math.abs(diff) + "\u00A2";
          if (c1) c1.innerHTML = chTxt;
          if (c2) c2.innerHTML = chTxt;
        }
      }
      function tryFetchNatl() {
        fetchViaProxy("https://gasprices.aaa.com/")
          .then(function(r) { return r ? r.text() : null; })
          .then(function(html) {
            if (!html) throw new Error("no data");
            var data = {};
            var cm = html.match(/Current Avg[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)/);
            if (cm) { data.regular=parseFloat(cm[1]);data.mid=parseFloat(cm[2]);data.premium=parseFloat(cm[3]);data.diesel=parseFloat(cm[4]);data.e85=parseFloat(cm[5]); }
            else { throw new Error("parse failed"); }
            var ym = html.match(/Yesterday Avg[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)/);
            if (ym) data.yesterday={regular:parseFloat(ym[1]),mid:parseFloat(ym[2]),premium:parseFloat(ym[3]),diesel:parseFloat(ym[4]),e85:parseFloat(ym[5])};
            var wm = html.match(/Week Ago Avg[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)/);
            if (wm) data.weekAgo={regular:parseFloat(wm[1]),mid:parseFloat(wm[2]),premium:parseFloat(wm[3]),diesel:parseFloat(wm[4]),e85:parseFloat(wm[5])};
            var mm = html.match(/Month Ago Avg[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)/);
            if (mm) data.monthAgo={regular:parseFloat(mm[1]),mid:parseFloat(mm[2]),premium:parseFloat(mm[3]),diesel:parseFloat(mm[4]),e85:parseFloat(mm[5])};
            var yr = html.match(/Year Ago Avg[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)[\s\S]*?\$([\d.]+)/);
            if (yr) data.yearAgo={regular:parseFloat(yr[1]),mid:parseFloat(yr[2]),premium:parseFloat(yr[3]),diesel:parseFloat(yr[4]),e85:parseFloat(yr[5])};
            setNatlGas(data);
          })
          .catch(function() {
            var day = Math.floor((new Date() - new Date(2026,0,1)) / 86400000);
            var b = 4.02 + Math.sin(day * 0.025) * 0.08;
            setNatlGas({regular:b,mid:b+0.50,premium:b+0.87,diesel:b+1.49,e85:b-0.87,yesterday:{regular:b+0.02,mid:b+0.52,premium:b+0.89,diesel:b+1.51,e85:b-0.85},weekAgo:{regular:b+0.10,mid:b+0.60,premium:b+0.97,diesel:b+1.63,e85:b-0.76},monthAgo:{regular:b-0.10,mid:b+0.41,premium:b+0.80,diesel:b+1.19,e85:b-0.92},yearAgo:{regular:b-0.87,mid:b-0.40,premium:b-0.05,diesel:b-0.47,e85:b-1.41}});
          });
      }
      tryFetchNatl();
      setInterval(tryFetchNatl, 3600000);
    })();

// ===== NEWSPRINT THEME (locked; day/night toggle removed Apr 15 2026) =====
// Four Fingers News is a newsprint dispatch. The palette is the identity.
// Belt-and-suspenders: the body tag already carries class="light-mode", this
// just re-asserts it on boot in case something strips the class.
document.body.classList.add('light-mode');
// Clear any legacy override written to localStorage by the old toggle.
try { localStorage.removeItem('themeOverride'); } catch(e) {}


/* ===== APPROVAL RATING ===== */
(function initApproval(){
  var el=document.getElementById('approvalRating');
  if(!el) return;
  el.innerHTML='~47% APPROVAL';
  function fetchApproval(){
    var urls=[
      'https://projects.fivethirtyeight.com/polls/approval/donald-trump/polls.json',
      'https://projects.fivethirtyeight.com/trump-approval-data/approval_topline.csv'
    ];
    tryUrl(0);
    function tryUrl(idx){
      if(idx>=urls.length)return;
      fetchViaProxy(urls[idx])
        .then(function(r){
          if(!r)throw new Error('null');
          var ct=r.headers.get('content-type')||'';
          if(ct.indexOf('json')>-1)return r.json().then(parseJSON);
          return r.text().then(parseCSV);
        })
        .catch(function(){tryUrl(idx+1);});
    }
    function parseJSON(data){
      try{
        if(Array.isArray(data)&&data.length>0){
          for(var i=0;i<data.length;i++){
            if(data[i].subgroup==='All polls'||data[i].subpopulation==='All polls'){
              var pct=parseFloat(data[i].pct_estimate||data[i].approve);
              if(!isNaN(pct)){el.innerHTML=pct.toFixed(1)+'% APPROVAL';return;}
            }
          }
          var p=parseFloat(data[0].pct_estimate||data[0].approve||data[0].yes);
          if(!isNaN(p)){el.innerHTML=p.toFixed(1)+'% APPROVAL';return;}
        }
      }catch(e){}
    }
    function parseCSV(csv){
      try{
        var lines=csv.split('\n');
        for(var i=1;i<lines.length;i++){
          var cols=lines[i].split(',');
          if(cols[1]==='All polls'){
            var pct=parseFloat(cols[3]);
            if(!isNaN(pct)){el.innerHTML=pct.toFixed(1)+'% APPROVAL';return;}
          }
        }
      }catch(e){}
    }
  }
  fetchApproval();
  setInterval(fetchApproval,3600000);
})();