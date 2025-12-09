function generateComprehensivePrompt(formData) {
    let patientAge = 'Not provided';
    if (formData.demographics && formData.demographics.dateOfBirth) {
        try {
            const dob = new Date(formData.demographics.dateOfBirth);
            const ageDifMs = Date.now() - dob.getTime();
            const ageDate = new Date(ageDifMs);
            patientAge = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
        } catch (e) {
            console.error("Error calculating age from DOB:", e);
            patientAge = 'Could not calculate from DOB';
        }
    }

    let comprehensivePrompt = `
Analyze the following patient-provided hip evaluation data and generate a concise clinical summary.
The patient's name is ${formData.demographics?.fullName || 'Not provided'} and their calculated age is ${patientAge} years.
Consider all provided information, including age, symptoms, medical history, red flags, and treatment goals, to tailor the summary and any potential diagnostic considerations or observations.
Focus on:
- Key symptoms and their characteristics (location, nature, timing).
- Relevant medical history (hip diagnoses, surgeries, treatments), including specific details for "other" conditions, main symptoms, symptom duration, and progression.
- Interpretation of pain point data (locations, intensities).
- Patient's stated goals for treatment.
- Specific red flag symptoms reported, including all details.
Highlight potential red flags or areas needing further investigation based ONLY on the provided data, considering the patient's age and overall clinical picture.
Maintain an objective, structured, and professional tone. Do not provide medical advice or diagnoses not directly derivable from the input. It is imperative that the word "recommendation" or its variations are not used in the summary.
The summary should be suitable for a medical professional to quickly understand the patient's situation.

Patient Data:
Full Name: ${formData.demographics?.fullName || 'Not provided'}
Date of Birth: ${formData.demographics?.dateOfBirth || 'Not provided'} (Calculated Age: ${patientAge} years)
Medicare Number: ${formData.demographics?.medicareNumber || 'N/A'}
Medicare Ref. No.: ${formData.demographics?.medicareRefNum || 'N/A'}
Treatment Goals: ${formData.treatmentGoals || 'Not provided'}
`;

    if (formData.diagnoses) {
        comprehensivePrompt += "\nMedical History & Symptoms:\n";
        
        // Hip Diagnoses
        let hipConditions = [];
        if (formData.diagnoses.hipOsteoarthritis) hipConditions.push("Hip Osteoarthritis");
        if (formData.diagnoses.hipRheumatoidArthritis) hipConditions.push("Hip Rheumatoid Arthritis");
        if (formData.diagnoses.labralTear) hipConditions.push("Labral Tear");
        if (formData.diagnoses.hipDysplasia) hipConditions.push("Hip Dysplasia");
        if (formData.diagnoses.femoroacetabularImpingement) hipConditions.push("Femoroacetabular Impingement (FAI)");
        if (formData.diagnoses.hipFracture) hipConditions.push("Hip Fracture");
        if (formData.diagnoses.trochantericBursitis) hipConditions.push("Trochanteric Bursitis");
        if (formData.diagnoses.avascularNecrosis) hipConditions.push("Avascular Necrosis (AVN)");
        if (formData.diagnoses.glutealTendonTear) hipConditions.push("Gluteal Tendon Tear / Tendinopathy");
        if (formData.diagnoses.snappingHipSyndrome) hipConditions.push("Snapping Hip Syndrome");
        if (formData.diagnoses.otherHipConditionSelected && formData.diagnoses.otherHipCondition) {
            hipConditions.push(`Other Hip Condition: ${formData.diagnoses.otherHipCondition}`);
        }

        if (hipConditions.length > 0) {
            comprehensivePrompt += `Hip Diagnoses: ${hipConditions.join(', ')}\n`;
        }
        if (formData.diagnoses.mainSymptoms) {
            comprehensivePrompt += `Main Symptoms: ${formData.diagnoses.mainSymptoms}\n`;
        }
        if (formData.diagnoses.symptomDuration) {
            comprehensivePrompt += `Symptom Duration: ${formData.diagnoses.symptomDuration}\n`;
        }
        if (formData.diagnoses.symptomProgression) {
            comprehensivePrompt += `Symptom Progression: ${formData.diagnoses.symptomProgression}\n`;
        }
    }

    if (formData.redFlags) {
        comprehensivePrompt += "\nRed Flag Symptoms Reported:\n";
        const {
            fevers, unexplainedWeightLoss, nightPain, weakness,
            otherRedFlagPresent, otherRedFlag
        } = formData.redFlags;

        if (fevers?.present) {
            comprehensivePrompt += `- Fevers: Present\n`;
        }
        if (unexplainedWeightLoss?.present) {
            comprehensivePrompt += `- Unexplained Weight Loss: Present`;
            if (unexplainedWeightLoss.amountKg !== undefined) comprehensivePrompt += `, Amount: ${unexplainedWeightLoss.amountKg}kg`;
            if (unexplainedWeightLoss.period) comprehensivePrompt += `, Period: ${unexplainedWeightLoss.period}`;
            comprehensivePrompt += `\n`;
        }
        if (nightPain?.present) {
            comprehensivePrompt += `- Night Pain: Present (pain that wakes from sleep)\n`;
        }
        if (weakness?.present && weakness.areas) {
            const areaDetails = Object.entries(weakness.areas)
                .filter(([, val]) => val.selected)
                .map(([areaName]) => areaName).join(', ');
            if (areaDetails) comprehensivePrompt += `- Weakness: Present, Areas: ${areaDetails}\n`;
            else comprehensivePrompt += `- Weakness: Present (no specific areas detailed)\n`;
        }
        if (otherRedFlagPresent && otherRedFlag) {
            comprehensivePrompt += `- Other Red Flags: ${otherRedFlag}\n`;
        }
    } else {
        comprehensivePrompt += "\nRed Flag Symptoms: Not provided or none reported.\n";
    }

    if (formData.imagingRecordsPermission) {
        comprehensivePrompt += "\nImaging Records Permission: Granted\n";
    } else {
        comprehensivePrompt += "\nImaging Records Permission: Not Granted\n";
    }

    if (formData.painAreas && formData.painAreas.length > 0) {
        comprehensivePrompt += "\nPain Areas Reported:\n";
        formData.painAreas.forEach(area => {
            comprehensivePrompt += `- Region: ${area.region}, Intensity: ${area.intensity}/10, Notes: ${area.notes || 'N/A'}\n`;
        });
    }

    if (formData.treatments) {
        comprehensivePrompt += "\nTreatments Received:\n";
        if (formData.treatments.overTheCounterMedication) {
            comprehensivePrompt += `- Over-the-Counter Medication\n`;
        }
        if (formData.treatments.prescriptionAntiInflammatory) {
            let details = formData.treatments.prescriptionAntiInflammatoryName ? `: ${formData.treatments.prescriptionAntiInflammatoryName}` : '';
            comprehensivePrompt += `- Prescription Anti-Inflammatory${details}\n`;
        }
        if (formData.treatments.prescriptionPainMedication) {
            let details = formData.treatments.prescriptionPainMedicationName ? `: ${formData.treatments.prescriptionPainMedicationName}` : '';
            comprehensivePrompt += `- Prescription Pain Medication${details}\n`;
        }
        if (formData.treatments.injections) {
            let injectionDetails = '';
            if (formData.treatments.injectionTypes && formData.treatments.injectionTypes.length > 0) {
                injectionDetails = `: ${formData.treatments.injectionTypes.join(', ')}`;
            }
            comprehensivePrompt += `- Injections${injectionDetails}\n`;
        }
        if (formData.treatments.radiofrequencyAblation) {
            comprehensivePrompt += `- Radiofrequency Ablation\n`;
        }
        if (formData.treatments.physiotherapy) {
            comprehensivePrompt += `- Physiotherapy\n`;
        }
        if (formData.treatments.chiropracticTreatment) {
            comprehensivePrompt += `- Chiropractic Treatment\n`;
        }
        if (formData.treatments.osteopathyMyotherapy) {
            comprehensivePrompt += `- Osteopathy/Myotherapy\n`;
        }
    }

    if (formData.surgeries && formData.surgeries.length > 0 && formData.hadSurgery) {
        comprehensivePrompt += "\nHip Surgical History:\n";
        formData.surgeries.forEach(surgery => {
            comprehensivePrompt += `- Procedure: ${surgery.procedure || 'N/A'}, Date: ${surgery.date || 'N/A'}, Surgeon: ${surgery.surgeon || 'N/A'}, Hospital: ${surgery.hospital || 'N/A'}\n`;
        });
    } else if (formData.hadSurgery === false) {
        comprehensivePrompt += "\nHip Surgical History: No surgical history reported.\n";
    }

    if (formData.imaging && formData.imaging.some(img => img.hadStudy)) {
        comprehensivePrompt += "\nImaging History:\n";
        formData.imaging.filter(img => img.hadStudy).forEach(img => {
            let regions = '';
            if (img.jointRegions && img.jointRegions.length > 0) {
                regions = `, Regions: ${img.jointRegions.join(', ')}`;
            }
            comprehensivePrompt += `- Type: ${img.type || 'N/A'}, Date: ${img.date || 'N/A'}, Clinic: ${img.clinic || 'N/A'}${regions}${img.documentName ? ', Document: Available' : ''}\n`;
        });
    }

    return comprehensivePrompt;
}

module.exports = { generateComprehensivePrompt };
