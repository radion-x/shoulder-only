export interface PainArea {
  id: string; 
  region: string;
  intensity: number;
  notes?: string; // e.g., "View: front, RegionID: 1, Detail: Forehead/Face (Front)"
  coordinates?: { x: number; y: number }; 
}

export interface Surgery {
  date: string;
  procedure: string;
  surgeon: string;
  hospital: string;
}

export interface Imaging {
  type: 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'Bone Scan / SPECT';
  hadStudy: boolean;
  clinic?: string;
  date?: string;
  document?: File; // For the file input
  documentName?: string; // To store the path/name of the uploaded file from server
  jointRegions?: string[]; // Array of selected joint regions (Left Shoulder, Right Shoulder)
}

// New interface for a generic red flag item
export interface RedFlagSeverityItem {
  present: boolean; // Does the user experience this?
  severity?: number; // 1-10, for the slider. This will be moved to area-specific for some items.
}

// For symptoms like muscle weakness/numbness where multiple areas can be selected
export interface AreaSpecificSymptomDetail {
  selected: boolean;
  // severity?: number; // Severity for this specific area - REMOVED
}

export type MuscleWeaknessArea = 'Arms' | 'Legs' | 'Hands' | 'Feet' | 'Trunk/Core' | 'OtherMuscleArea';
export type NumbnessArea = 'Arms' | 'Legs' | 'Hands' | 'Feet' | 'Face' | 'Trunk/Body' | 'OtherNumbnessArea';
// Add other area types if needed, e.g., for bladder/saddle if they become multi-area with severity

export interface AreaSpecificSymptoms {
  [area: string]: AreaSpecificSymptomDetail; // e.g., "Arms": { selected: true, severity: 5 }
}

// Updated interface for a red flag item that might have area-specific details or a single detail list
export interface RedFlagDetailedItem extends RedFlagSeverityItem { // present is still top-level
  details?: string; // For single-select dropdowns (like Bladder/Saddle) - Changed to string
  areas?: AreaSpecificSymptoms; // For multi-checkbox with per-area severity (Muscle/Numbness)
  severity?: number; // Optional top-level severity for items NOT using 'areas' but needing severity (e.g. Bladder/Saddle if they had a slider)
  isNewOnset?: boolean; // Added for incontinence
}


// New interface for Unexplained Weight Loss
export interface RedFlagWeightLossItem {
  present: boolean;
  period?: string; // e.g., "last 3 months"
  amountKg?: number; 
}

// Interface for the "Red Flags" section - Simplified for Hip
export interface RedFlagsData {
  fevers: { present: boolean };
  unexplainedWeightLoss: RedFlagWeightLossItem;
  nightPain: { present: boolean };
  weakness: RedFlagDetailedItem;
  otherRedFlagPresent?: boolean;
  otherRedFlag?: string;
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  suburb: string;
  state: string;
  postcode: string;
}

export interface Funding {
  source: 'Private Health Insurance' | 'Workers Compensation' | 'DVA' | 'TAC' | 'Uninsured' | 'Other' | '';
  healthFundName?: string;
  membershipNumber?: string;
  claimNumber?: string;
  otherSource?: string;
}

export interface NextOfKin {
  fullName: string;
  relationship: string;
  phoneNumber: string;
}

export interface ReferralDocument {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  uploadDate: Date;
}

export interface ReferringDoctor {
  hasReferringDoctor: boolean | null;
  doctorName?: string;
  clinic?: string;
  phoneNumber?: string;
  email?: string;
  fax?: string;
  referralDocument?: ReferralDocument | null;
}

export interface Demographics {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  residentialAddress: Address;
  isPostalSameAsResidential: boolean;
  postalAddress?: Address;
  funding: Funding;
  nextOfKin: NextOfKin;
  referringDoctor: ReferringDoctor;
  gender?: string;
  medicareNumber?: string;
  medicareRefNum?: string; // New field for the number next to the name
  countryOfBirth?: string;
}

export interface FormData {
  // Step 1: Onboarding
  consent: boolean;

  // Step 2: Medical History - Shoulder Diagnoses
  diagnoses: {
    // Shoulder Diagnoses
    shoulderOsteoarthritis: boolean;
    shoulderRheumatoidArthritis: boolean;
    rotatorCuffTear: boolean;
    rotatorCuffTendinitis: boolean;
    frozenShoulder: boolean;
    shoulderInstability: boolean;
    labrumTear: boolean;
    acJointArthritis: boolean;
    shoulderImpingement: boolean;
    shoulderFracture: boolean;
    calcificTendinitis: boolean;
    bicepsTendinitis: boolean;
    otherShoulderConditionSelected?: boolean;
    otherShoulderCondition?: string;
    // Symptom details
    symptomDuration?: string; 
    symptomProgression?: 'Getting better' | 'Staying the same' | 'Getting worse' | ''; 
    mainSymptoms?: string;
  };

  // Step 3: Treatments & Surgery History
  treatments: {
    overTheCounterMedication: boolean;
    prescriptionAntiInflammatory: boolean;
    prescriptionAntiInflammatoryName?: string;
    prescriptionPainMedication: boolean;
    prescriptionPainMedicationName?: string;
    injections: boolean;
    injectionTypes?: string[]; // Multiselect: Cortisone, PRP, Viscosupplementation
    radiofrequencyAblation: boolean;
    physiotherapy: boolean;
    chiropracticTreatment: boolean;
    osteopathyMyotherapy: boolean;
  };
  hadSurgery: boolean;
  surgeries: Surgery[];

  // Step 4: Imaging History
  imaging: Imaging[];
  imagingRecordsPermission: boolean; // New field for permission

  // Step 5: Pain Mapping
  painAreas: PainArea[];
  // painDescription?: string; // This field will be REMOVED
  redFlags: RedFlagsData; // NEW field for Red Flags

  // Step 6: Demographics
  demographics: Demographics;

  // New field for treatment goals, from PainMappingStep
  treatmentGoals?: string;

  // New fields for pain map images
  formSessionId?: string;
  painMapImageFront?: string;
  painMapImageBack?: string;
  nextStep?: string;
  systemRecommendation?: string;
}

export const initialFormData: FormData = {
  consent: false,

  diagnoses: {
    // Shoulder Diagnoses
    shoulderOsteoarthritis: false,
    shoulderRheumatoidArthritis: false,
    rotatorCuffTear: false,
    rotatorCuffTendinitis: false,
    frozenShoulder: false,
    shoulderInstability: false,
    labrumTear: false,
    acJointArthritis: false,
    shoulderImpingement: false,
    shoulderFracture: false,
    calcificTendinitis: false,
    bicepsTendinitis: false,
    otherShoulderConditionSelected: false,
    otherShoulderCondition: '',
    // Symptom details
    symptomDuration: '',
    symptomProgression: '',
    mainSymptoms: '',
  },

  treatments: {
    overTheCounterMedication: false,
    prescriptionAntiInflammatory: false,
    prescriptionPainMedication: false,
    injections: false,
    injectionTypes: [],
    radiofrequencyAblation: false,
    physiotherapy: false,
    chiropracticTreatment: false,
    osteopathyMyotherapy: false,
  },
  hadSurgery: false,
  surgeries: [],

  imaging: [
    { type: 'X-Ray', hadStudy: false, clinic: '', date: '', jointRegions: [] },
    { type: 'MRI', hadStudy: false, clinic: '', date: '', jointRegions: [] },
    { type: 'CT Scan', hadStudy: false, clinic: '', date: '', jointRegions: [] },
    { type: 'Ultrasound', hadStudy: false, clinic: '', date: '', jointRegions: [] },
    { type: 'Bone Scan / SPECT', hadStudy: false, clinic: '', date: '', jointRegions: [] },
  ],

  painAreas: [],
  redFlags: {
    fevers: { present: false },
    unexplainedWeightLoss: { present: false, period: '', amountKg: undefined },
    nightPain: { present: false },
    weakness: { 
      present: false, 
      areas: {
        'Shoulder': { selected: false },
        'Arm': { selected: false },
        'Hand': { selected: false },
        'OtherArea': { selected: false },
      } 
    },
    otherRedFlagPresent: false,
    otherRedFlag: '',
  },
  treatmentGoals: '',
  imagingRecordsPermission: false,

  demographics: {
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    residentialAddress: {
      addressLine1: '',
      suburb: '',
      state: '',
      postcode: '',
    },
    isPostalSameAsResidential: true,
    funding: {
      source: '',
    },
    nextOfKin: {
      fullName: '',
      relationship: '',
      phoneNumber: '',
    },
    referringDoctor: {
      hasReferringDoctor: null,
    },
    medicareRefNum: '', // Initialize new field
  },
  formSessionId: '', // Session ID is managed by FormContext, not here
  painMapImageFront: '',
  painMapImageBack: '',
  nextStep: '',
  systemRecommendation: '',
};
