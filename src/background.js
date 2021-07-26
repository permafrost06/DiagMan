"use strict";
import { app, protocol, BrowserWindow, Menu, dialog, shell } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension from "electron-devtools-installer";
import jsonData from "./components/records.js";
const { ipcMain } = require("electron");
const path = require("path");
var PouchDB = require("pouchdb-node");
const fs = require("fs");
const isDevelopment = process.env.NODE_ENV !== "production";

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let win = null;
const gotTheLock = app.requestSingleInstanceLock();

var db = new PouchDB("records.db");

function seedDatabase() {
  for (let i = 0; i < jsonData.length; i++) {
    db.put(jsonData[i]).catch((error) => {
      console.log(error);
    });
  }

  win.webContents.send("db-updated");
}

function printDB() {
  db.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      console.log(result.rows[i].doc);
    }
  });
}

function clearDB() {
  db.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      db.remove(result.rows[i].doc);
    }
  });

  win.webContents.send("db-updated");
}

const updateRecord = async (record) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await db.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  record._rev = await getRev(record._id);

  try {
    await db.put(record);
  } catch (error) {
    console.log(error);
  }
};

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
          },
        },
        {
          label: "Clear DB",
          click() {
            clearDB();
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

ipcMain.on("asynchronous-message", (event, arg) => {
  console.log(arg); // prints "ping"
  event.reply("asynchronous-reply", "pong");
});

ipcMain.on("get-width", (event) => {
  event.returnValue = win.getSize()[0];
});

ipcMain.on("record-update", (event, data) => {
  updateRecord(data);
  win.webContents.send("db-updated");
});

ipcMain.on("get-records", async (event, filter) => {
  var allRecords = [];
  const query = await db.allDocs({ include_docs: true });

  if (query.rows && query.rows.length) {
    allRecords = query.rows.map(({ doc }) => doc);
  }

  console.log(filter);

  if (filter) {
    event.returnValue = allRecords
      .filter((record) => {
        return record.patientName
          .toLowerCase()
          .includes(filter.patientNameFilter);
      })
      .filter((record) => {
        return record.date.toLowerCase().includes(filter.dateFilter);
      })
      .filter((record) => {
        return record.age.toLowerCase().includes(filter.ageFilter);
      })
      .filter((record) => {
        return record.specimen.toLowerCase().includes(filter.specimenFilter);
      })
      .filter((record) => {
        return record.referer.toLowerCase().includes(filter.refererFilter);
      })
      .filter((record) => {
        return record.aspNote.toLowerCase().includes(filter.aspNoteFilter);
      })
      .filter((record) => {
        return record.me.toLowerCase().includes(filter.meFilter);
      })
      .filter((record) => {
        return record.impression
          .toLowerCase()
          .includes(filter.impressionFilter);
      });
  } else {
    event.returnValue = allRecords;
  }
});

ipcMain.on("export", (event, arg) => {
  const csv = jsonToCsv(arg);

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
