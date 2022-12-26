import { app, ipcMain } from "electron";
import * as db from "./db.js";
import { win } from "./background";

var PouchDB = require("pouchdb-node");
var _ = require("lodash");
const fs = require("fs");
const log = require("electron-log");

var syncDB = new PouchDB(`${app.getPath("userData")}/syncs.db`);

export const queueRecordSync = async (syncObject) => {
  // eslint-disable-next-line no-unused-vars
  const { _rev, ...newObj } = syncObject.object;
  syncObject.object = newObj;

  let syncQueue;

  try {
    syncQueue = await syncDB.get("syncQueue");
  } catch (e) {
    if (e.reason == "missing" || e.reason == "deleted") {
      log.debug(
        'Sync.js: queueRecordSync() -> sync queue is "missing" or "deleted"'
      );
      await syncDB.put({
        _id: "syncQueue",
        queue: [],
      });

      try {
        syncQueue = await syncDB.get("syncQueue");
      } catch (error) {
        log.error("Sync.js: queueRecordSync() -> can't get sync queue", error);
      }
    } else {
      log.error("Sync.js: queueRecordSync() -> can't get sync queue", e);
    }
  }

  syncQueue.queue.push(syncObject);

  try {
    await syncDB.put(syncQueue);
  } catch (e) {
    log.error("Sync.js: queueRecordSync() -> error updating sync queue", e);
  }
};

export const getSyncQueue = async () => {
  let queueDoc;

  try {
    queueDoc = await syncDB.get("syncQueue");
  } catch (e) {
    if (e.reason == "missing" || e.reason == "deleted") {
      log.debug(
        'Sync.js: getSyncQueue() -> sync queue is "missing" or "deleted"'
      );
      await syncDB.put({
        _id: "syncQueue",
        queue: [],
      });

      try {
        queueDoc = await syncDB.get("syncQueue");
      } catch (error) {
        log.error("Sync.js: getSyncQueue() -> can't get sync queue", error);
      }
    } else {
      log.error("Sync.js: getSyncQueue() -> can't get sync queue", e);
    }
  }
  return queueDoc.queue;
};

export const dequeueItem = async () => {
  try {
    const queueDoc = await syncDB.get("syncQueue");
    queueDoc.queue.shift();
    try {
      await syncDB.put(queueDoc);
    } catch (e) {
      log.error("Sync.js: dequeue failed", e);
    }
  } catch (e) {
    log.error("Sync.js: can't get sync queue", e);
  }
};

export const removeItem = async (id) => {
  try {
    const queueDoc = await syncDB.get("syncQueue");
    console.log(queueDoc.queue.map(({ object }) => object._id));
    queueDoc.queue = queueDoc.queue.filter(({ object }) => object._id != id);
    console.log(queueDoc.queue.map(({ object }) => object._id));
    try {
      await syncDB.put(queueDoc);
    } catch (e) {
      log.error("Sync.js: item removal failed", e);
    }
  } catch (e) {
    log.error("Sync.js: can't get sync queue", e);
  }
};

export const printDB = async () => {
  syncDB.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      log.debug(result.rows[i].doc);
    }
  });
};

export const clearDB = () => {
  syncDB.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      syncDB.remove(result.rows[i].doc);
    }
  });
};

export const isQueueEmpty = async () => {
  try {
    const queueDoc = await syncDB.get("syncQueue");
    if (queueDoc.queue.length > 0) return false;
    else return true;
  } catch (e) {
    log.error("Sync.js: error getting syncQueue", e);
  }
};

/**
 * Creates a map out of an array be choosing what property to key by
 * @param {object[]} array Array that will be converted into a map
 * @param {string} prop Name of property to key by
 * @return {object} The mapped array. Example:
 *     mapFromArray([{a:1,b:2}, {a:3,b:4}], 'a')
 *     returns {1: {a:1,b:2}, 3: {a:3,b:4}}
 */
const mapFromArray = (array, prop) => {
  var map = {};
  for (var i = 0; i < array.length; i++) {
    map[array[i][prop]] = array[i];
  }
  return map;
};

/**
 * @param {object[]} o old array of objects
 * @param {object[]} n new array of objects
 * @param {object} An object with changes
 */
const getArrayDelta = (o, n) => {
  var delta = {
    added: [],
    deleted: [],
    changed: [],
  };
  var mapO = mapFromArray(o, "_id");
  var mapN = mapFromArray(n, "_id");
  for (let id in mapO) {
    if (!Object.prototype.hasOwnProperty.call(mapN, id)) {
      delta.deleted.push(mapO[id]);
    } else if (!_.isEqual(mapN[id], mapO[id])) {
      delta.changed.push(mapN[id]);
    }
  }

  for (let id in mapN) {
    if (!Object.prototype.hasOwnProperty.call(mapO, id)) {
      delta.added.push(mapN[id]);
    }
  }
  return delta;
};

export const syncWithCloudData = async (data) => {
  const stagedLocal = (await db.getStaged({})).map((doc) => {
    // eslint-disable-next-line no-unused-vars
    const { _rev, ...newDoc } = doc;
    return newDoc;
  });
  const recordsLocal = (await db.getRecords({})).map((doc) => {
    // eslint-disable-next-line no-unused-vars
    const { _rev, ...newDoc } = doc;
    return newDoc;
  });
  const testsLocal = (await db.getTests()).map((doc) => {
    // eslint-disable-next-line no-unused-vars
    const { _rev, ...newDoc } = doc;
    return newDoc;
  });

  const stagedDelta = getArrayDelta(stagedLocal, data.staged);
  const recordsDelta = getArrayDelta(recordsLocal, data.records);
  const testsDelta = getArrayDelta(testsLocal, data.tests);

  stagedDelta.added.forEach(async (doc) => await db.addCloudStaged(doc, true));
  stagedDelta.changed.forEach(async (doc) => await db.updateStaged(doc, true));
  stagedDelta.deleted.forEach(
    async (doc) => await db.removeStaged(doc, null, true)
  );

  recordsDelta.added.forEach(async (doc) => await db.addCloudRecord(doc, true));
  recordsDelta.changed.forEach(async (doc) => await db.updateRecord(doc, true));
  recordsDelta.deleted.forEach(
    async (doc) => await db.removeRecord(doc, null, true)
  );

  testsDelta.added.forEach(async (doc) => await db.addTest(doc, true));
  testsDelta.changed.forEach(async (doc) => await db.updateTest(doc, true));
  testsDelta.deleted.forEach(async (doc) => await db.removeTest(doc._id, true));

  const templatesLocal = (await db.getTemplates()).map((doc) => {
    // eslint-disable-next-line no-unused-vars
    const { _rev, ...newDoc } = doc;
    return newDoc;
  });
  const templatesLocalMap = mapFromArray(templatesLocal, "_id");
  const templatesCloudMap = mapFromArray(data.templates, "_id");

  for (let organ in templatesCloudMap) {
    var templatesDelta;
    if (!templatesLocalMap[organ]) {
      db.addOrgan(organ, true);
      templatesDelta = getArrayDelta([], templatesCloudMap[organ].templates);
    } else {
      templatesDelta = getArrayDelta(
        templatesLocalMap[organ].templates,
        templatesCloudMap[organ].templates
      );
    }

    templatesDelta.added.forEach(
      async (doc) => await db.addCloudTemplate(organ, doc, true)
    );
    templatesDelta.changed.forEach(
      async (doc) => await db.updateTemplate(organ, doc, true)
    );
    templatesDelta.deleted.forEach(
      async (doc) => await db.removeTemplate(organ, doc._id)
    );
  }
};

export const syncFiles = async () => {
  const path = `${app.getPath("userData")}/files`;
  // eslint-disable-next-line no-unused-vars
  const filesArray = fs
    .readdirSync(path)
    .filter((file) => fs.lstatSync(path + file).isFile());
  // console.log(filesArray);
};

const syncWithFirebase = async () => {
  const queue = await getSyncQueue();
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
  await dequeueItem();
  await syncWithFirebase();
});

ipcMain.on("firebase-pull", async (event, data) => {
  await syncWithCloudData(data);
  win.webContents.send("sync-complete");
});
