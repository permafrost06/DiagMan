import jsonData from "./components/records.js";
import { app } from "electron";
var PouchDB = require("pouchdb-node");

var db = new PouchDB(`${app.getPath("userData")}/records.db`);
var stagedDB = new PouchDB(`${app.getPath("userData")}/staged.db`);
var tests = new PouchDB(`${app.getPath("userData")}/tests.db`);
var templates = new PouchDB(`${app.getPath("userData")}/templates.db`);

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

export const seedTemplates = () => {
  const temps = [
    {
      _id: "parotid",
      organName: "Parotid",
      templates: [
        {
          _id: "0001",
          name: "Left Parotid Swelling",
          aspNote: "On aspiration blood mixed material came out.",
          me:
            "Smears showed cellular material composed of many scattered and clusters of benign ductal epithelial cells along with lymphocytes and histiocytes, in the background of scanty blood. No epithelioid or malignant cell was seen.",
          impression: "Left parotid swelling(FNA): Sialadenitis",
        },
        {
          _id: "0002",
          name: "Right parotid swelling",
          aspNote: "On aspiration, 0.5 ml pus like material came out.",
          me:
            "Smear showed numerous neutrophils, lymphocytes in the background of necrosis. No epithelioid or malignant cell was seen.",
          impression: "Right parotid swelling (FNA): Suppurative inflammation",
        },
      ],
    },
    {
      _id: "lymph",
      organName: "Lymph",
      templates: [
        {
          _id: "0001",
          name: "Left cervical lymph nodes",
          aspNote: "On aspiration, blood mixed cellular material came out.",
          me:
            "Smear showed cellular material composed of polymorphous population of lymphoid cells along cells with much enlarged nucleus with prominent nucleoli often they were binucleated in the background of scanty blood. No epithelioid cell was seen.",
          impression: "Left cervical lymph nodes(FNA)",
        },
        {
          _id: "0002",
          name: "Right cervical lymph nodes",
          aspNote: "On aspiration, caseous necrotic material came out.",
          me:
            "Smear showed many scattered and aggregates of epithelioid cells along with histiocytes, lymphocytes in the background of caseation necrosis. No malignant cell was seen.",
          impression:
            "Right cervical lymph nodes(FNA):Caseating granuloma Suggestive of Tuberculosis",
        },
        {
          _id: "0003",
          name: "Left cervical lymph node",
          aspNote: "On aspiration necrotic cellular material came out.",
          me:
            "Smears showed cellular material composed of many scattered and small to large clusters of spindle to polygonal malignant squamous epithelial cells with pleomorphic, enlarged and hyperchromatic nucleus in the background of necrosis and plenty of acute inflammatory cells and lymphocytes.",
          impression:
            "Left cervical lymph node (FNA): Metastatic squamous cell carcinoma",
        },
      ],
    },
    {
      _id: "forearm",
      organName: "Forearm",
      templates: [
        {
          _id: "0001",
          name: "Right forearm swelling",
          aspNote: "On aspiration blood mixed material came out.",
          me:
            "Smears showed few clusters of benign fibroblasts, adipocytes along with many lymphocytes in a background of blood. No epithelioid or malignant cell was seen.",
          impression:
            "Right forearm swellinlling(FNA):Benign mesenchymal lesion",
        },
      ],
    },
  ];

  templates.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      templates.remove(result.rows[i].doc);
    }
  });

  try {
    templates.bulkDocs(temps);
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

export const printTemps = async () => {
  templates.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      console.log(result.rows[i].doc);
    }
  });
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
  let now = new Date();
  record._id =
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
  }
};

export const addOrgan = async (organ) => {
  try {
    await templates.put({
      _id: organ.toLowerCase(),
      organName: organ,
      templates: [],
    });
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
