module.exports = {
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.output.publicPath = '/llama-decoder/';
    } else {
      // mutate for development...
    }
  },
};
