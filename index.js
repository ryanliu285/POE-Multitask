const { app, BrowserWindow, session, screen} = require('electron')

function createWindow () {
  //Taken from https://github.com/BarryCarlyon/twitch_misc/blob/master/player/electron/app.js
  session.defaultSession.webRequest.onBeforeRequest({
    urls: [
      'https://embed.twitch.tv/*channel=*'
    ]
  }, (details, cb) => {
    var redirectURL = details.url;

    var params = new URLSearchParams(redirectURL.replace('https://embed.twitch.tv/',''));
    if (params.get('parent') != '') {
      cb({});
      return;
    }
    params.set('parent', 'locahost');
    params.set('referrer', 'https://localhost/');

    var redirectURL = 'https://embed.twitch.tv/?' + params.toString();
    console.log('Adjust to', redirectURL);

    cb({
      cancel: false,
      redirectURL
    });
  });

  // works for dumb iFrames
  session.defaultSession.webRequest.onHeadersReceived({
    urls: [
      'https://player.twitch.tv/*',
      'https://embed.twitch.tv/*'
    ]
  }, (details, cb) => {
    var responseHeaders = details.responseHeaders;

    console.log('headers', details.url, responseHeaders);

    delete responseHeaders['Content-Security-Policy'];
    //console.log(responseHeaders);

    cb({
      cancel: false,
      responseHeaders
    });
  });
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  let win = new BrowserWindow({
    frame: false,
    height: height/3,
    width: width/3,
    x: width - width/3,
    y: height - height/3,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.setMenu(null)

  win.loadFile('index.html')

  //win.webContents.openDevTools()

  win.setAlwaysOnTop(true, 'screen')

}

app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
