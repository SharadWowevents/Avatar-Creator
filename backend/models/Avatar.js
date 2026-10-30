const mongoose = require('mongoose');

const SingleAvatarSchema = new mongoose.Schema({
  characterName: { type: String, required: true },
  animal: { type: String, required: true },
  emoji: { type: String, default: '🐾' },
  tagline: { type: String, default: '' },
  whyAnimal: { type: String, default: '' },
  currentState: { type: String, default: '' },
  desiredState: { type: String, default: '' },
  stage: { type: String, default: '' },
  painPoints: [{ type: String }],
  wants: [{ type: String }],
  buyingBehaviour: [{ type: String }],
  language: [{ type: String }],
  nextSteps: [{ type: String }],
}, { _id: false });

const JourneyStepSchema = new mongoose.Schema({
  tag: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const BridgeSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  lifeboatOffer: { type: String, required: true },
  yachtOffer: { type: String, required: true },
  journey: [JourneyStepSchema],
  message: { type: String, default: '' },
}, { _id: false });

const AvatarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Untitled Avatar Dossier',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  inputs: {
    intro: { type: String, required: true },
    icp: { type: String, required: true },
    life: { type: String, required: true },
    yacht: { type: String, required: true },
    both: { type: String, default: '' },
  },
  output: {
    lifeboat: { type: SingleAvatarSchema, required: true },
    yacht: { type: SingleAvatarSchema, required: true },
    bridge: { type: BridgeSchema, required: true },
  },
  isExample: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

AvatarSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (next) next();
});

module.exports = mongoose.model('Avatar', AvatarSchema);

