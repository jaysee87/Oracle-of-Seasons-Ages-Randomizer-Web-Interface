const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OOSSchema = new Schema({
  seed: {
    type: String,
    required: true
  },

  baseSeed: {
    type: String,
    required: true
  },
  
  patchData: {
    type: Array,
    required: true
  },

  hard: {
    type: Boolean,
    default: false
  },

  treewarp: {
    type: Boolean,
    default: false
  },

  base: {
    type: Schema.Types.ObjectId,
    ref: 'bases'
  },
});

module.exports = mongoose.model('ooss', OOSSchema);