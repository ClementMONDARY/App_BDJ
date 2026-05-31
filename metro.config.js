const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "./Profiler" &&
    context.originModulePath.includes("react-native-calendars")
  ) {
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "shims/CalendarsProfiler.js"),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
