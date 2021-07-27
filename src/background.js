"use strict";
import { app, protocol, BrowserWindow, Menu, dialog, shell } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension from "electron-devtools-installer";
import {
  seedDatabase,
  printDB,
  clearDB,
  updateRecord,
  getRecords,
} from "./db.js";
import { limitTo, limitToLast, nextPage, prevPage } from "./pagination.js";
const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
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
          label: "Exit",
          click() {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Database",
      submenu: [
        {
          label: "Print DB",
          click() {
            printDB();
          },
        },
        {
          label: "Seed DB",
          click() {
            seedDatabase();
            win.webContents.send("db-updated");
          },
        },
        {
          label: "Clear DB",
          click() {
            clearDB();
            win.webContents.send("db-updated");
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
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
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

ipcMain.on("get-width", (event) => {
  event.returnValue = win.getSize()[0];
});

ipcMain.on("record-update", (event, data) => {
  updateRecord(data);
  win.webContents.send("db-updated");
});

ipcMain.on("get-records", async (event, options, filter) => {
  if (options.limit) {
    const { limit, ...opt } = options;

    if (options.lastID) {
      const { lastID, ...dbopt } = opt;
      const records = await getRecords(dbopt, filter);
      const results = nextPage(records, lastID, options.limit);

      if (results.length) {
        event.returnValue = results;
      } else {
        event.returnValue = limitTo(records, options.limit);
      }
    } else if (options.firstID) {
      const { firstID, ...dbopt } = opt;
      const records = await getRecords(dbopt, filter);
      const results = prevPage(records, firstID, options.limit);

      if (results.length) {
        event.returnValue = results;
      } else {
        event.returnValue = limitTo(records, options.limit);
      }
    } else {
      const records = await getRecords(opt, filter);
      event.returnValue = limitTo(records, options.limit);
    }
  } else {
    event.returnValue = await getRecords(options, filter);
  }
});

ipcMain.on("export", async (event, ids) => {
  var csv;

  var records = await getRecords({
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
      console.log(e);
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
