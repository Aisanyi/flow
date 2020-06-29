module.exports = {
    chainWebpack: config => {
      config.module
        .rule("snapsvg")
        .test(require.resolve("snapsvg"))
        .use("imports-loader?this=>window,fix=>module.exports=0")
        .loader("imports-loader")
        .end();
    }
  };