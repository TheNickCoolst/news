const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'news',
    backgroundColor: '#1a1a1a',
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
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

const zlib = require('zlib');

function fetchUrl(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects < 0) {
      return reject(new Error('Too many redirects'));
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
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
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
  await shell.openExternal(url);
  return true;
});

let geoCache = null;

ipcMain.handle('get-geo', async () => {
  if (geoCache) return { ok: true, geo: geoCache };
  try {
    const raw = await fetchUrl('https://ipapi.co/json/');
    const data = JSON.parse(raw);
    if (data.error) throw new Error(data.reason || 'geo lookup failed');
    geoCache = {
      city: data.city || null,
      region: data.region || null,
      country: data.country_name || null,
      countryCode: (data.country_code || data.country || '').toUpperCase(),
      languages: (data.languages || '').split(',')[0] || null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      timezone: data.timezone || null,
      ip: data.ip || null,
    };
    return { ok: true, geo: geoCache };
  } catch (err) {
    return { ok: false, error: err.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
