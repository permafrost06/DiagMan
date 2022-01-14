import { app } from "electron";
var PouchDB = require("pouchdb-node");

var syncDB = new PouchDB(`${app.getPath("userData")}/syncs.db`);

export const queueRecordSync = async (syncObject) => {
  let syncQueue;

  try {
    syncQueue = await syncDB.get("syncQueue");
  } catch (e) {
    if (e.reason == "missing") {
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
