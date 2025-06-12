let appPath: string;

async function load() {
  if (!appPath) {
    appPath = await window.app.getAppPath();
  }
}

load();

export { appPath };
