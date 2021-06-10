module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      nodeIntegration: true,
      builderOptions: {
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
