import { app } from "electron";
import * as db from "./db.js";
var PouchDB = require("pouchdb-node");
var _ = require("lodash");

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
      console.log(e);
    }
  }

  syncQueue.queue.push(syncObject);

  try {
    await syncDB.put(syncQueue);
  } catch (e) {
    console.log(e);
  }
};

export const getSyncQueue = async () => {
  try {
    const queueDoc = await syncDB.get("syncQueue");
    return queueDoc.queue;
  } catch (e) {
    console.log(e);
  }
};

export const dequeueItem = async () => {
  try {
    const queueDoc = await syncDB.get("syncQueue");
    queueDoc.queue.shift();
    try {
      await syncDB.put(queueDoc);
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    console.log(e);
  }
};

export const printDB = async () => {
  syncDB.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      console.log(result.rows[i].doc);
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
  // console.log("data", data);
  for (const dbName in data) {
    let localData;

    if (dbName == "staged") {
      localData = await db.getStaged({});
    } else if (dbName == "records") {
      localData = await db.getRecords({});
    } else if (dbName == "tests") {
      localData = await db.getTests();
    } else {
      localData = await db.getTemplates();
    }

    localData = localData.map((doc) => {
      // eslint-disable-next-line no-unused-vars
      const { _rev, ...newDoc } = doc;
      return newDoc;
    });

    // console.log("localdata", localData);
    // console.log("cloud data", data[dbName]);
    const delta = getArrayDelta(localData, data[dbName]);
    console.log(delta);

    // delta["added"].forEach(async (doc) => {
    //   switch (dbName) {
    //     case "staged":
    //       await db.addStaged(doc);
    //       break;
    //     case "records":
    //       await db.addRecord(doc);
    //       break;
    //     case "tests":
    //       await db.addTest(doc);
    //       break;
    //     case "templates":
    //       await db.addTemplate(doc);
    //       break;
    //   }
    // })
  }
};
