process.env.TEST = true;
process.env.NODE_ENV = 'test';

const webpack = require("webpack");
const path = require("path");
const webpackConfig = require('./webpack.config.js')({ production: false, karma: true });

delete webpackConfig.entry;

module.exports = function(config) {

  var configuration = {
    basePath: "",
    frameworks: [
      "mocha",
      "chai",
      "sinon",
      "es6-shim"
    ],
    files: [
      { pattern: "node_modules/reflect-metadata/Reflect.js", include: true },
      { pattern: "node_modules/phaser-ce/build/phaser.js", include: true },
      { pattern: "./test/**/**/**.test.ts", include: true },
      { pattern: '**/*.map', served: true, included: false, watched: true }
    ],
    preprocessors: {
      "./**/**/**/**.ts": ["sourcemap"],
      "./test/**/**/**.test.ts": ["webpack"]
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },
    plugins: [
      "karma-webpack",
      "karma-sourcemap-writer",
      "karma-sourcemap-loader",
      "karma-mocha-reporter",
      "karma-mocha",
      "karma-chai",
      "karma-sinon",
      "karma-es6-shim",
      "karma-remap-istanbul",
      "karma-coverage-istanbul-reporter"
    ],
    reporters: (
      config.singleRun ?
        ["dots", "mocha", "coverage-istanbul"] :
        ["dots", "mocha"]
    ),
    coverageIstanbulReporter: {
      reports: ["html", "lcov", "lcovonly", "text-summary"],
      dir: "coverage",
      fixWebpackSourcePaths: true,
      "report-config": {
        html: {
          subdir: "html-report"
        }
      }
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: []
  };

  if (process.env.TRAVIS) {
    configuration.browsers = ['PhantomJS'];
    configuration.plugins.push("karma-phantomjs-launcher");
  } else {
    configuration.browsers = ['PhantomJS'];
    configuration.plugins.push("karma-phantomjs-launcher");
  }

  config.set(configuration);
};
