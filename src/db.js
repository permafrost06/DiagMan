import { app } from "electron";
import * as sync from "./sync.js";
import { copyFile } from "fs/promises";

const log = require("electron-log");

var PouchDB = require("pouchdb-node");

var stagedDB = new PouchDB(`${app.getPath("userData")}/staged.db`);
var db = new PouchDB(`${app.getPath("userData")}/records.db`);
var tests = new PouchDB(`${app.getPath("userData")}/tests.db`);
var templates = new PouchDB(`${app.getPath("userData")}/templates.db`);

// get functions
export const getStaged = async (options, filter) => {
  options.include_docs = true;

  const query = await stagedDB.allDocs(options);

  if (query.rows && query.rows.length) {
    const allRecords = query.rows.map(({ doc }) => doc);

    if (filter) {
      return allRecords
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
        });
    } else {
      return allRecords;
    }
  } else {
    return [];
  }
};

export const getRecords = async (options, filter) => {
  options.include_docs = true;

  const query = await db.allDocs(options);

  if (query.rows && query.rows.length) {
    const allRecords = query.rows.map(({ doc }) => doc);

    if (filter) {
      return allRecords
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
      return allRecords;
    }
  } else {
    return [];
  }
};

export const getTests = async () => {
  var allTests;
  try {
    const result = await tests.allDocs({ include_docs: true });
    allTests = result.rows.map(({ doc }) => doc);
  } catch (error) {
    log.error("db.js: getTests failed", error);
    allTests = [];
  }
  return allTests;
};

export const getTemplates = async () => {
  var allTemplates;
  try {
    const result = await templates.allDocs({ include_docs: true });
    allTemplates = result.rows.map(({ doc }) => doc);
  } catch (error) {
    log.error("db.js: getTemplates failed", error);
    allTemplates = [];
  }
  return allTemplates;
};

// add functions
export const addStaged = async (record, skip_queue) => {
  // let now = new Date();

  // record._id = record.type == "cyto" ? "CYT" : "HIS";

  // record._id +=
  //   now
  //     .getFullYear()
  //     .toString()
  //     .substr(-2) +
  //   (now.getMonth() + 1).toString().padStart(2, "0") +
  //   now
  //     .getDate()
  //     .toString()
  //     .padStart(2, "0") +
  //   now
  //     .getHours()
  //     .toString()
  //     .padStart(2, "0") +
  //   now
  //     .getMinutes()
  //     .toString()
  //     .padStart(2, "0") +
  //   now
  //     .getSeconds()
  //     .toString()
  //     .padStart(2, "0");

  record.tests = JSON.parse(record.tests);
  record.files = JSON.parse(record.files);

  const newFiles = [];

  for (let i = 0; i < record.files.length; i++) {
    const newFile = `${app.getPath("userData")}/files/${record._id}-${String(
      i
    ).padStart(2, "0")}.${record.files[i].split(".").pop()}`;

    newFiles.push(newFile);

    try {
      await copyFile(record.files[i], newFile);
    } catch (e) {
      log.error("db.js: file copying error", e);
    }
  }

  record.files = newFiles;
  // log.debug(record.files);

  try {
    await stagedDB.put(record);
  } catch (error) {
    log.error("db.js: addStaged failed - pouchdb error", error);
    return;
  }

  if (!skip_queue) {
    try {
      const recordFromDB = await stagedDB.get(record._id);
      sync.queueRecordSync({
        db: "staged",
        type: "add",
        object: recordFromDB,
      });
    } catch (e) {
      log.error("db.js: addStaged - error adding to sync queue", e);
    }
  }
};

export const addCloudStaged = async (record) => {
  try {
    await stagedDB.put(record);
  } catch (error) {
    log.error("db.js: addCloudStaged failed", error);
    return;
  }
};

export const addRecord = async (record, skip_queue) => {
  record.tests = JSON.parse(record.tests);
  record.files = JSON.parse(record.files);

  try {
    await db.put(record);
  } catch (error) {
    log.error("db.js: addRecord failed - pouchdb error", error);
    return;
  }

  if (!skip_queue) {
    try {
      const recordFromDB = await db.get(record._id);
      sync.queueRecordSync({
        db: "records",
        type: "add",
        object: recordFromDB,
      });

      const stagedRecord = await stagedDB.get(record._id);
      removeStaged(stagedRecord._id, stagedRecord._rev);
    } catch (e) {
      log.error("db.js: addRecord failed - error adding to sync queue", e);
    }
  }
};

export const addCloudRecord = async (record) => {
  try {
    await db.put(record);
  } catch (error) {
    log.error("db.js: addCloudRecord failed", error);
    return;
  }
};

export const addTest = async (test, skip_queue) => {
  try {
    await tests.put(test);
  } catch (error) {
    log.error("db.js: addTest failed - pouchdb error", error);
    return;
  }

  if (!skip_queue) {
    try {
      const recordFromDB = await tests.get(test._id);
      sync.queueRecordSync({
        db: "tests",
        type: "add",
        object: recordFromDB,
      });
    } catch (e) {
      log.error("db.js: addTest failed - error adding to sync queue", e);
    }
  }

  return test._id;
};

export const addOrgan = async (organ, skip_queue) => {
  const organObj = {
    _id: organ.toLowerCase(),
    organName: organ,
    templates: [],
  };

  try {
    await templates.put(organObj);
  } catch (error) {
    log.error("db.js: addOrgan failed - pouchdb error", error);
    return;
  }

  if (!skip_queue) {
    try {
      const recordFromDB = await templates.get(organObj._id);
      sync.queueRecordSync({
        db: "templates",
        type: "add",
        object: recordFromDB,
      });
    } catch (e) {
      log.error("db.js: addOrgan failed - error adding to sync queue", e);
    }
  }
};

export const addCloudTemplate = async (organ, template) => {
  const currentOrgan = await templates.get(organ);

  currentOrgan.templates.push(template);

  try {
    templates.put(currentOrgan);
  } catch (error) {
    log.error("db.js: addCloudTemplate failed", error);
  }
};

export const addTemplate = async (organ, template, skip_queue) => {
  const currentOrgan = await templates.get(organ);

  template._id = Math.random()
    .toString(36)
    .substr(2, 9);
  currentOrgan.templates.push(template);

  try {
    templates.put(currentOrgan);
  } catch (error) {
    log.error("db.js: addTemplate failed - pouchdb error", error);
    return;
  }

  if (!skip_queue) {
    try {
      const recordFromDB = await templates.get(currentOrgan._id);
      sync.queueRecordSync({
        db: "templates",
        type: "update",
        object: recordFromDB,
      });
    } catch (e) {
      log.error("db.js: addTemplate failed - error adding to sync queue", e);
    }
  }
};

// update functions
export const updateStaged = async (record, skip_queue) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await stagedDB.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      log.error("db.js: updateStaged failed - couldn't get old record", error);
      return;
    }
  };

  record._rev = await getRev(record._id);

  try {
    await stagedDB.put(record);
  } catch (error) {
    log.error("db.js: updateStaged failed - couldn't update record", error);
  }

  if (!skip_queue) {
    try {
      const recordFromDB = await stagedDB.get(record._id);
      sync.queueRecordSync({
        db: "staged",
        type: "update",
        object: recordFromDB,
      });
    } catch (e) {
      log.error("db.js: updateStaged failed - error adding to sync queue", e);
    }
  }
};

export const updateRecord = async (record, skip_queue) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await db.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      log.error("db.js: updateRecord failed - getRev error", error);
      return;
    }
  };

  record._rev = await getRev(record._id);

  if (!skip_queue) {
    record.tests = JSON.parse(record.tests);
  }

  try {
    await db.put(record);
  } catch (error) {
    log.error("db.js: updateRecord failed - pouchdb error", error);
  }

  if (!skip_queue) {
    try {
      const recordFromDB = await db.get(record._id);
      sync.queueRecordSync({
        db: "records",
        type: "update",
        object: recordFromDB,
      });
    } catch (e) {
      log.error("db.js: updateRecord failed - error adding to sync queue", e);
    }
  }
};

export const updateTest = async (test, skip_queue) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await tests.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      log.error("db.js: updateTest failed - getRev error", error);
      return;
    }
  };

  test._rev = await getRev(test._id);

  try {
    await tests.put(test);
  } catch (error) {
    log.error("db.js: updateTest failed - pouchdb error", error);
  }

  if (!skip_queue) {
    try {
      const recordFromDB = await tests.get(test._id);
      sync.queueRecordSync({
        db: "tests",
        type: "update",
        object: recordFromDB,
      });
    } catch (e) {
      log.error("db.js: updateTest failed - error adding to sync queue", e);
    }
  }
};

export const updateTemplate = async (organ, template) => {
  const currentOrgan = await templates.get(organ);

  currentOrgan.templates = currentOrgan.templates.filter((temp) => {
    return temp._id != template._id;
  });

  currentOrgan.templates.push(template);

  try {
    templates.put(currentOrgan);
  } catch (error) {
    log.error("db.js: updateTemplate failed - pouchdb error", error);
  }

  try {
    const recordFromDB = await templates.get(currentOrgan._id);
    sync.queueRecordSync({
      db: "templates",
      type: "update",
      object: recordFromDB,
    });
  } catch (e) {
    log.error("db.js: updateTemplate failed - error adding to sync queue", e);
  }
};

// remove functions
export const removeStaged = async (id_doc, rev, skip_queue) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await stagedDB.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      log.error("db.js: removeStaged failed - getRev failed", error);
      return;
    }
  };

  let record;

  if (rev) {
    try {
      record = await stagedDB.get(id_doc);
    } catch (e) {
      log.error("db.js: removeStaged failed - error getting staged record", e);
    }

    try {
      stagedDB.remove(id_doc, rev);
    } catch (e) {
      log.error(
        "db.js: removeStaged failed - error removing record using _rev",
        e
      );
      return;
    }
  } else {
    record = id_doc;
    try {
      stagedDB.remove(id_doc._id, await getRev(id_doc._id));
    } catch (e) {
      log.error(
        "db.js: removeStaged failed - error removing record using whole record",
        e
      );
      return;
    }
  }

  if (!skip_queue) {
    sync.queueRecordSync({
      db: "staged",
      type: "remove",
      object: record,
    });
  }
};

export const removeRecord = async (id_doc, rev, skip_queue) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await db.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      log.error("db.js: removeRecord failed - getRev error", error);
      return;
    }
  };

  let record;

  if (rev) {
    try {
      record = await db.get(id_doc);
    } catch (e) {
      log.error("db.js: removeRecord failed - error getting record", e);
    }

    try {
      db.remove(id_doc, rev);
    } catch (e) {
      log.error(
        "db.js: removeRecord failed - error removing record using _rev",
        e
      );
      return;
    }
  } else {
    record = id_doc;
    try {
      db.remove(id_doc._id, await getRev(id_doc._id));
    } catch (e) {
      log.error(
        "db.js: removeRecord failed - error removing record with manual getRev",
        e
      );
      return;
    }
  }

  if (!skip_queue) {
    sync.queueRecordSync({
      db: "records",
      type: "remove",
      object: record,
    });
  }
};

export const removeTest = async (id, skip_queue) => {
  try {
    let test = await tests.get(id);
    try {
      tests.remove(test);
    } catch (error) {
      log.error("db.js: removeTest failed - pouchdb error", error);
      return;
    }

    if (!skip_queue) {
      sync.queueRecordSync({
        db: "tests",
        type: "remove",
        object: test,
      });
    }
  } catch (error) {
    log.error("db.js: removeTest failed - error adding to sync queue", error);
  }
};

export const removeTemplate = async (organ, templateID, skip_queue) => {
  const currentOrgan = await templates.get(organ);

  currentOrgan.templates = currentOrgan.templates.filter((temp) => {
    return temp._id != templateID;
  });

  try {
    templates.put(currentOrgan);
  } catch (error) {
    log.error(
      "db.js: removeTemplate failed - error updating/removing organ/template",
      error
    );
    return;
  }

  if (!skip_queue) {
    try {
      const recordFromDB = await templates.get(currentOrgan._id);
      sync.queueRecordSync({
        db: "templates",
        type: "update",
        object: recordFromDB,
      });
    } catch (e) {
      log.error("db.js: removeTemplate failed - error adding to sync queue", e);
    }
  }
};
