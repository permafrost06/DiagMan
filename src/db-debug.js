import jsonData from "./components/records.js";
import { app } from "electron";

var PouchDB = require("pouchdb-node");

var stagedDB = new PouchDB(`${app.getPath("userData")}/staged.db`);
var db = new PouchDB(`${app.getPath("userData")}/records.db`);
var tests = new PouchDB(`${app.getPath("userData")}/tests.db`);
var templates = new PouchDB(`${app.getPath("userData")}/templates.db`);

// seed functions
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

export const seedRecords = () => {
  for (let i = 0; i < jsonData.length; i++) {
    db.put(jsonData[i]).catch((error) => {
      console.log(error);
    });
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

export const seedTemplates = async () => {
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

  await templates.allDocs({ include_docs: true }).then((result) => {
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

// print functions
export const printRecords = () => {
  db.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      console.log(result.rows[i].doc);
    }
  });
};

export const printTemps = async () => {
  templates.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      console.log(result.rows[i].doc);
    }
  });
};

// clear functions
export const clearStaged = () => {
  stagedDB.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      stagedDB.remove(result.rows[i].doc);
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
