import jsonData from "./components/records.js";
import { app } from "electron";
var PouchDB = require("pouchdb-node");

var db = new PouchDB(`${app.getPath("userData")}/records.db`);
var stagedDB = new PouchDB(`${app.getPath("userData")}/staged.db`);
var tests = new PouchDB(`${app.getPath("userData")}/tests.db`);

export const seedStaged = () => {
  try {
    stagedDB.bulkDocs([
      {
        _id: "00015",
        date: "06-01-2020",
        patientName: "Mrs Sumi Begum",
        age: "25 years",
        referer: "Prof. / Dr: Kamol Krisna Pramanik, MBBS, FCPS",
        specimen: "Right cervical lymph node",
      },
      {
        _id: "00016",
        date: "07-01-2020",
        patientName: "Mr Kalu Shah",
        age: "26 years",
        referer: "Prof. / Dr: CGH",
        specimen: "Left arm swelling",
      },
      {
        _id: "00017",
        date: "08-01-2020",
        patientName: "Mr Anisur Rahman",
        age: "28 years",
        referer: "Prof. / Dr: Rokeya Begum, MBBS, FCPS, MS",
        specimen: "Both testes for spermatogenesis",
      },
      {
        _id: "00018",
        date: "08-01-2020",
        patientName: "Mr Sujit Sinha",
        age: "41 years",
        referer: "Prof. / Dr: Rokeya Begum, MBBS, FCPS, MS",
        specimen: "Both testes for spermatogenesis",
      },
      {
        _id: "00019",
        date: "08-01-2020",
        patientName: "Md Rashed",
        age: "31 years",
        referer: "Prof. / Dr: Pratik Chowdhury, MBBS, FCPS",
        specimen:
          "Right axillary swelling (USG guided FNA)USG guide: Professor Dr. Subash Mazumder, MBBS, BCS, MD : Professor & Head, R&I Dept, CMCH",
      },
      {
        _id: "00020",
        date: "08-01-2020",
        patientName: "Mr Tobiullah Mollah",
        age: "60 years",
        referer: "Prof. / Dr: Md Jashim Uddin, MBBS, FCPS(Medicine)",
        specimen:
          "Hepatic mass (USG guided)USG guide: Professor Dr. Subash Mazumder, MBBS, BCS, MD: Professor & Head, R&I Dept, CMCH",
      },
      {
        _id: "00021",
        date: "09-01-2020",
        patientName: "Mrs Minu",
        age: "29 years",
        referer: "Prof. / Dr: CGH",
        specimen: "Right breast lump",
      },
    ]);
  } catch (error) {
    console.log(error);
  }
};

export const initTests = () => {
  const tempTests = [
    {
      _id: "0001",
      name: "CT Scan - Brain Plain",
      cost: 4000,
    },
    {
      _id: "0002",
      name: "CT Scan - Chest",
      cost: 6000,
    },
    {
      _id: "0003",
      name: "Urine R/M/E",
      cost: 250,
    },
    {
      _id: "0004",
      name: "AST (SGOT) Blood",
      cost: 300,
    },
    {
      _id: "0005",
      name: "ALT (SGPT) Blood",
      cost: 300,
    },
    {
      _id: "0006",
      name: "Bilirubin Serum",
      cost: 200,
    },
    {
      _id: "0007",
      name: "Creatinine Serum",
      cost: 400,
    },
  ];

  tests.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      tests.remove(result.rows[i].doc);
    }
  });

  for (let i = 0; i <= tempTests.length; i++) {
    try {
      tests.put(tempTests[i]);
    } catch (error) {
      console.log(error);
    }
  }
};

export const seedDatabase = () => {
  for (let i = 0; i < jsonData.length; i++) {
    db.put(jsonData[i]).catch((error) => {
      console.log(error);
    });
  }
};

export const printDB = () => {
  db.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      console.log(result.rows[i].doc);
    }
  });
};

export const clearDB = () => {
  db.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      db.remove(result.rows[i].doc);
    }
  });
};

export const clearStaged = () => {
  stagedDB.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      stagedDB.remove(result.rows[i].doc);
    }
  });
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
};

export const addRecord = async (record) => {
  try {
    await db.put(record);
  } catch (error) {
    console.log(error);
  }

  const stagedRecord = await stagedDB.get(record._id);
  stagedDB.remove(stagedRecord._id, stagedRecord._rev);
};

export const addTest = async (test) => {
  try {
    await tests.put(test);
  } catch (error) {
    console.log(error);
  }
};

export const removeTest = async (id) => {
  try {
    var test = await tests.get(id);
    try {
      tests.remove(test);
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};

export const addStaged = async (record) => {
  const stagedRecords = await getStaged({});
  const finalRecords = await getRecords({});
  var records;

  if (finalRecords.length) {
    if (stagedRecords.length) {
      records =
        stagedRecords[stagedRecords.length - 1]._id >
        finalRecords[finalRecords.length - 1]._id
          ? stagedRecords
          : finalRecords;
    } else {
      records = finalRecords;
    }
  } else {
    records = stagedRecords;
  }

  record._id = records.length
    ? String(Number(records[records.length - 1]._id) + 1).padStart(5, "0")
    : "00001";

  record.tests = JSON.parse(record.tests);

  try {
    await stagedDB.put(record);
  } catch (error) {
    console.log(error);
  }
};

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
