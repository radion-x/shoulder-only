const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  addressLine1: String,
  addressLine2: String,
  suburb: String,
  state: String,
  postcode: String,
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
  consent: Boolean,
  diagnoses: {
    // Hip Diagnoses
    hipOsteoarthritis: Boolean,
    hipRheumatoidArthritis: Boolean,
    labralTear: Boolean,
    hipDysplasia: Boolean,
    femoroacetabularImpingement: Boolean,
    hipFracture: Boolean,
    trochantericBursitis: Boolean,
    avascularNecrosis: Boolean,
    glutealTendonTear: Boolean,
    snappingHipSyndrome: Boolean,
    otherHipConditionSelected: Boolean,
    otherHipCondition: String,
    // Symptom details
    mainSymptoms: String,
    symptomDuration: String,
    symptomProgression: String,
  },
  treatments: {
    overTheCounterMedication: Boolean,
    prescriptionAntiInflammatory: Boolean,
    prescriptionAntiInflammatoryName: String,
    prescriptionPainMedication: Boolean,
    prescriptionPainMedicationName: String,
    injections: Boolean,
    injectionTypes: [String], // Multiselect: Cortisone, PRP, Viscosupplementation
    radiofrequencyAblation: Boolean,
    physiotherapy: Boolean,
    chiropracticTreatment: Boolean,
    osteopathyMyotherapy: Boolean,
  },
  hadSurgery: Boolean,
  surgeries: [{ date: String, procedure: String, surgeon: String, hospital: String }],
  imaging: [{
    type: { type: String },
    hadStudy: Boolean,
    clinic: String,
    date: String,
    documentName: String,
    jointRegions: { 
      type: [String],
      default: [], // Empty array as default
      required: false // Allow the field to be missing/undefined and will be set to default []
    },
  }],
  imagingRecordsPermission: Boolean,
  painAreas: [{ id: String, region: String, intensity: Number, notes: String, coordinates: { x: Number, y: Number } }],
  redFlags: {
    fevers: { present: Boolean },
    unexplainedWeightLoss: { present: Boolean, period: String, amountKg: Number },
    nightPain: { present: Boolean },
    weakness: { present: Boolean, areas: mongoose.Schema.Types.Mixed },
    otherRedFlagPresent: Boolean,
    otherRedFlag: String,
  },
  demographics: {
    fullName: String,
    dateOfBirth: String,
    phoneNumber: String,
    email: String,
    residentialAddress: addressSchema,
    isPostalSameAsResidential: Boolean,
    postalAddress: addressSchema,
    funding: {
      source: String,
      healthFundName: String,
      membershipNumber: String,
      claimNumber: String,
      otherSource: String,
    },
    nextOfKin: {
      fullName: String,
      relationship: String,
      phoneNumber: String,
    },
    referringDoctor: {
      hasReferringDoctor: Boolean,
      doctorName: String,
      clinic: String,
      phoneNumber: String,
      email: String,
      fax: String,
      referralDocument: {
        id: String,
        filename: String,
        originalName: String,
        url: String,
        uploadDate: Date
      }
    },
    gender: String,
    medicareNumber: String,
    medicareRefNum: String,
    countryOfBirth: String,
  },
  aiSummary: String,
  treatmentGoals: String,
  painMapImageFront: { type: String },
  painMapImageBack: { type: String },
  nextStep: { type: String },
  recommendationText: { type: String },
  systemRecommendation: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

assessmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;
