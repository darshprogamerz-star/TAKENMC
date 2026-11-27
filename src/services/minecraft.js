const { config } = require('../config');

let cachedStatus = null;
let cacheExpiresAt = 0;

function cleanText(value) {
  if (Array.isArray(value)) value = value.join('\n');
  if (value && typeof value === 'object') value = value.text || value.clean || value.raw || '';
  return String(value || '')
    .replace(/§[0-9a-fk-or]/gi, '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/\r/g, '')
    .trim();
}

function offlineStatus(latency = null) {
  return {
    online: false,
    players: { online: 0, max: 0 },
    playerNames: [],
    playerListVisible: false,
    version: null,
    software: null,
    motd: null,
    icon: null,
    latency
  };
}

async function fetchJson(url) {
  const startedAt = Date.now();
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(config.requestTimeoutMs || 8000), headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`Status API returned HTTP ${response.status}`);
    const data = await response.json();
    return { data, latency: Date.now() - startedAt };
  } catch (error) {
    error.message = `${url}: ${error.message}`;
    throw error;
  }
}

function fromMcsrvstat(data, latency) {
  const online = data?.online === true;
  const playersData = data?.players || {};
  const rawList = Array.isArray(playersData.list) ? playersData.list : null;
  const names = rawList ? rawList.map((entry) => cleanText(typeof entry === 'string' ? entry : entry?.name)).filter(Boolean) : [];
  return {
    online,
    players: { online: Number(playersData.online) || 0, max: Number(playersData.max) || 0 },
    playerNames: names,
    playerListVisible: rawList !== null,
    version: cleanText(data?.version),
    software: cleanText(data?.software),
    motd: cleanText(data?.motd?.clean || data?.motd?.raw || data?.motd),
    icon: typeof data?.icon === 'string' ? data.icon : null,
    latency
  };
}

function fromMcstatus(data, latency) {
  const online = data?.online === true;
  const playersData = data?.players || {};
  const rawList = Array.isArray(playersData.list) ? playersData.list : null;
  const names = rawList ? rawList.map((entry) => cleanText(entry?.name_clean || entry?.name_raw || entry?.name)).filter(Boolean) : [];
  const versionData = data?.version;
  return {
    online,
    players: { online: Number(playersData.online) || 0, max: Number(playersData.max) || 0 },
    playerNames: names,
    playerListVisible: rawList !== null,
    version: cleanText(versionData?.name_clean || versionData?.name || versionData),
    software: cleanText(data?.software),
    motd: cleanText(data?.motd?.clean || data?.motd?.raw || data?.motd),
    icon: typeof data?.icon === 'string' ? data.icon : null,
    latency
  };
}

async function queryPrimary() {
  const { data, latency } = await fetchJson(`https://api.mcsrvstat.us/3/${encodeURIComponent(config.java.host)}`);
  return fromMcsrvstat(data, latency);
}

async function queryFallback() {
  const { data, latency } = await fetchJson(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(config.java.host)}`);
  return fromMcstatus(data, latency);
}

async function getStatus({ force = false } = {}) {
  if (!force && cachedStatus && Date.now() < cacheExpiresAt) return { ...cachedStatus, players: { ...cachedStatus.players }, playerNames: [...cachedStatus.playerNames] };

  let primary;
  try {
    primary = await queryPrimary();
    // If the primary API says offline, try the fallback before presenting the server as offline.
    if (primary.online) return saveStatus(primary);
  } catch (error) {
    console.warn('[Minecraft] Primary status API failed:', error.message);
  }

  try {
    const fallback = await queryFallback();
    if (fallback.online) return saveStatus(fallback);
    return saveStatus(fallback);
  } catch (error) {
    console.warn('[Minecraft] Fallback status API failed:', error.message);
    return saveStatus(primary || offlineStatus());
  }
}

function saveStatus(status) {
  cachedStatus = status;
  cacheExpiresAt = Date.now() + Math.max(0, Number(config.statusCacheSeconds) || 30) * 1000;
  return { ...status, players: { ...status.players }, playerNames: [...status.playerNames] };
}

// Bedrock has its own query endpoint; its result is kept separate from the Java status command.
// Endpoint: https://api.mcsrvstat.us/bedrock/3/takenmc.mcsh.gg
async function getBedrockStatus() {
  try {
    const { data, latency } = await fetchJson(`https://api.mcsrvstat.us/bedrock/3/${encodeURIComponent(config.bedrock.host)}`);
    return fromMcsrvstat(data, latency);
  } catch (error) {
    console.warn('[Minecraft] Bedrock status API failed:', error.message);
    return offlineStatus();
  }
}

module.exports = { getStatus, getBedrockStatus, cleanText };
