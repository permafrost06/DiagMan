import { app } from "electron";
import * as sync from "./sync.js";

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
    console.log(error);
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
    console.log(error);
    allTemplates = [];
  }
  return allTemplates;
};

// add functions
export const addStaged = async (record) => {
  let now = new Date();

  record._id = record.type == "cyto" ? "CYT" : "HIS";

  record._id +=
    now
      .getFullYear()
      .toString()
      .substr(-2) +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now
      .getDate()
      .toString()
      .padStart(2, "0") +
    now
      .getHours()
      .toString()
      .padStart(2, "0") +
    now
      .getMinutes()
      .toString()
      .padStart(2, "0") +
    now
      .getSeconds()
      .toString()
      .padStart(2, "0");

  record.tests = JSON.parse(record.tests);

  try {
    await stagedDB.put(record);
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    const recordFromDB = await stagedDB.get(record._id);
    sync.queueRecordSync({
      db: "staged",
      type: "add",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
  }
};

export const addRecord = async (record) => {
  try {
    await db.put(record);
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    const recordFromDB = await db.get(record._id);
    sync.queueRecordSync({
      db: "records",
      type: "add",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
  }

  const stagedRecord = await stagedDB.get(record._id);
  removeStaged(stagedRecord._id, stagedRecord._rev);
};

export const addTest = async (test) => {
  try {
    await tests.put(test);
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    const recordFromDB = await tests.get(test._id);
    sync.queueRecordSync({
      db: "tests",
      type: "add",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
  }
};

export const addOrgan = async (organ) => {
  const organObj = {
    _id: organ.toLowerCase(),
    organName: organ,
    templates: [],
  };

  try {
    await templates.put(organObj);
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    const recordFromDB = await templates.get(organObj._id);
    sync.queueRecordSync({
      db: "templates",
      type: "add",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
  }
};

export const addTemplate = async (organ, template) => {
  const currentOrgan = await templates.get(organ);

  template._id = Math.random()
    .toString(36)
    .substr(2, 9);
  currentOrgan.templates.push(template);

  try {
    templates.put(currentOrgan);
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    const recordFromDB = await templates.get(currentOrgan._id);
    sync.queueRecordSync({
      db: "templates",
      type: "update",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
  }
};

// update functions
export const updateStaged = async (record) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await stagedDB.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  record._rev = await getRev(record._id);

  try {
    await stagedDB.put(record);
  } catch (error) {
    console.log(error);
  }

  try {
    const recordFromDB = await stagedDB.get(record._id);
    sync.queueRecordSync({
      db: "staged",
      type: "update",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
  }
};

export const updateRecord = async (record) => {
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

  try {
    const recordFromDB = await db.get(record._id);
    sync.queueRecordSync({
      db: "records",
      type: "update",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
  }
};

export const updateTest = async (test) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await tests.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  test._rev = await getRev(test._id);

  try {
    await tests.put(test);
  } catch (error) {
    console.log(error);
  }

  try {
    const recordFromDB = await tests.get(test._id);
    sync.queueRecordSync({
      db: "tests",
      type: "update",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
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
    console.log(error);
  }

  try {
    const recordFromDB = await templates.get(currentOrgan._id);
    sync.queueRecordSync({
      db: "templates",
      type: "update",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
  }
};

// remove functions
export const removeStaged = async (id_doc, rev) => {
  let record;

  if (rev) {
    try {
      record = await stagedDB.get(id_doc);
    } catch (e) {
      console.log(e);
    }

    try {
      stagedDB.remove(id_doc, rev);
    } catch (e) {
      console.log(e);
      return;
    }
  } else {
    record = id_doc;
    try {
      stagedDB.remove(id_doc);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  sync.queueRecordSync({
    db: "staged",
    type: "remove",
    object: record,
  });
};

export const removeRecord = async (id_doc, rev) => {
  let record;

  if (rev) {
    try {
      record = await db.get(id_doc);
    } catch (e) {
      console.log(e);
    }

    try {
      db.remove(id_doc, rev);
    } catch (e) {
      console.log(e);
      return;
    }
  } else {
    record = id_doc;
    try {
      db.remove(id_doc);
    } catch (e) {
      console.log(e);
      return;
    }
  }

  sync.queueRecordSync({
    db: "records",
    type: "remove",
    object: record,
  });
};

export const removeTest = async (id) => {
  try {
    let test = await tests.get(id);
    try {
      tests.remove(test);
    } catch (error) {
      console.log(error);
      return;
    }

    sync.queueRecordSync({
      db: "tests",
      type: "remove",
      object: test,
    });
  } catch (error) {
    console.log(error);
  }
};

export const removeTemplate = async (organ, templateID) => {
  const currentOrgan = await templates.get(organ);

  currentOrgan.templates = currentOrgan.templates.filter((temp) => {
    return temp._id != templateID;
  });

  try {
    templates.put(currentOrgan);
  } catch (error) {
    console.log(error);
    return;
  }

  try {
    const recordFromDB = await templates.get(currentOrgan._id);
    sync.queueRecordSync({
      db: "templates",
      type: "update",
      object: recordFromDB,
    });
  } catch (e) {
    console.log("Adding to sync queue falied", e);
  }
};
