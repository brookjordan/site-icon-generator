require('dotenv').config();

const appDomain = (process.env.APP_DOMAIN || 'http://localhost:5500').replace(/\/$/, '');
const appRootPath = (process.env.APP_ROUTE_PATH || 'dist').replace(/\/$/, '');
const iconFolder = (process.env.ICON_FOLDER || 'icons').replace(/\/$/, '').replace(/^\//, '');
const appleStatusBarStyle = process.env.APPLE_STATUS_BAR_STYLE || 'default';
const iconFocalPoint = process.env.ICON_FOCAL_POINT || 'center center';
const siteName = process.env.SITE_NAME || 'My site';
const siteShortName = process.env.SITE_SHORT_NAME || 'Site';
const iconColor = process.env.ICON_COLOR || '#000000';
const themeColor = process.env.THEME_COLOR || '#ffffff';

const fs = require('fs');
const util = require('util');
const path = require('path');
const puppeteer = require('puppeteer');
const iconDefinitions = require('./icon-definitions.js');

const writeFile = util.promisify(fs.writeFile);
const sizes = iconDefinitions.map(size => ({
  ...size,
  name: `${size.type}-${size.width}x${size.height}`,
}));

async function buildIconBuilder() {
  return writeFile(
    path.join(__dirname, '.tmp', 'icon.html'), `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          margin: 0;
          background: white;
          height: 100vh;
        }
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: ${iconFocalPoint};
        }
      </style>
    </head>
    <body>
      <img src="../source-image.png" >
    </body>
    </html>`);
}

async function buildIconMeta() {
  return writeFile(path.join(__dirname, 'dist', 'index.head.html'),`
  <!-- ### Manifest and icons ### -->
  <!-- General -->
  <link rel="manifest" href="${appRootPath}/site.webmanifest">

  <meta name="theme-color" content="${themeColor}">
  <meta name="application-name" content="${siteName}">

  <link rel="shortcut icon" href="${appRootPath}/${iconFolder}/favicon.ico">
  ${
    sizes
      .filter(size => size.type === 'favicon')
      .map(size => `<link rel="icon" type="image/png" sizes="${size.width}x${size.height}" href="${appRootPath}/${iconFolder}/${size.name}.png"></link>`)
      .join('\n  ')
  }

  <!-- Apple -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="${siteShortName}">
  <meta name="apple-mobile-web-app-status-bar-style" content="${appleStatusBarStyle}">
  ${
    sizes
      .filter(size => size.type === 'mask-icon')
      .map(size => `<link rel="mask-icon" href="data:image/svg+xml,%3Csvg width='${size.width}' height='${size.height}' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cimage href='${encodeURIComponent(`${appDomain}/${appRootPath}${appRootPath ? '/' : ''}${iconFolder}/${size.name}.png`)}' height='${size.height}' width='${size.width}'/%3E%3C/svg%3E" color="${iconColor}">`)
      .join('\n  ')
  }

  ${
    sizes
      .filter(size => size.type === 'apple-touch-icon')
      .map(size => `<link rel="apple-touch-icon" sizes="${size.width}x${size.height}" href="${appRootPath}/${iconFolder}/${size.name}.png">`)
      .join('\n  ')
  }
  ${
    sizes
      .filter(size => size.type === 'apple-startup')
      .map(size => `<link rel="apple-touch-startup-image" media="(device-width: ${size.width / 2}px) and (device-height: ${size.height / 2}px)" href="/apple-launch-${size.width}x${size.height}.png">`)
      .join('\n  ')
  }

  <!-- Microsoft -->
  <meta name="msapplication-TileColor" content="${themeColor}">
  <meta name="msapplication-config" content="${appRootPath}/browserconfig.xml">
  <!-- ### /Manifest and icons ### -->`.replace(/\n {2}/g, '\n').replace(/^\n/, ''))
  .then(() => { console.log('Built icon meta tags.'); });
}

async function buildBrowserconfig() {
  return writeFile(path.join(__dirname, 'dist', 'browserconfig.xml'),`
  <? xml version = "1.0" encoding = "utf-8" ?>
  <browserconfig>
    <msapplication>
      <tile>
        ${
          sizes
            .filter(size => size.type === 'mstile')
            .map(size => `<${size.width > size.height ? 'wide' : 'square'}${size.width}x${size.height}logo src="${appRootPath}/${iconFolder}/${size.name}.png" />`)
            .join('\n        ')
        }
        <TileColor>${themeColor}</TileColor>
      </tile>
    </msapplication>
  </browserconfig>`.replace(/\n {2}/g, '\n').replace(/^\n/, ''))
  .then(() => { console.log('Built browserconfig.'); });
}

async function buildWebmanifest() {
  return writeFile(path.join(__dirname, 'dist', 'page.webmanifest'),`
  {
    "name": "${siteName}",
    "short_name": "${siteShortName}",
    "icons": [
    ${
    sizes
      .filter(size => size.type === 'pwa-icon')
      .map(size => `  {
        "src": "${appRootPath}/${iconFolder}/${size.name}.png",
        "sizes": "${size.width}x${size.height}",
        "type": "image/png"
      }`)
      .join(',\n    ')
    }
    ],
    "theme_color": "${themeColor}",
    "background_color": "${themeColor}"
  }`.replace(/\n {2}/g, '\n').replace(/^\n/, ''))
  .then(() => { console.log('Built manifest.'); });
}

async function buildIcons() {
  const iconDirectory = path.join(__dirname, 'dist', iconFolder);
  if (!fs.existsSync(iconDirectory)){
    console.log('Building directories...');
    fs.mkdirSync(iconDirectory, { recursive: true });
  }

  console.log('Launching puppeteer...');
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  console.log('Launching browser...');
  const page = await browser.newPage();

  console.log('Loading page...');
  await page.goto(`file://${path.join(__dirname, '.tmp', 'icon.html')}`);

  console.log('Building screenshots...');
  let sizesLeft = [...sizes];
  while (sizesLeft.length) {
    let size = sizesLeft.pop();
    console.log(`Screenshotting ${size.name}...`);

    await page.setViewport({
      width: size.width,
      height: size.height
    });
    await page.screenshot({
      type: 'png',
      path: path.join(iconDirectory, `${size.name}.png`),
    });
  }
  await browser.close();
}


(async function() {
  await Promise.all([
    buildIconBuilder().then(buildIcons),
    buildBrowserconfig(),
    buildWebmanifest(),
    buildIconMeta(),
  ]);
  console.log('Done');
})();
