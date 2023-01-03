import { ipcMain } from "electron";
import * as db from "./db";
import { win } from "./background";
import { limitTo, lastPage, nextPage, prevPage } from "./pagination.js";
import { getSyncQueue, removeItem } from "./sync";

const log = require("electron-log");

ipcMain.on("check-id-collision", async (event, id, prevID) => {
    if (prevID && id === prevID) {
        win.webContents.send("id-safe");
        return;
    }

    let records = await db.getStaged({
        keys: [id],
    });

    if (records[0]) {
        log.debug("staged record containing id", id, records[0]);
        win.webContents.send("id-conflict");
        return;
    }

    records = await db.getRecords({
        keys: [id],
    });

    if (records[0]) {
        log.debug("saved record containing id", id, records[0]);
        win.webContents.send("id-conflict");
        return;
    }

    win.webContents.send("id-safe");
});

ipcMain.on("check-test-id-collision", async (event, id) => {
    var tests = await db.getTests();

    tests = tests.filter((test) => test._id == id);

    log.debug("existing test containing id", id, tests);

    if (tests.length) {
        win.webContents.send("test-id-conflict");
    } else {
        win.webContents.send("test-id-safe");
    }
});

ipcMain.on("get-tests", async (event) => {
    event.returnValue = await db.getTests();
});

ipcMain.on("add-test", async (event, data) => {
    const newTestID = await db.addTest(data);
    win.webContents.send("test-added", newTestID);
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

ipcMain.on("get-sync-queue", async (event) => {
    event.returnValue = await getSyncQueue();
});

ipcMain.on("remove-queue-item", async (event, id) => {
    await removeItem(id);
});
