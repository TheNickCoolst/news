const { app, BrowserWindow, ipcMain, shell, nativeTheme } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');

let mainWindow;

function isWebUrl(value) {
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

function openExternalSafe(url) {
  if (isWebUrl(url)) shell.openExternal(url);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'dahamm',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#151311' : '#f7f3ec',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'renderer', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.setMenuBarVisibility(false);

  // External links open in default browser, not inside the Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalSafe(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url === mainWindow.webContents.getURL()) return;
    event.preventDefault();
    openExternalSafe(url);
  });
}

const zlib = require('zlib');

// Feeds such as Golem are ISO-8859-1; honour the declared charset.
function decodeBody(buffer, contentType) {
  const head = buffer.subarray(0, 1024).toString('latin1');
  const charset = (
    /charset=["']?([\w-]+)/i.exec(contentType || '')?.[1] ||
    /<\?xml[^>]*encoding=["']([\w-]+)/i.exec(head)?.[1] ||
    /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ||
    'utf-8'
  ).toLowerCase();
  try {
    return new TextDecoder(charset).decode(buffer);
  } catch {
    return buffer.toString('utf8');
  }
}

function fetchUrl(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects < 0) {
      return reject(new Error('Too many redirects'));
    }
    if (!isWebUrl(url)) {
      return reject(new Error('Unsupported URL'));
    }
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml,application/rss+xml,application/atom+xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'de-DE,de;q=0.9,en;q=0.6',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        timeout: 20000,
      },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          return resolve(fetchUrl(next, redirects - 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }

        let stream = res;
        const enc = (res.headers['content-encoding'] || '').toLowerCase();
        if (enc === 'gzip') stream = res.pipe(zlib.createGunzip());
        else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());
        else if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress());

        const chunks = [];
        stream.on('data', (c) => chunks.push(c));
        stream.on('end', () => resolve(decodeBody(Buffer.concat(chunks), res.headers['content-type'])));
        stream.on('error', reject);
      }
    );
    req.on('timeout', () => {
      req.destroy(new Error('Request timeout'));
    });
    req.on('error', reject);
  });
}

ipcMain.handle('fetch-feed', async (_event, url) => {
  try {
    const xml = await fetchUrl(url);
    return { ok: true, xml };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

ipcMain.handle('open-external', async (_event, url) => {
  if (!isWebUrl(url)) return false;
  await shell.openExternal(url);
  return true;
});

// IP lookup is only a hint for the first-run place picker.
const GEO_PROVIDERS = [
  {
    url: 'https://get.geojs.io/v1/ip/geo.json',
    map: (data) => ({
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
      countryCode: String(data.country_code || '').toUpperCase(),
    }),
  },
  {
    url: 'https://ipwho.is/',
    map: (data) => {
      if (data.success === false) throw new Error(data.message || 'geo lookup failed');
      return {
        city: data.city || null,
        region: data.region || null,
        country: data.country || null,
        countryCode: String(data.country_code || '').toUpperCase(),
      };
    },
  },
];

let geoCache = null;

ipcMain.handle('get-geo', async () => {
  if (geoCache) return { ok: true, geo: geoCache };
  let lastError = 'geo lookup failed';
  for (const provider of GEO_PROVIDERS) {
    try {
      geoCache = provider.map(JSON.parse(await fetchUrl(provider.url)));
      return { ok: true, geo: geoCache };
    } catch (err) {
      lastError = err.message;
    }
  }
  return { ok: false, error: lastError };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
