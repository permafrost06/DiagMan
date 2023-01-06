import { app, Menu } from "electron";
import * as dbDebug from "./debug/db-debug";
import * as sync from "./sync";
import { sms_token, win } from "../background";
import { sendSMS } from "./sms";

export const debugMenu = Menu.buildFromTemplate([
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
        label: "View",
        submenu: [
            {
                label: "Pending Patients",
                click: () => {
                    win.webContents.send("show-pending-patients");
                },
                checked: true,
            },
            {
                label: "Past Reports",
                click: () => {
                    win.webContents.send("show-past-reports");
                },
            },
            {
                label: "Monthly Summary",
                click: () => {
                    win.webContents.send("show-monthly-summary");
                },
            },
            {
                label: "Sync Queue",
                click: () => {
                    win.webContents.send("show-sync-queue");
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
            {
                label: "send test sms",
                click: () => {
                    sendSMS("01843768635", sms_token);
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
                    win.webContents.send("show-about");
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

export const menu = Menu.buildFromTemplate([
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
        label: "View",
        submenu: [
            {
                label: "Pending Patients",
                click: () => {
                    win.webContents.send("show-pending-patients");
                },
                checked: true,
            },
            {
                label: "Past Reports",
                click: () => {
                    win.webContents.send("show-past-reports");
                },
            },
            {
                label: "Monthly Summary",
                click: () => {
                    win.webContents.send("show-monthly-summary");
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
                    win.webContents.send("show-about");
                },
            },
        ],
    },
]);

const createBlob = () => {
    // win.webContents.send("send-blob", fs.readFileSync("d:/documents/report.pdf"));
    sync.syncFiles();
};
