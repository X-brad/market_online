const mongoose = require('mongoose')

const SettingsSchema = new mongoose.Schema({
  unitePrixStandardVendeuse: { type: Number, default: 500 },
  unitePrixStandardNonVendeuse: { type: Number, default: 600 },
  unitePrixPremiumVendeuse: { type: Number, default: 1000 },
  unitePrixPremiumNonVendeuse: { type: Number, default: 600 },
  quotaStandard: { type: Number, default: 10 },
  quotaPremium: { type: Number, default: 15 },
  fraisService: { type: Number, default: 200 },
  prixPremiumClient: { type: Number, default: 2000 },
  dureePremiumJours: { type: Number, default: 30 }
}, { timestamps: true })

async function getSettings() {
  const Settings = mongoose.model('Settings')
  let settings = await Settings.findOne()
  if (!settings) settings = await Settings.create({})
  return settings
}

SettingsSchema.statics.getSettings = getSettings

module.exports = mongoose.model('Settings', SettingsSchema)
