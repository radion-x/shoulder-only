import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from 'react';
import { FormData, initialFormData } from '../data/formData';

interface FormContextType {
  formData: FormData;
  currentStep: number;
  updateFormData: (stepData: Partial<FormData>) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  goToStep: (step: number) => void;
  isStepValid: (step: number) => boolean;
  isNavigating: boolean;
  setIsNavigating: (isNavigating: boolean) => void;
  // submitAction?: () => Promise<void>; // Optional: for the final step's custom action
  // setSubmitAction?: (handler: (() => Promise<void>) | undefined) => void; // To register the action
  submitActionRef?: React.MutableRefObject<(() => Promise<void>) | undefined>;
  registerSubmitAction?: (handler: (() => Promise<void>) | undefined) => void;
  isReadyForFinalSubmit?: boolean;
  setIsReadyForFinalSubmit?: (isReady: boolean) => void;
  formSessionId: string; // To uniquely identify this form session for uploads
  summaryProcessCompletedForSession: boolean;
  setSummaryProcessCompletedForSession: (completed: boolean) => void;
  
  // States lifted for SummaryStep stability
  aiSummary: string | null;
  setAiSummary: (summary: string | null) => void;
  isInitialProcessingCompleteForSubmit: boolean;
  setIsInitialProcessingCompleteForSubmit: (complete: boolean) => void;
  isSubmissionSuccessful: boolean;
  setIsSubmissionSuccessful: (isSuccess: boolean) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigatingRef = useRef(false);
  const submitActionHandlerRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const [isReadyForEmailSubmit, setIsReadyForEmailSubmit] = useState<boolean>(false);
  const [formSessionId] = useState<string>(() => `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const [summaryProcessCompleted, setSummaryProcessCompleted] = useState<boolean>(false);
  const [contextAiSummary, setContextAiSummary] = useState<string | null>(null);
  const [contextIsInitialProcessingComplete, setContextIsInitialProcessingComplete] = useState<boolean>(false);
  const [isSubmissionSuccessful, setIsSubmissionSuccessful] = useState<boolean>(false);
  const totalSteps = 7;

  // Sync formSessionId into formData on mount to ensure consistency
  useEffect(() => {
    setFormData(prevData => ({
      ...prevData,
      formSessionId: formSessionId
    }));
  }, [formSessionId]);

  const updateFormData = (stepData: Partial<FormData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...stepData
    }));
  };

  const goToNextStep = () => {
    if (navigatingRef.current || currentStep >= totalSteps) return;
    navigatingRef.current = true;
    setIsNavigating(true);
    setCurrentStep(prevStep => prevStep + 1);
    setTimeout(() => {
      navigatingRef.current = false;
      setIsNavigating(false);
    }, 500); // Increased timeout for safety
  };

  const goToPrevStep = () => {
    if (navigatingRef.current || currentStep <= 1) return;
    navigatingRef.current = true;
    setIsNavigating(true);
    setCurrentStep(prevStep => prevStep - 1);
    setTimeout(() => {
      navigatingRef.current = false;
      setIsNavigating(false);
    }, 500);
  };

  const goToStep = (step: number) => {
    if (navigatingRef.current || step < 1 || step > totalSteps) return;
    navigatingRef.current = true;
    setIsNavigating(true);
    setCurrentStep(step);
    setTimeout(() => {
      navigatingRef.current = false;
      setIsNavigating(false);
    }, 500);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Onboarding
        return formData.consent === true; // Explicitly check for true
      case 2: // Medical History
        return true; // All fields are optional
      case 3: // Treatments & Surgery History
        return true; // All fields are optional
      case 4: // Imaging History
        return true; // All fields are optional
      case 5: // Pain Mapping
        return formData.painAreas.length > 0;
      case 6: { // Demographics
        const { residentialAddress, isPostalSameAsResidential, postalAddress, funding } = formData.demographics;
        const isResidentialValid = !!residentialAddress.addressLine1 &&
                                 !!residentialAddress.suburb &&
                                 !!residentialAddress.state &&
                                 !!residentialAddress.postcode;
        
        let isPostalValid = true;
        if (!isPostalSameAsResidential) {
          isPostalValid = !!postalAddress?.addressLine1 &&
                          !!postalAddress?.suburb &&
                          !!postalAddress?.state &&
                          !!postalAddress?.postcode;
        }

        let isFundingValid = true;
        if (funding.source === 'Private Health Insurance') {
          isFundingValid = !!funding.healthFundName && !!funding.membershipNumber;
        } else if (funding.source === 'Other') {
          isFundingValid = !!funding.otherSource;
        }

        const { nextOfKin, referringDoctor } = formData.demographics;
        const isNextOfKinValid = !!nextOfKin.fullName && !!nextOfKin.relationship && !!nextOfKin.phoneNumber;
        
        let isReferringDoctorValid = true;
        if (referringDoctor.hasReferringDoctor === true) {
          isReferringDoctorValid = !!referringDoctor.doctorName && !!referringDoctor.clinic && !!referringDoctor.phoneNumber && !!referringDoctor.email;
        }

        return !!formData.demographics.fullName && 
               !!formData.demographics.dateOfBirth && 
               !!formData.demographics.phoneNumber && 
               !!formData.demographics.email &&
               isResidentialValid &&
               isPostalValid &&
               isFundingValid &&
               isNextOfKinValid &&
               isReferringDoctorValid;
      }
      case 7: // Summary
        return true; // Just a summary
      default:
        return false;
    }
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        currentStep,
        updateFormData,
        goToNextStep,
        goToPrevStep,
        goToStep,
        isStepValid,
        isNavigating,
        setIsNavigating,
        submitActionRef: submitActionHandlerRef,
        registerSubmitAction: (handler) => { submitActionHandlerRef.current = handler; },
        isReadyForFinalSubmit: isReadyForEmailSubmit,
        setIsReadyForFinalSubmit: setIsReadyForEmailSubmit,
        formSessionId,
        summaryProcessCompletedForSession: summaryProcessCompleted,
        setSummaryProcessCompletedForSession: setSummaryProcessCompleted,
        aiSummary: contextAiSummary,
        setAiSummary: setContextAiSummary,
        isInitialProcessingCompleteForSubmit: contextIsInitialProcessingComplete,
        setIsInitialProcessingCompleteForSubmit: setContextIsInitialProcessingComplete,
        isSubmissionSuccessful,
        setIsSubmissionSuccessful
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
