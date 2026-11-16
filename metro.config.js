const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer/expo"
);
config.resolver.assetExts = config.resolver.assetExts.filter(
  (extension) => extension !== "svg"
);
config.resolver.assetExts.push("bin");
config.resolver.assetExts.push("wasm");
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-linear-gradient") {
    return context.resolveRequest(
      context,
      require.resolve("./components/LinearGradient.web.tsx"),
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
