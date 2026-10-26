// Metro bundler config. The app shares plain JavaScript modules with the website
// (../src: default content, coupon rules, formatting, the settings editor's sections),
// so Metro also watches that folder. Import them as "@shared/...".
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
config.watchFolders = [path.resolve(__dirname, "../src")];

module.exports = config;
