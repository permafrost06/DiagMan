"use strict";
import { app, protocol, BrowserWindow, Menu, dialog, shell } from "electron";
import { autoUpdater } from "electron-updater";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension from "electron-devtools-installer";
import * as db from "./db.js";
import * as dbDebug from "./db-debug.js";
import { limitTo, lastPage, nextPage, prevPage } from "./pagination.js";
import * as sync from "./sync.js";
const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const log = require("electron-log");
const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let win = null;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on("ready", async () => {
    if (isDevelopment && !process.env.IS_TEST) {
      // Install Vue Devtools
      try {
        installExtension({
          id: "ljjemllljcmogpfapbkkighbhhppjdbg",
          electron: ">=1.2.1",
        });
      } catch (e) {
        console.error("Vue Devtools failed to install:", e.toString());
      }
    }
    createWindow();
    win.maximize();

    win.on("resize", () => {
      win.webContents.send("resized");
    });
  });
}

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  var menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Sync with cloud",
          click() {
            syncWithFirebase();
          },
        },
        {
          label: "Exit",
          click() {
            app.quit();
          },
        },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Pending Patients",
          type: "radio",
          click: () => {
            win.webContents.send("show-pending-patients");
          },
          checked: true,
        },
        {
          label: "Past Reports",
          type: "radio",
          click: () => {
            win.webContents.send("show-past-reports");
          },
        },
      ],
    },
    {
      label: "Database",
      submenu: [
        {
          label: "Initialize Settings",
          click: () => {
            dbDebug.initTests();
            win.webContents.send("db-update");
          },
        },
        {
          label: "Seed Staged",
          click: async () => {
            await dbDebug.clearStaged();
            await dbDebug.seedStaged();
            win.webContents.send("db-updated");
          },
        },
        {
          label: "Seed Records",
          click: async () => {
            await dbDebug.clearDB();
            await dbDebug.seedRecords();
            win.webContents.send("db-updated");
          },
        },
        {
          label: "Seed Templates",
          click: async () => {
            dbDebug.seedTemplates();
            win.webContents.send("db-updated");
          },
        },
        {
          label: "Print Templates",
          click: async () => {
            dbDebug.printTemps();
          },
        },
        {
          label: "Clear Staged",
          click: async () => {
            await dbDebug.clearStaged();
            win.webContents.send("db-updated");
          },
        },
        {
          label: "Clear Records",
          click: async () => {
            await dbDebug.clearDB();
            win.webContents.send("db-updated");
          },
        },
        {
          label: "test sync",
          click: async () => {
            await sync.printDB();
          },
        },
        {
          label: "clear sync queue",
          click: async () => {
            sync.clearDB();
          },
        },
        {
          label: "get from firebase",
          click: () => {
            win.webContents.send("get-from-firebase");
          },
        },
        {
          label: "create blob",
          click: () => {
            createBlob();
          },
        },
      ],
    },
    {
      label: "Settings",
      submenu: [
        {
          label: "Tests",
          click() {
            win.webContents.send("open-settings");
          },
        },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click() {
            console.log(win.getSize());
          },
        },
        {
          label: "DevTools",
          click() {
            win.webContents.openDevTools();
          },
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  // setInterval(syncWithFirebase, 1000 * 5); // call every five seconds

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

if (!fs.existsSync(`${app.getPath("userData")}/files`)) {
  fs.mkdirSync(`${app.getPath("userData")}/files`);
}

const createBlob = () => {
  // win.webContents.send("send-blob", fs.readFileSync("d:/documents/report.pdf"));
  sync.syncFiles();
};

const syncWithFirebase = async () => {
  const queue = await sync.getSyncQueue();
  if (queue.length < 1) {
    win.webContents.send("get-from-firebase");
    return;
  }
  win.webContents.send("send-to-firebase", queue[0]);
};

ipcMain.on("start-sync", async () => {
  await syncWithFirebase();
});

ipcMain.on("firebase-success", async () => {
  await sync.dequeueItem();
  await syncWithFirebase();
});

ipcMain.on("firebase-pull", async (event, data) => {
  await sync.syncWithCloudData(data);
  win.webContents.send("sync-complete");
});

ipcMain.on("check-id-collision", async (event, id) => {
  var record = await db.getStaged({
    keys: [id],
  });

  log.debug("staged record containing id", id, record[0]);

  if (record[0]) win.webContents.send("id-conflict");
  else {
    record = await db.getRecords({
      keys: [id],
    });
    log.debug("saved record containing id", id, record[0]);
    if (record[0]) win.webContents.send("id-conflict");
    else win.webContents.send("id-safe");
  }
});

ipcMain.on("get-width", (event) => {
  event.returnValue = win.getSize()[0];
});

ipcMain.on("get-tests", async (event) => {
  event.returnValue = await db.getTests();
});

ipcMain.on("add-test", async (event, data) => {
  await db.addTest(data);
  win.webContents.send("db-update");
});

ipcMain.on("add-record", async (event, data) => {
  await db.addRecord(data);

  win.webContents.send("db-updated");
});

ipcMain.on("add-staged", async (event, data) => {
  await db.addStaged(data);
  win.webContents.send("db-updated");
});

ipcMain.on("update-test", async (event, data) => {
  await db.updateTest(data);
  win.webContents.send("db-update");
});

ipcMain.on("delete-staged", async (event, data) => {
  await db.removeStaged(data._id, data._rev);
  win.webContents.send("db-updated");
});

ipcMain.on("delete-record", async (event, data) => {
  await db.removeRecord(data._id, data._rev);
  win.webContents.send("db-updated");
});

ipcMain.on("test-delete", async (event, data) => {
  await db.removeTest(data);
  win.webContents.send("db-update");
});

ipcMain.on("record-update", (event, data) => {
  db.updateRecord(data);
  win.webContents.send("db-updated");
});

ipcMain.on("update-staged", (event, data) => {
  db.updateStaged(data);
  win.webContents.send("db-updated");
});

ipcMain.on("get-record", async (event, id) => {
  const records = await db.getRecords({
    keys: [id],
  });
  event.returnValue = records[0];
});

ipcMain.on("get-templates", async (event) => {
  const templates = await db.getTemplates();
  event.returnValue = templates;
});

ipcMain.on("add-organ", async (event, organName) => {
  await db.addOrgan(organName);
});

ipcMain.on("add-template", async (event, organ, template) => {
  await db.addTemplate(organ, template);
  win.webContents.send("db-updated");
});

ipcMain.on("update-template", async (event, organ, template) => {
  db.updateTemplate(organ, template);
  win.webContents.send("db-updated");
});

ipcMain.on("delete-template", async (event, organ, templateID) => {
  db.removeTemplate(organ, templateID);
  win.webContents.send("db-updated");
});

ipcMain.on("get-staged-rcd", async (event, id) => {
  const records = await db.getStaged({
    keys: [id],
  });
  event.returnValue = records[0];
});

ipcMain.on("get-records", async (event, options, filter) => {
  if (options.limit) {
    const { limit, ...opt } = options;

    if (options.lastID) {
      const { lastID, ...dbopt } = opt;
      const records = await db.getRecords(dbopt, filter);
      const results = nextPage(records, lastID, limit);

      if (results.length) {
        event.returnValue = results;
      } else {
        event.returnValue = lastPage(records, limit);
      }
    } else if (options.firstID) {
      const { firstID, ...dbopt } = opt;
      const records = await db.getRecords(dbopt, filter);
      const results = prevPage(records, firstID, limit);

      if (results.length) {
        event.returnValue = results;
      } else {
        event.returnValue = limitTo(records, limit);
      }
    } else {
      const records = await db.getRecords(opt, filter);
      event.returnValue = limitTo(records, limit);
    }
  } else {
    event.returnValue = await db.getRecords(options, filter);
  }
});

ipcMain.on("get-referers", async (event) => {
  var doctors = [];

  doctors.push(
    ...(await db.getStaged({})).map((record) => {
      return record.referer;
    })
  );
  doctors.push(
    ...(await db.getRecords({})).map((record) => {
      return record.referer;
    })
  );

  event.returnValue = [...new Set(doctors)];
});

ipcMain.on("export", async (event, ids) => {
  var csv;

  var records = await db.getRecords({
    keys: JSON.parse(ids),
  });

  csv = jsonToCsv(JSON.stringify(records));

  if (csv) {
    try {
      fs.writeFileSync(
        app.getPath("desktop") + "\\Exported Report.csv",
        csv,
        "utf-8"
      );

      shell.openPath(app.getPath("desktop") + "\\Exported Report.csv");
    } catch (e) {
      log.error("Background.js: File write error", e);
      dialog.showMessageBox(win, {
        message:
          "Failed to save the file!\nThe file might already be open in another program. Please close it first.",
        type: "warning",
      });
    }
  }
});

const jsonToCsv = (json) => {
  if (json == "[]") return null;
  else {
    const items = JSON.parse(json);
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(items[0]);
    const csv = [
      header.join(","), // header row first
      ...items.map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(",")
      ),
    ].join("\r\n");

    return csv;
  }
};

ipcMain.on("get-staged", async (event, options, filter) => {
  if (options.limit) {
    const { limit, ...opt } = options;

    if (options.lastID) {
      const { lastID, ...dbopt } = opt;
      const records = (await db.getStaged(dbopt, filter)).reverse();
      const results = nextPage(records, lastID, limit);

      if (results.length) {
        event.returnValue = results;
      } else {
        event.returnValue = lastPage(records, limit);
      }
    } else if (options.firstID) {
      const { firstID, ...dbopt } = opt;
      const records = (await db.getStaged(dbopt, filter)).reverse();
      const results = prevPage(records, firstID, limit);

      if (results.length) {
        event.returnValue = results;
      } else {
        event.returnValue = limitTo(records, limit);
      }
    } else {
      const records = (await db.getStaged(opt, filter)).reverse();
      event.returnValue = limitTo(records, limit);
    }
  } else {
    event.returnValue = (await db.getStaged(options, filter)).reverse();
  }
});
