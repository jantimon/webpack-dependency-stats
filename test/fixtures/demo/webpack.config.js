module.exports = {
  context: __dirname,
  entry: ['./entry.js', './another-entry.js'],
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.html$/,
      loader: 'html-loader'
    }]
  }
};
