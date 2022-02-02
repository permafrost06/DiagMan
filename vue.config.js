module.exports = {
  pluginOptions: {
    electronBuilder: {
      externals: ["pouchdb-node"],
      preload: "src/preload.js",
      nodeIntegration: true,
      builderOptions: {
        publish: ["github"],
        appId: "com.finalconcept.caseDB",
        nsis: {
          oneClick: false,
          createDesktopShortcut: true,
          perMachine: true,
        },
      },
    },
  },
};
