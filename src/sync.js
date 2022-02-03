import { app } from "electron";
import * as db from "./db.js";
var PouchDB = require("pouchdb-node");
var _ = require("lodash");
const fs = require("fs");

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
      await syncDB.put({
        _id: "syncQueue",
        queue: [],
      });

      try {
        syncQueue = await syncDB.get("syncQueue");
      } catch (error) {
        console.log("can't get sync queue", error);
      }
    } else {
      console.log("can't get sync queue", e);
    }
  }

  syncQueue.queue.push(syncObject);

  try {
    await syncDB.put(syncQueue);
  } catch (e) {
    console.log("error updating sync queue", e);
  }
};

export const getSyncQueue = async () => {
  try {
    const queueDoc = await syncDB.get("syncQueue");
    return queueDoc.queue;
  } catch (e) {
    console.log("can't get sync queue", e);
  }
};

export const dequeueItem = async () => {
  try {
    const queueDoc = await syncDB.get("syncQueue");
    queueDoc.queue.shift();
    try {
      await syncDB.put(queueDoc);
    } catch (e) {
      console.log("dequeue failed", e);
    }
  } catch (e) {
    console.log("can't get sync queue", e);
  }
};

export const isQueueEmpty = async () => {
  try {
    const queueDoc = await syncDB.get("syncQueue");
    if (queueDoc.queue.length > 0) return false;
    else return true;
  } catch (e) {
    console.log("error getting syncQueue", e);
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
  // const templatesDelta = getArrayDelta(templatesLocal, data.templates);

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

  // templatesDelta.added.forEach(async (doc) => await db.addTemplate(doc, true));
  // templatesDelta.changed.forEach(async (doc) => await db.updateTemplate(doc, true));
  // templatesDelta.deleted.forEach(async (doc) => await db.removeTemplate(doc._id, true));
};

export const syncFiles = async () => {
  const path = `${app.getPath("userData")}/files`;
  const filesArray = fs
    .readdirSync(path)
    .filter((file) => fs.lstatSync(path + file).isFile());
  // console.log(filesArray);
};
