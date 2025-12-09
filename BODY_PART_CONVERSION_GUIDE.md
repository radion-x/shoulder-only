# Body Part Configuration Guide
## Medical Assessment App - Conversion Reference

**STATUS: This app is currently configured for HIP ONLY assessments.**

This document provides detailed instructions for converting this medical assessment app 
to different body parts (Shoulder, Knee, Spine, etc.) while maintaining 
the whole-body pain mapping feature.

---

## IMPORTANT: What NOT to Change

**Pain mapping hotspots should remain as-is** - they represent whole-body pain locations:
- `client/src/components/steps/PainMappingStep.tsx` - Keep all anatomical hotspots
- `client/src/components/PainMappingStep.tsx` - Keep BODY_REGIONS array (neck, shoulders, back, hips, legs)

These are for "where does it hurt?" not diagnosis categories.

---

## 1. BRANDING & PAGE TITLES

### client/index.html
**Line 7** - Page title
```html
<!-- KNEE ONLY (current) -->
<title>Knee IQ - Intelligent Care for Movement</title>

<!-- SHOULDER -->
<title>Shoulder IQ - Intelligent Care for Movement</title>

<!-- HIP -->
<title>Hip IQ - Intelligent Care for Movement</title>
```

### client/src/components/FormStepper.tsx
**Line 46** - Main visible app header (the big title users see on step 1)
```tsx
// KNEE ONLY (current)
<h1 className="text-6xl font-bold mb-2 text-gray-900 dark:text-white">Knee IQ</h1>
<p className="text-2xl font-light text-gray-700 dark:text-neutral-300">Intelligent Care for Movement</p>
<p className="text-sm text-gray-500 dark:text-gray-500 mt-2">by Dr. Andrew Fraval</p>

// SHOULDER
<h1 className="text-6xl font-bold mb-2 text-gray-900 dark:text-white">Shoulder IQ</h1>
<p className="text-2xl font-light text-gray-700 dark:text-neutral-300">Intelligent Care for Movement</p>
<p className="text-sm text-gray-500 dark:text-gray-500 mt-2">by Dr. Andrew Fraval</p>
```

### client/src/components/SpineEvaluationIntro.tsx
**Line 46** - Secondary header (if used)
```tsx
// KNEE ONLY (current)
<h1 className="text-6xl font-bold mb-2 text-gray-900 dark:text-white">Knee IQ</h1>

// SHOULDER
<h1 className="text-6xl font-bold mb-2 text-gray-900 dark:text-white">Shoulder IQ</h1>
```

### client/src/components/OnboardingStep.tsx
**Line 16** - Welcome title
```tsx
// KNEE ONLY (current)
<h2>Welcome to Your Knee Evaluation</h2>

// KNEE ONLY
<h2>Welcome to Knee IQ</h2>
```

**Line 19** - Welcome subtitle
```tsx
// CURRENT
Let's work together to understand your hip and knee health...

// KNEE ONLY
Let's work together to understand your knee health...
```

**Line 62** - Evaluation description
```tsx
// CURRENT
...for your hip and knee health journey.

// KNEE ONLY
...for your knee health journey.
```

### client/src/components/steps/OnboardingStep.tsx
**Line 26** - Section title
```tsx
// CURRENT
<h2>Welcome to Hip & Knee IQ</h2>

// KNEE ONLY
<h2>Welcome to Knee IQ</h2>
```

**Line 29** - Section description
```tsx
// CURRENT
Let's work together to understand your hip and knee health...

// KNEE ONLY
Let's work together to understand your knee health...
```

---

## 2. FORM DATA STRUCTURE (Core Type Definitions)

### client/src/data/formData.ts

#### Interface Definition - DIAGNOSES SECTION (Lines 133-161)

**FOR KNEE ONLY - Remove all hip fields, keep knee fields:**
```typescript
// Step 2: Medical History - Knee Diagnoses
diagnoses: {
    // Knee Diagnoses
    kneeOsteoarthritis: boolean;
    kneeRheumatoidArthritis: boolean;
    aclRupture: boolean;
    otherLigamentInjury: boolean;
    otherLigamentInjuryDetails?: string;
    patellaInstability: boolean;
    meniscalTear: boolean;
    kneeFracture: boolean;
    kneeTendinitis: boolean;
    otherKneeConditionSelected?: boolean;
    otherKneeCondition?: string;
}
```

**FOR SHOULDER - Replace with shoulder-specific fields:**
```typescript
// Step 2: Medical History - Shoulder Diagnoses
diagnoses: {
    // Shoulder Diagnoses
    shoulderOsteoarthritis: boolean;
    shoulderRheumatoidArthritis: boolean;
    rotatorCuffTear: boolean;
    rotatorCuffTendinitis: boolean;
    frozenShoulder: boolean;           // Adhesive capsulitis
    shoulderInstability: boolean;       // Dislocations/subluxations
    labrumTear: boolean;               // SLAP tear
    acJointArthritis: boolean;         // Acromioclavicular
    shoulderImpingement: boolean;
    shoulderFracture: boolean;
    calcificTendinitis: boolean;
    otherShoulderConditionSelected?: boolean;
    otherShoulderCondition?: string;
}
```

#### Initial Values (Lines 213-247)
Update `initialFormData.diagnoses` object with same fields as interface, all set to `false`

#### Red Flags Weakness Areas (Lines 268-273)
```typescript
// CURRENT
weakness: { 
  present: false, 
  areas: {
    'Hip': { selected: false },
    'Knee': { selected: false },
    'Leg': { selected: false },
    'OtherArea': { selected: false },
  } 
}

// KNEE ONLY
weakness: { 
  present: false, 
  areas: {
    'Knee': { selected: false },
    'Leg': { selected: false },
    'OtherArea': { selected: false },
  } 
}

// SHOULDER
weakness: { 
  present: false, 
  areas: {
    'Shoulder': { selected: false },
    'Arm': { selected: false },
    'Hand': { selected: false },
    'OtherArea': { selected: false },
  } 
}
```

#### Joint Regions Comment (Line 23)
```typescript
// CURRENT
jointRegions?: string[]; // Array of selected joint regions (Left Hip, Right Hip, Left Knee, Right Knee)

// KNEE ONLY
jointRegions?: string[]; // Array of selected joint regions (Left Knee, Right Knee)

// SHOULDER
jointRegions?: string[]; // Array of selected joint regions (Left Shoulder, Right Shoulder)
```

---

## 3. IMAGING JOINT REGIONS

### client/src/components/steps/ImagingHistoryStep.tsx

**Line 8** - Joint region options
```tsx
// CURRENT
const JOINT_REGIONS = ['Left Hip', 'Right Hip', 'Left Knee', 'Right Knee'];

// KNEE ONLY
const JOINT_REGIONS = ['Left Knee', 'Right Knee'];

// SHOULDER
const JOINT_REGIONS = ['Left Shoulder', 'Right Shoulder'];
```

**Line 90** - Instruction text
```tsx
// CURRENT
Please indicate which imaging studies you have had for your hip or knee.

// KNEE ONLY
Please indicate which imaging studies you have had for your knee.

// SHOULDER
Please indicate which imaging studies you have had for your shoulder.
```

---

## 4. CLINICAL HISTORY STEP (Diagnosis UI)

### client/src/components/steps/ClinicalHistoryStep.tsx

**FOR KNEE ONLY - Delete hipConditions array (Lines 64-74), keep kneeConditions**

**FOR SHOULDER - Replace both arrays with:**
```tsx
const shoulderConditions = [
  { id: 'shoulderOsteoarthritis', label: 'Shoulder Osteoarthritis' },
  { id: 'shoulderRheumatoidArthritis', label: 'Rheumatoid Arthritis' },
  { id: 'rotatorCuffTear', label: 'Rotator Cuff Tear' },
  { id: 'rotatorCuffTendinitis', label: 'Rotator Cuff Tendinitis' },
  { id: 'frozenShoulder', label: 'Frozen Shoulder (Adhesive Capsulitis)' },
  { id: 'shoulderInstability', label: 'Shoulder Instability / Dislocation' },
  { id: 'labrumTear', label: 'Labrum Tear (SLAP)' },
  { id: 'acJointArthritis', label: 'AC Joint Arthritis' },
  { id: 'shoulderImpingement', label: 'Shoulder Impingement' },
  { id: 'shoulderFracture', label: 'Fracture' },
  { id: 'calcificTendinitis', label: 'Calcific Tendinitis' },
  { id: 'otherShoulderConditionSelected', label: 'Other Shoulder Condition' },
];
```

**Section Headers (Lines 187, 193)**
```tsx
// CURRENT
<h3>Hip Diagnoses</h3>
<h3>Knee Diagnoses</h3>

// KNEE ONLY - Remove hip section entirely, keep knee

// SHOULDER
<h3>Shoulder Diagnoses</h3>
```

**Placeholder Text (Line 220)**
```tsx
// CURRENT
placeholder="e.g., hip pain, knee swelling, difficulty walking, stiffness..."

// KNEE ONLY
placeholder="e.g., knee pain, swelling, difficulty walking, stiffness, instability..."

// SHOULDER
placeholder="e.g., shoulder pain, stiffness, weakness, difficulty reaching overhead..."
```

---

## 5. TREATMENT HISTORY STEP

### client/src/components/steps/TreatmentHistoryStep.tsx

**Line 224** - Section header
```tsx
// CURRENT
Hip/Knee Surgery History

// KNEE ONLY
Knee Surgery History

// SHOULDER
Shoulder Surgery History
```

**Line 227** - Question text
```tsx
// CURRENT
Have you had previous surgery on your hip or knee?

// KNEE ONLY
Have you had previous surgery on your knee?

// SHOULDER
Have you had previous surgery on your shoulder?
```

---

## 6. SUMMARY STEP

### client/src/components/steps/SummaryStep.tsx

**Lines 510-531** - Diagnosis display items

**FOR KNEE ONLY:**
- Remove all hip diagnosis displays (hipOsteoarthritis, labralTear, trochantericBursitis, etc.)
- Keep all knee diagnosis displays

**FOR SHOULDER:**
- Remove all hip AND knee displays
- Add shoulder diagnosis displays matching the new fields

**Line 577** - Surgery section label
```tsx
// CURRENT
Hip/Knee Surgery History:

// KNEE ONLY
Knee Surgery History:

// SHOULDER
Shoulder Surgery History:
```

---

## 7. DATABASE SCHEMA

### server/models/Assessment.js

**Diagnoses Schema (Lines 13-39)**

**FOR KNEE ONLY - Remove hip fields, keep:**
```javascript
diagnoses: {
  kneeOsteoarthritis: Boolean,
  kneeRheumatoidArthritis: Boolean,
  aclRupture: Boolean,
  otherLigamentInjury: Boolean,
  otherLigamentInjuryDetails: String,
  patellaInstability: Boolean,
  meniscalTear: Boolean,
  kneeFracture: Boolean,
  kneeTendinitis: Boolean,
  otherKneeConditionSelected: Boolean,
  otherKneeCondition: String,
}
```

**FOR SHOULDER - Replace with:**
```javascript
diagnoses: {
  shoulderOsteoarthritis: Boolean,
  shoulderRheumatoidArthritis: Boolean,
  rotatorCuffTear: Boolean,
  rotatorCuffTendinitis: Boolean,
  frozenShoulder: Boolean,
  shoulderInstability: Boolean,
  labrumTear: Boolean,
  acJointArthritis: Boolean,
  shoulderImpingement: Boolean,
  shoulderFracture: Boolean,
  calcificTendinitis: Boolean,
  otherShoulderConditionSelected: Boolean,
  otherShoulderCondition: String,
}
```

---

## 8. AI PROMPT BUILDER

### server/prompt-builder.js

**Line 16** - Prompt opening
```javascript
// CURRENT
You are a medical assistant specialized in hip and knee conditions.

// KNEE ONLY
You are a medical assistant specialized in knee conditions.

// SHOULDER
You are a medical assistant specialized in shoulder conditions.
```

**Lines 37-68** - Diagnosis array building

**FOR KNEE ONLY - Remove hip conditions block (37-48), keep knee block (51-68)**

**FOR SHOULDER - Replace both with:**
```javascript
// Build shoulder conditions array
const shoulderConditions = [];
if (diagnoses?.shoulderOsteoarthritis) shoulderConditions.push('Shoulder Osteoarthritis');
if (diagnoses?.shoulderRheumatoidArthritis) shoulderConditions.push('Rheumatoid Arthritis');
if (diagnoses?.rotatorCuffTear) shoulderConditions.push('Rotator Cuff Tear');
if (diagnoses?.rotatorCuffTendinitis) shoulderConditions.push('Rotator Cuff Tendinitis');
if (diagnoses?.frozenShoulder) shoulderConditions.push('Frozen Shoulder (Adhesive Capsulitis)');
if (diagnoses?.shoulderInstability) shoulderConditions.push('Shoulder Instability');
if (diagnoses?.labrumTear) shoulderConditions.push('Labrum Tear (SLAP)');
if (diagnoses?.acJointArthritis) shoulderConditions.push('AC Joint Arthritis');
if (diagnoses?.shoulderImpingement) shoulderConditions.push('Shoulder Impingement');
if (diagnoses?.shoulderFracture) shoulderConditions.push('Shoulder Fracture');
if (diagnoses?.calcificTendinitis) shoulderConditions.push('Calcific Tendinitis');
if (diagnoses?.otherShoulderCondition) shoulderConditions.push(`Other: ${diagnoses.otherShoulderCondition}`);
```

**Lines 70-74** - Section labels
```javascript
// CURRENT
Hip Diagnoses: ${hipConditions.join(', ') || 'None reported'}
Knee Diagnoses: ${kneeConditions.join(', ') || 'None reported'}

// KNEE ONLY
Knee Diagnoses: ${kneeConditions.join(', ') || 'None reported'}

// SHOULDER
Shoulder Diagnoses: ${shoulderConditions.join(', ') || 'None reported'}
```

**Lines 172, 177** - Surgery history labels
```javascript
// CURRENT
Hip/Knee Surgical History:

// KNEE ONLY
Knee Surgical History:

// SHOULDER
Shoulder Surgical History:
```

---

## 9. EMAIL TEMPLATES

### server/app.js

**Line 504** - Admin email sender name
```javascript
// CURRENT
from: `"Hip & Knee IQ Assessment" <${process.env.EMAIL_SENDER_ADDRESS}>`

// KNEE ONLY
from: `"Knee IQ Assessment" <${process.env.EMAIL_SENDER_ADDRESS}>`

// SHOULDER
from: `"Shoulder IQ Assessment" <${process.env.EMAIL_SENDER_ADDRESS}>`
```

**Line 506** - Admin email subject
```javascript
// CURRENT
subject: `Hip & Knee Assessment Summary - ${patientName}`

// KNEE ONLY
subject: `Knee Assessment Summary - ${patientName}`

// SHOULDER
subject: `Shoulder Assessment Summary - ${patientName}`
```

**Line 529** - Patient email sender name
```javascript
// CURRENT
from: `"Hip & Knee IQ Assessment" <${process.env.EMAIL_SENDER_ADDRESS}>`

// KNEE ONLY
from: `"Knee IQ Assessment" <${process.env.EMAIL_SENDER_ADDRESS}>`
```

**Line 531** - Patient email subject
```javascript
// CURRENT
subject: `Your Hip & Knee Assessment Summary - ${patientName}`

// KNEE ONLY
subject: `Your Knee Assessment Summary - ${patientName}`
```

**Line 591** - Email HTML header
```javascript
// CURRENT
<h1>Hip & Knee Assessment Report</h1>

// KNEE ONLY
<h1>Knee Assessment Report</h1>

// SHOULDER
<h1>Shoulder Assessment Report</h1>
```

### server/routes/api.js

**Same changes as app.js at Lines 109, 112, 121, 123, 157**

---

## 10. ENVIRONMENT / CONFIG FILES

### .env
**Line 11** - Database name (optional)
```bash
# CURRENT
MONGODB_URI="mongodb://localhost:27017/andrew_knee"

# Update collection name as needed for organization
```

### .github/copilot-instructions.md
Update documentation references from "Spine IQ" or "Hip & Knee" to match new branding.

---

## QUICK REFERENCE: FILES TO MODIFY

| File | Changes |
|------|---------|  
| `client/index.html` | Page title |
| `client/src/components/FormStepper.tsx` | Main app header ("Knee IQ" title, subtitle, author) |
| `client/src/components/SpineEvaluationIntro.tsx` | Main header |
| `client/src/components/OnboardingStep.tsx` | Welcome text (3 locations) |
| `client/src/components/steps/OnboardingStep.tsx` | Welcome text (2 locations) |
| `client/src/data/formData.ts` | Diagnosis interface, initial values, weakness areas |
| `client/src/components/steps/ClinicalHistoryStep.tsx` | Conditions arrays, section headers, placeholder |
| `client/src/components/steps/ImagingHistoryStep.tsx` | JOINT_REGIONS array, instruction text |
| `client/src/components/steps/TreatmentHistoryStep.tsx` | Surgery section header, question |
| `client/src/components/steps/SummaryStep.tsx` | Diagnosis displays, surgery label |
| `server/models/Assessment.js` | Database schema fields |
| `server/prompt-builder.js` | AI prompt, conditions arrays, section labels |
| `server/app.js` | Email sender, subjects, HTML header |
| `server/routes/api.js` | Email sender, subjects, HTML header |

---

## CONVERSION CHECKLIST

### Branding
- [ ] Update page title (index.html)
- [ ] Update main header (SpineEvaluationIntro.tsx)
- [ ] Update onboarding text (OnboardingStep.tsx - components folder)
- [ ] Update onboarding text (OnboardingStep.tsx - steps folder)

### Form Data
- [ ] Update FormData interface diagnoses (formData.ts)
- [ ] Update initialFormData defaults (formData.ts)
- [ ] Update weakness areas (formData.ts)
- [ ] Update joint regions comment (formData.ts)

### UI Components
- [ ] Update conditions arrays (ClinicalHistoryStep.tsx)
- [ ] Update/remove diagnosis UI sections (ClinicalHistoryStep.tsx)
- [ ] Update placeholder text (ClinicalHistoryStep.tsx)
- [ ] Update JOINT_REGIONS (ImagingHistoryStep.tsx)
- [ ] Update imaging instructions (ImagingHistoryStep.tsx)
- [ ] Update surgery section header (TreatmentHistoryStep.tsx)
- [ ] Update surgery question (TreatmentHistoryStep.tsx)
- [ ] Update/remove summary diagnosis displays (SummaryStep.tsx)
- [ ] Update surgery label in summary (SummaryStep.tsx)

### Backend
- [ ] Update database schema (Assessment.js)
- [ ] Update AI prompt opening (prompt-builder.js)
- [ ] Update conditions processing (prompt-builder.js)
- [ ] Update prompt section labels (prompt-builder.js)
- [ ] Update surgery history labels (prompt-builder.js)
- [ ] Update email sender name (app.js)
- [ ] Update email subjects (app.js)
- [ ] Update email HTML header (app.js)
- [ ] Update email sender name (api.js)
- [ ] Update email subjects (api.js)
- [ ] Update email HTML header (api.js)

### Testing
- [ ] Test form submission flow
- [ ] Test AI summary generation
- [ ] Test email delivery (admin)
- [ ] Test email delivery (patient)
- [ ] Test doctor dashboard display

---

## COMMON MEDICAL CONDITIONS BY BODY PART

### Knee Conditions
- Knee Osteoarthritis
- Rheumatoid Arthritis
- ACL Rupture
- Other Ligament Injury (MCL, PCL, LCL)
- Patella Instability / Dislocation
- Meniscal Tear
- Fracture
- Tendinitis (Patellar, Quadriceps)
- Baker's Cyst
- Bursitis

### Shoulder Conditions
- Shoulder Osteoarthritis
- Rheumatoid Arthritis
- Rotator Cuff Tear
- Rotator Cuff Tendinitis
- Frozen Shoulder (Adhesive Capsulitis)
- Shoulder Instability / Dislocation
- Labrum Tear (SLAP)
- AC Joint Arthritis
- Shoulder Impingement
- Fracture
- Calcific Tendinitis
- Biceps Tendinitis

### Hip Conditions
- Hip Osteoarthritis
- Rheumatoid Arthritis
- Labral Tear
- Trochanteric Bursitis
- Gluteal Tendon Tear
- Stress Fracture
- Avascular Necrosis
- Hip Dysplasia
- Femoroacetabular Impingement (FAI)
- Snapping Hip Syndrome

### Spine Conditions
- Degenerative Disc Disease
- Herniated Disc
- Spinal Stenosis
- Spondylolisthesis
- Scoliosis
- Sciatica
- Facet Joint Arthritis
- Compression Fracture
- Muscle Strain
- Radiculopathy
