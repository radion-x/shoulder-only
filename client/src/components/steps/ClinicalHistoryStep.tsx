import React from 'react';
import { useFormContext } from '../../context/FormContext';

const ClinicalHistoryStep: React.FC = () => {
  const { formData, updateFormData } = useFormContext();

  const handleDiagnosisChange = (
    diagnosisKey: string,
    value: boolean
  ) => {
    const newDiagnoses = {
      ...formData.diagnoses,
      [diagnosisKey]: value,
    };
    // If 'Other Shoulder' is being set to No, clear the text field
    if (diagnosisKey === 'otherShoulderConditionSelected' && !value) {
      newDiagnoses.otherShoulderCondition = '';
    }
    updateFormData({ diagnoses: newDiagnoses });
  };

  const handleMainSymptomsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({
      diagnoses: {
        ...formData.diagnoses,
        mainSymptoms: e.target.value,
      },
    });
  };

  const handleSymptomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({
      diagnoses: {
        ...formData.diagnoses,
        symptomDuration: e.target.value,
      },
    });
  };

  const handleSymptomProgressionChange = (
    value: 'Getting better' | 'Staying the same' | 'Getting worse' | ''
  ) => {
    updateFormData({
      diagnoses: {
        ...formData.diagnoses,
        symptomProgression: value,
      },
    });
  };

  const handleOtherTextChange = (field: 'otherShoulderCondition', value: string) => {
    updateFormData({
      diagnoses: {
        ...formData.diagnoses,
        [field]: value
      }
    });
  };

  // Shoulder Diagnoses
  const shoulderConditions = [
    { id: 'shoulderOsteoarthritis', label: 'Shoulder Osteoarthritis' },
    { id: 'shoulderRheumatoidArthritis', label: 'Rheumatoid Arthritis' },
    { id: 'rotatorCuffTear', label: 'Rotator Cuff Tear' },
    { id: 'rotatorCuffTendinitis', label: 'Rotator Cuff Tendinitis' },
    { id: 'frozenShoulder', label: 'Frozen Shoulder (Adhesive Capsulitis)' },
    { id: 'shoulderInstability', label: 'Shoulder Instability / Dislocation' },
    { id: 'labrumTear', label: 'Labrum Tear (SLAP Lesion)' },
    { id: 'acJointArthritis', label: 'AC Joint Arthritis' },
    { id: 'shoulderImpingement', label: 'Shoulder Impingement Syndrome' },
    { id: 'shoulderFracture', label: 'Shoulder Fracture' },
    { id: 'calcificTendinitis', label: 'Calcific Tendinitis' },
    { id: 'bicepsTendinitis', label: 'Biceps Tendinitis' },
    { id: 'otherShoulderConditionSelected', label: 'Other Shoulder Condition' },
  ];

  const renderConditionItem = (condition: { id: string; label: string }) => {
    const diagnosisKey = condition.id as keyof typeof formData.diagnoses;
    const isChecked = formData.diagnoses[diagnosisKey] === true;

    return (
      <React.Fragment key={condition.id}>
        <div className="flex flex-col sm:flex-row sm:items-center p-3 border rounded-md hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors">
          <div className="font-medium text-slate-800 dark:text-gray-200 flex-1 mb-2 sm:mb-0">{condition.label}</div>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`diagnosis-${condition.id}`}
                className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                checked={isChecked}
                onChange={() => handleDiagnosisChange(diagnosisKey, true)}
              />
              <span className="ml-2 text-slate-700 dark:text-gray-300">Yes</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name={`diagnosis-${condition.id}`}
                className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                checked={!isChecked}
                onChange={() => handleDiagnosisChange(diagnosisKey, false)}
              />
              <span className="ml-2 text-slate-700 dark:text-gray-300">No</span>
            </label>
          </div>
        </div>
        
        {/* Show text area for "Other Shoulder Condition" */}
        {condition.id === 'otherShoulderConditionSelected' && formData.diagnoses.otherShoulderConditionSelected && (
          <div className="mt-2 mb-4 pl-4">
            <label htmlFor="otherShoulderConditionText" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
              Please specify other shoulder condition(s):
            </label>
            <textarea
              id="otherShoulderConditionText"
              className="w-full h-20 px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe other shoulder conditions here..."
              value={formData.diagnoses.otherShoulderCondition || ''}
              onChange={(e) => handleOtherTextChange('otherShoulderCondition', e.target.value)}
            />
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="step-container">
      <h2 className="form-title">Clinical History</h2>
      
      <div className="space-y-6">
        <p className="text-slate-700 dark:text-gray-300">
          Have you been diagnosed with any of the following conditions? Select all that apply.
        </p>

        {/* Shoulder Diagnoses Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4">Shoulder Diagnoses</h3>
          <div className="space-y-4">
            {shoulderConditions.map((condition) => renderConditionItem(condition))}
          </div>
        </div>

        {/* Symptom Questions */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-200 mb-4">About Your Symptoms</h3>

          <div className="mb-6">
            <label htmlFor="mainSymptoms" className="block font-medium text-slate-800 dark:text-gray-200 mb-2">
              What are your main symptoms?
            </label>
            <textarea
              id="mainSymptoms"
              className="w-full h-24 px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., shoulder pain, arm weakness, difficulty reaching overhead, stiffness, clicking, catching..."
              value={formData.diagnoses.mainSymptoms || ''}
              onChange={handleMainSymptomsChange}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="symptomDuration" className="block font-medium text-slate-800 dark:text-gray-200 mb-2">
              How long have you had these main symptoms?
            </label>
            <input
              type="text"
              id="symptomDuration"
              className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 3 weeks, 6 months, 2 years"
              value={formData.diagnoses.symptomDuration || ''}
              onChange={handleSymptomDurationChange}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-800 dark:text-gray-200 mb-3">Are your symptoms:</label>
            <div className="space-y-2">
              {[
                { value: 'Getting better', label: 'Getting better' },
                { value: 'Staying the same', label: 'Staying the same' },
                { value: 'Getting worse', label: 'Getting worse' },
              ].map((option) => (
                <label key={option.value} className="flex items-center p-3 border rounded-md hover:bg-slate-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="symptomProgression"
                    className="h-4 w-4 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700"
                    value={option.value}
                    checked={formData.diagnoses.symptomProgression === option.value}
                    onChange={() => handleSymptomProgressionChange(option.value as 'Getting better' | 'Staying the same' | 'Getting worse')}
                  />
                  <span className="ml-3 text-slate-700 dark:text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalHistoryStep;
