"use strict";
import { app, protocol, BrowserWindow, dialog, shell } from "electron";
import { autoUpdater } from "electron-updater";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension from "electron-devtools-installer";
import * as db from "./db.js";
import { menu, debugMenu } from "./menus.js";
import { sendSMS } from "./sms.js";
import "./ipc";

const { ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const log = require("electron-log");
const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

export let win = null;
const gotTheLock = app.requestSingleInstanceLock();
let prod_debug = false;

export var sms_token = "";

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

  win.setMenu(menu);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools();
      win.webContents.send("testing-disable-password");
      prod_debug = true;
      win.setMenu(debugMenu);
    }
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

ipcMain.on("debug-mode-enabled", () => {
  win.setMenu(debugMenu);
  prod_debug = true;
});

ipcMain.on("check-debug", (event) => (event.returnValue = prod_debug));

ipcMain.on("get-width", (event) => {
  event.returnValue = win.getSize()[0];
});

ipcMain.on("sms-token", (event, token) => {
  sms_token = token;
  console.log(token, sms_token);
});

ipcMain.on("send-sms", (event, contactNo) => {
  sendSMS(contactNo, sms_token);
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
