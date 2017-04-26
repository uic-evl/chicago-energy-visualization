const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/chicago_energy_2010');

module.exports = { mongoose };