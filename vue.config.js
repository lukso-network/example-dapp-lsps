const webpack = require("webpack");
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process/browser",
      }),
    ],
    resolve: {
      fallback: {
        assert: false,
        buffer: require.resolve("buffer"),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        url: require.resolve("url/"),
        os: require.resolve("os-browserify/browser"),
      },
    },
  },
});
