const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OOASchema = new Schema({
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

  dungeons: {
    type: Boolean,
    default: false,
  },
  
  spoiler: {
    type: Object,
    required: true
  },

  locked: {
    type: Boolean,
    default: false,
  },

  // seconds since epoch
  genTime: {
    type: Number,
    default: Math.floor((new Date).valueOf()/1000),
  },

  timeout: {
    type: Number,
    default: 14400,
  },

  unlockTime: {
    type: Number,
    default: 0,
  },

  unlockCode: {
    type: String,
  },

  base: {
    type: Schema.Types.ObjectId,
    ref: 'bases'
  },
});

module.exports = mongoose.model('ooas', OOASchema);