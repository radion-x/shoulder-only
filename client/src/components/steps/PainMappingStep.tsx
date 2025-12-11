import React, { useState, MouseEvent, useRef, useImperativeHandle, forwardRef } from 'react';
import { useFormContext } from '../../context/FormContext';
import { PainArea, RedFlagsData } from '../../data/formData';
import { getApiUrl } from '../../config/api';
import bodyFrontImg from '../../assets/body-front.png';
import bodyBackImg from '../../assets/body-back.png';
import html2canvas from 'html2canvas';

export type BodyView = 'front' | 'back';

interface Hotspot {
  id: number; 
  name: string; 
  x: number;    
  y: number;    
  width: number; 
  height: number; 
  isDetail?: boolean; 
}

const frontHotspots: Hotspot[] = [
  // Head & Face (ID 1) - Greatly Expanded
  { id: 1, name: 'Forehead (Central Superior)', x: 0.45, y: 0.005, width: 0.1, height: 0.02 },
  { id: 1, name: 'Forehead (Central Inferior)', x: 0.45, y: 0.025, width: 0.1, height: 0.02 },
  { id: 1, name: 'Forehead (Left Superior)', x: 0.37, y: 0.005, width: 0.08, height: 0.02 },
  { id: 1, name: 'Forehead (Left Inferior)', x: 0.37, y: 0.025, width: 0.08, height: 0.02 },
  { id: 1, name: 'Forehead (Right Superior)', x: 0.55, y: 0.005, width: 0.08, height: 0.02 },
  { id: 1, name: 'Forehead (Right Inferior)', x: 0.55, y: 0.025, width: 0.08, height: 0.02 },
  { id: 1, name: 'Left Temple (Superior)', x: 0.33, y: 0.03, width: 0.05, height: 0.02 },
  { id: 1, name: 'Left Temple (Inferior)', x: 0.33, y: 0.05, width: 0.05, height: 0.02 },
  { id: 1, name: 'Right Temple (Superior)', x: 0.62, y: 0.03, width: 0.05, height: 0.02 },
  { id: 1, name: 'Right Temple (Inferior)', x: 0.62, y: 0.05, width: 0.05, height: 0.02 },
  { id: 1, name: 'Left Eyebrow', x: 0.38, y: 0.045, width: 0.07, height: 0.01 },
  { id: 1, name: 'Right Eyebrow', x: 0.55, y: 0.045, width: 0.07, height: 0.01 },
  { id: 1, name: 'Glabella (Between Eyebrows)', x: 0.475, y: 0.05, width: 0.05, height: 0.01 },
  { id: 1, name: 'Left Upper Eyelid', x: 0.39, y: 0.058, width: 0.06, height: 0.01 },
  { id: 1, name: 'Right Upper Eyelid', x: 0.55, y: 0.058, width: 0.06, height: 0.01 },
  { id: 1, name: 'Left Lower Eyelid', x: 0.39, y: 0.068, width: 0.06, height: 0.01 },
  { id: 1, name: 'Right Lower Eyelid', x: 0.55, y: 0.068, width: 0.06, height: 0.01 },
  { id: 1, name: 'Nose (Bridge)', x: 0.475, y: 0.07, width: 0.05, height: 0.015 },
  { id: 1, name: 'Nose (Dorsum)', x: 0.475, y: 0.085, width: 0.05, height: 0.015 },
  { id: 1, name: 'Nose (Left Ala)', x: 0.45, y: 0.095, width: 0.03, height: 0.02 },
  { id: 1, name: 'Nose (Right Ala)', x: 0.52, y: 0.095, width: 0.03, height: 0.02 },
  { id: 1, name: 'Nose (Tip)', x: 0.485, y: 0.105, width: 0.03, height: 0.01 },
  { id: 1, name: 'Left Cheek (Zygomatic Arch)', x: 0.35, y: 0.075, width: 0.1, height: 0.02 },
  { id: 1, name: 'Right Cheek (Zygomatic Arch)', x: 0.55, y: 0.075, width: 0.1, height: 0.02 },
  { id: 1, name: 'Left Cheek (Buccal Mid)', x: 0.36, y: 0.095, width: 0.1, height: 0.025 },
  { id: 1, name: 'Right Cheek (Buccal Mid)', x: 0.54, y: 0.095, width: 0.1, height: 0.025 },
  { id: 1, name: 'Philtrum (Above Upper Lip)', x: 0.475, y: 0.11, width: 0.05, height: 0.01 },
  { id: 1, name: 'Upper Lip', x: 0.455, y: 0.12, width: 0.09, height: 0.01 },
  { id: 1, name: 'Lower Lip', x: 0.455, y: 0.13, width: 0.09, height: 0.01 },
  { id: 1, name: 'Chin (Mentum)', x: 0.465, y: 0.14, width: 0.07, height: 0.015 },
  { id: 1, name: 'Left Mandible (Angle)', x: 0.35, y: 0.125, width: 0.05, height: 0.03 },
  { id: 1, name: 'Right Mandible (Angle)', x: 0.60, y: 0.125, width: 0.05, height: 0.03 },
  { id: 2, name: 'Submental Triangle (Under Chin)', x: 0.46, y: 0.15, width: 0.08, height: 0.015 },
  { id: 2, name: 'Anterior Neck (Hyoid Area)', x: 0.46, y: 0.165, width: 0.08, height: 0.015 },
  { id: 2, name: 'Anterior Neck (Thyroid Cartilage)', x: 0.46, y: 0.18, width: 0.08, height: 0.015 },
  { id: 2, name: 'Anterior Neck (Left Carotid Triangle)', x: 0.40, y: 0.16, width: 0.06, height: 0.03 },
  { id: 2, name: 'Anterior Neck (Right Carotid Triangle)', x: 0.54, y: 0.16, width: 0.06, height: 0.03 },
  { id: 2, name: 'Suprasternal Notch', x: 0.475, y: 0.195, width: 0.05, height: 0.01 },
  { id: 3, name: 'Left Sternoclavicular Joint', x: 0.43, y: 0.195, width: 0.04, height: 0.02 },
  { id: 3, name: 'Left Clavicle (Mid)', x: 0.35, y: 0.19, width: 0.07, height: 0.02 },
  { id: 3, name: 'Left Acromioclavicular Joint', x: 0.28, y: 0.195, width: 0.05, height: 0.02 },
  { id: 4, name: 'Right Sternoclavicular Joint', x: 0.53, y: 0.195, width: 0.04, height: 0.02 },
  { id: 4, name: 'Right Clavicle (Mid)', x: 0.58, y: 0.19, width: 0.07, height: 0.02 },
  { id: 4, name: 'Right Acromioclavicular Joint', x: 0.67, y: 0.195, width: 0.05, height: 0.02 },
  { id: 5, name: 'Manubrium', x: 0.475, y: 0.21, width: 0.05, height: 0.03 },
  { id: 5, name: 'Sternal Body (Upper)', x: 0.475, y: 0.24, width: 0.05, height: 0.04 },
  { id: 5, name: 'Sternal Body (Lower)', x: 0.475, y: 0.28, width: 0.05, height: 0.04 },
  { id: 6, name: 'Left Pectoral (Superior Medial)', x: 0.40, y: 0.22, width: 0.07, height: 0.04 },
  { id: 6, name: 'Left Pectoral (Superior Lateral)', x: 0.29, y: 0.22, width: 0.11, height: 0.04 },
  { id: 6, name: 'Left Pectoral (Inferior Medial)', x: 0.40, y: 0.26, width: 0.07, height: 0.04 },
  { id: 6, name: 'Left Pectoral (Inferior Lateral)', x: 0.29, y: 0.26, width: 0.11, height: 0.04 },
  { id: 7, name: 'Right Pectoral (Superior Medial)', x: 0.53, y: 0.22, width: 0.07, height: 0.04 },
  { id: 7, name: 'Right Pectoral (Superior Lateral)', x: 0.60, y: 0.22, width: 0.11, height: 0.04 },
  { id: 7, name: 'Right Pectoral (Inferior Medial)', x: 0.53, y: 0.26, width: 0.07, height: 0.04 },
  { id: 7, name: 'Right Pectoral (Inferior Lateral)', x: 0.60, y: 0.26, width: 0.11, height: 0.04 },
  { id: 12, name: 'Epigastrium (Central)', x: 0.46, y: 0.32, width: 0.08, height: 0.04 },
  { id: 13, name: 'Left Costal Margin (Upper Abdomen)', x: 0.35, y: 0.32, width: 0.1, height: 0.05 },
  { id: 14, name: 'Right Costal Margin (Upper Abdomen)', x: 0.55, y: 0.32, width: 0.1, height: 0.05 },
  { id: 15, name: 'Umbilicus', x: 0.48, y: 0.38, width: 0.04, height: 0.03 },
  { id: 16, name: 'Left Flank (Mid Abdomen)', x: 0.35, y: 0.37, width: 0.1, height: 0.06 },
  { id: 17, name: 'Right Flank (Mid Abdomen)', x: 0.55, y: 0.37, width: 0.1, height: 0.06 },
  { id: 18, name: 'Left Lower Abdomen (Inguinal Ligament Area)', x: 0.37, y: 0.44, width: 0.08, height: 0.04 },
  { id: 19, name: 'Right Lower Abdomen (Inguinal Ligament Area)', x: 0.55, y: 0.44, width: 0.08, height: 0.04 },
  { id: 20, name: 'Pubic Symphysis Area', x: 0.47, y: 0.49, width: 0.06, height: 0.03 },
  { id: 8, name: 'Left Shoulder (Deltoid - Anterior)', x: 0.26, y: 0.20, width: 0.06, height: 0.05 },
  { id: 8, name: 'Left Biceps (Short Head)', x: 0.25, y: 0.25, width: 0.05, height: 0.08 },
  { id: 8, name: 'Left Biceps (Long Head)', x: 0.22, y: 0.27, width: 0.04, height: 0.08 },
  { id: 8, name: 'Left Elbow Crease (Medial)', x: 0.22, y: 0.36, width: 0.03, height: 0.03 },
  { id: 8, name: 'Left Elbow Crease (Lateral)', x: 0.18, y: 0.36, width: 0.03, height: 0.03 },
  { id: 9, name: 'Right Shoulder (Deltoid - Anterior)', x: 0.68, y: 0.20, width: 0.06, height: 0.05 },
  { id: 9, name: 'Right Biceps (Short Head)', x: 0.70, y: 0.25, width: 0.05, height: 0.08 },
  { id: 9, name: 'Right Biceps (Long Head)', x: 0.74, y: 0.27, width: 0.04, height: 0.08 },
  { id: 9, name: 'Right Elbow Crease (Medial)', x: 0.75, y: 0.36, width: 0.03, height: 0.03 },
  { id: 9, name: 'Right Elbow Crease (Lateral)', x: 0.79, y: 0.36, width: 0.03, height: 0.03 },
  { id: 10, name: 'Left Forearm (Volar - Proximal Medial)', x: 0.20, y: 0.40, width: 0.04, height: 0.06 },
  { id: 10, name: 'Left Forearm (Volar - Proximal Lateral)', x: 0.16, y: 0.40, width: 0.04, height: 0.06 },
  { id: 10, name: 'Left Forearm (Volar - Distal Medial)', x: 0.19, y: 0.46, width: 0.04, height: 0.06 },
  { id: 10, name: 'Left Forearm (Volar - Distal Lateral)', x: 0.15, y: 0.46, width: 0.04, height: 0.06 },
  { id: 10, name: 'Left Wrist (Palmar Crease)', x: 0.17, y: 0.52, width: 0.05, height: 0.02 },
  { id: 10, name: 'Left Palm (Base of Thumb)', x: 0.15, y: 0.54, width: 0.03, height: 0.03 },
  { id: 10, name: 'Left Palm (Base of Pinky)', x: 0.19, y: 0.55, width: 0.02, height: 0.03 },
  { id: 10, name: 'Left Palm (Center)', x: 0.17, y: 0.56, width: 0.03, height: 0.03 },
  { id: 10, name: 'Left Thumb (Volar)', x: 0.13, y: 0.58, width: 0.02, height: 0.05 },
  { id: 10, name: 'Left Index Finger (Volar)', x: 0.14, y: 0.61, width: 0.02, height: 0.05 },
  { id: 10, name: 'Left Middle Finger (Volar)', x: 0.16, y: 0.62, width: 0.02, height: 0.05 },
  { id: 10, name: 'Left Ring Finger (Volar)', x: 0.18, y: 0.61, width: 0.02, height: 0.05 },
  { id: 10, name: 'Left Pinky Finger (Volar)', x: 0.20, y: 0.60, width: 0.02, height: 0.05 },
  { id: 11, name: 'Right Forearm (Volar - Proximal Medial)', x: 0.76, y: 0.40, width: 0.04, height: 0.06 },
  { id: 11, name: 'Right Forearm (Volar - Proximal Lateral)', x: 0.80, y: 0.40, width: 0.04, height: 0.06 },
  { id: 11, name: 'Right Forearm (Volar - Distal Medial)', x: 0.77, y: 0.46, width: 0.04, height: 0.06 },
  { id: 11, name: 'Right Forearm (Volar - Distal Lateral)', x: 0.81, y: 0.46, width: 0.04, height: 0.06 },
  { id: 11, name: 'Right Wrist (Palmar Crease)', x: 0.78, y: 0.52, width: 0.05, height: 0.02 },
  { id: 11, name: 'Right Palm (Base of Thumb)', x: 0.82, y: 0.54, width: 0.03, height: 0.03 },
  { id: 11, name: 'Right Palm (Base of Pinky)', x: 0.78, y: 0.55, width: 0.02, height: 0.03 },
  { id: 11, name: 'Right Palm (Center)', x: 0.80, y: 0.56, width: 0.03, height: 0.03 },
  { id: 11, name: 'Right Thumb (Volar)', x: 0.85, y: 0.58, width: 0.02, height: 0.05 },
  { id: 11, name: 'Right Index Finger (Volar)', x: 0.84, y: 0.61, width: 0.02, height: 0.05 },
  { id: 11, name: 'Right Middle Finger (Volar)', x: 0.82, y: 0.62, width: 0.02, height: 0.05 },
  { id: 11, name: 'Right Ring Finger (Volar)', x: 0.80, y: 0.61, width: 0.02, height: 0.05 },
  { id: 11, name: 'Right Pinky Finger (Volar)', x: 0.78, y: 0.60, width: 0.02, height: 0.05 },
  { id: 21, name: 'Left Hip (Greater Trochanter Area - Anterior)', x: 0.28, y: 0.49, width: 0.06, height: 0.06 },
  { id: 21, name: 'Left Thigh (Anterior Superior)', x: 0.33, y: 0.54, width: 0.1, height: 0.07 },
  { id: 21, name: 'Left Thigh (Anterior Medial)', x: 0.38, y: 0.60, width: 0.06, height: 0.1 },
  { id: 21, name: 'Left Thigh (Anterior Lateral)', x: 0.29, y: 0.60, width: 0.06, height: 0.1 },
  { id: 21, name: 'Left Knee (Suprapatellar)', x: 0.34, y: 0.69, width: 0.09, height: 0.03 },
  { id: 21, name: 'Left Patella', x: 0.345, y: 0.72, width: 0.08, height: 0.04 },
  { id: 21, name: 'Left Knee (Infrapatellar Medial)', x: 0.38, y: 0.76, width: 0.04, height: 0.03 },
  { id: 21, name: 'Left Knee (Infrapatellar Lateral)', x: 0.31, y: 0.76, width: 0.04, height: 0.03 },
  { id: 22, name: 'Right Hip (Greater Trochanter Area - Anterior)', x: 0.66, y: 0.49, width: 0.06, height: 0.06 },
  { id: 22, name: 'Right Thigh (Anterior Superior)', x: 0.57, y: 0.54, width: 0.1, height: 0.07 },
  { id: 22, name: 'Right Thigh (Anterior Medial)', x: 0.56, y: 0.60, width: 0.06, height: 0.1 },
  { id: 22, name: 'Right Thigh (Anterior Lateral)', x: 0.65, y: 0.60, width: 0.06, height: 0.1 },
  { id: 22, name: 'Right Knee (Suprapatellar)', x: 0.57, y: 0.69, width: 0.09, height: 0.03 },
  { id: 22, name: 'Right Patella', x: 0.575, y: 0.72, width: 0.08, height: 0.04 },
  { id: 22, name: 'Right Knee (Infrapatellar Medial)', x: 0.58, y: 0.76, width: 0.04, height: 0.03 },
  { id: 22, name: 'Right Knee (Infrapatellar Lateral)', x: 0.65, y: 0.76, width: 0.04, height: 0.03 },
  { id: 23, name: 'Left Shin (Tibial Tuberosity)', x: 0.35, y: 0.79, width: 0.07, height: 0.03 },
  { id: 23, name: 'Left Shin (Anteromedial)', x: 0.37, y: 0.82, width: 0.06, height: 0.08 },
  { id: 23, name: 'Left Shin (Anterolateral)', x: 0.30, y: 0.82, width: 0.06, height: 0.08 },
  { id: 23, name: 'Left Ankle (Medial Malleolus - Anterior)', x: 0.38, y: 0.90, width: 0.03, height: 0.03 },
  { id: 23, name: 'Left Ankle (Lateral Malleolus - Anterior)', x: 0.30, y: 0.90, width: 0.03, height: 0.03 },
  { id: 23, name: 'Left Foot (Dorsum - Navicular/Cuneiforms)', x: 0.35, y: 0.925, width: 0.06, height: 0.02 },
  { id: 23, name: 'Left Foot (Dorsum - Cuboid/Metatarsals)', x: 0.30, y: 0.93, width: 0.05, height: 0.02 },
  { id: 23, name: 'Left Hallux (Big Toe - Dorsal)', x: 0.37, y: 0.95, width: 0.03, height: 0.03 },
  { id: 23, name: 'Left Toes 2-5 (Dorsal)', x: 0.31, y: 0.955, width: 0.05, height: 0.03 },
  { id: 24, name: 'Right Shin (Tibial Tuberosity)', x: 0.58, y: 0.79, width: 0.07, height: 0.03 },
  { id: 24, name: 'Right Shin (Anteromedial)', x: 0.57, y: 0.82, width: 0.06, height: 0.08 },
  { id: 24, name: 'Right Shin (Anterolateral)', x: 0.64, y: 0.82, width: 0.06, height: 0.08 },
  { id: 24, name: 'Right Ankle (Medial Malleolus - Anterior)', x: 0.59, y: 0.90, width: 0.03, height: 0.03 },
  { id: 24, name: 'Right Ankle (Lateral Malleolus - Anterior)', x: 0.67, y: 0.90, width: 0.03, height: 0.03 },
  { id: 24, name: 'Right Foot (Dorsum - Navicular/Cuneiforms)', x: 0.59, y: 0.925, width: 0.06, height: 0.02 },
  { id: 24, name: 'Right Foot (Dorsum - Cuboid/Metatarsals)', x: 0.65, y: 0.93, width: 0.05, height: 0.02 },
  { id: 24, name: 'Right Hallux (Big Toe - Dorsal)', x: 0.60, y: 0.95, width: 0.03, height: 0.03 },
  { id: 24, name: 'Right Toes 2-5 (Dorsal)', x: 0.64, y: 0.955, width: 0.05, height: 0.03 },
];

const backHotspots: Hotspot[] = [
  // Region 25: Head/Neck (Posterior)
  { id: 25, name: 'Vertex (Top of Head - Posterior)', x: 0.45, y: 0.005, width: 0.1, height: 0.02 },
  { id: 25, name: 'Occiput (Superior Nuchal Line - Left)', x: 0.40, y: 0.025, width: 0.07, height: 0.03 },
  { id: 25, name: 'Occiput (Superior Nuchal Line - Right)', x: 0.53, y: 0.025, width: 0.07, height: 0.03 },
  { id: 25, name: 'Occiput (Inion/External Occipital Protuberance)', x: 0.475, y: 0.05, width: 0.05, height: 0.02 },
  { id: 25, name: 'Posterior Neck (Suboccipital - Left)', x: 0.42, y: 0.07, width: 0.06, height: 0.03 },
  { id: 25, name: 'Posterior Neck (Suboccipital - Right)', x: 0.52, y: 0.07, width: 0.06, height: 0.03 },
  { id: 25, name: 'Cervical Spine (C2-C4 Spinous Processes)', x: 0.475, y: 0.10, width: 0.05, height: 0.03 },
  { id: 25, name: 'Cervical Spine (C5-C7 Spinous Processes)', x: 0.475, y: 0.13, width: 0.05, height: 0.03 },
  { id: 25, name: 'Posterior Neck (Lateral - Left)', x: 0.39, y: 0.10, width: 0.06, height: 0.05 },
  { id: 25, name: 'Posterior Neck (Lateral - Right)', x: 0.55, y: 0.10, width: 0.06, height: 0.05 },

  // Region 26: Left Upper Back / Shoulder Blade Area
  { id: 26, name: 'Left Acromion (Posterior)', x: 0.28, y: 0.16, width: 0.05, height: 0.03 },
  { id: 26, name: 'Left Supraspinatus Area', x: 0.33, y: 0.17, width: 0.08, height: 0.04 },
  { id: 26, name: 'Left Scapular Spine', x: 0.30, y: 0.21, width: 0.12, height: 0.02 },
  { id: 26, name: 'Left Infraspinatus Area', x: 0.32, y: 0.23, width: 0.1, height: 0.06 },
  { id: 26, name: 'Left Teres Major/Minor Area', x: 0.28, y: 0.25, width: 0.07, height: 0.05 },

  // Region 27: Right Upper Back / Shoulder Blade Area
  { id: 27, name: 'Right Acromion (Posterior)', x: 0.67, y: 0.16, width: 0.05, height: 0.03 },
  { id: 27, name: 'Right Supraspinatus Area', x: 0.59, y: 0.17, width: 0.08, height: 0.04 },
  { id: 27, name: 'Right Scapular Spine', x: 0.58, y: 0.21, width: 0.12, height: 0.02 },
  { id: 27, name: 'Right Infraspinatus Area', x: 0.58, y: 0.23, width: 0.1, height: 0.06 },
  { id: 27, name: 'Right Teres Major/Minor Area', x: 0.65, y: 0.25, width: 0.07, height: 0.05 },
  
  // Region 28: Left Upper Arm (Posterior)
  { id: 28, name: 'Left Deltoid (Posterior Head)', x: 0.28, y: 0.19, width: 0.06, height: 0.06 },
  { id: 28, name: 'Left Triceps (Lateral Head)', x: 0.25, y: 0.25, width: 0.05, height: 0.09 },
  { id: 28, name: 'Left Triceps (Long Head)', x: 0.29, y: 0.26, width: 0.05, height: 0.09 },
  
  // Region 29: Right Upper Arm (Posterior)
  { id: 29, name: 'Right Deltoid (Posterior Head)', x: 0.66, y: 0.19, width: 0.06, height: 0.06 },
  { id: 29, name: 'Right Triceps (Lateral Head)', x: 0.70, y: 0.25, width: 0.05, height: 0.09 },
  { id: 29, name: 'Right Triceps (Long Head)', x: 0.66, y: 0.26, width: 0.05, height: 0.09 },

  // Region 30: Left Elbow/Forearm (Posterior)
  { id: 30, name: 'Left Olecranon (Elbow Tip)', x: 0.24, y: 0.35, width: 0.04, height: 0.03 },
  { id: 30, name: 'Left Forearm (Dorsal - Proximal Ulnar)', x: 0.23, y: 0.38, width: 0.04, height: 0.06 },
  { id: 30, name: 'Left Forearm (Dorsal - Proximal Radial)', x: 0.19, y: 0.39, width: 0.04, height: 0.06 },
  { id: 30, name: 'Left Forearm (Dorsal - Distal Ulnar)', x: 0.22, y: 0.44, width: 0.04, height: 0.07 },
  { id: 30, name: 'Left Forearm (Dorsal - Distal Radial)', x: 0.18, y: 0.45, width: 0.04, height: 0.07 },
  
  // Region 31: Right Elbow/Forearm (Posterior)
  { id: 31, name: 'Right Olecranon (Elbow Tip)', x: 0.72, y: 0.35, width: 0.04, height: 0.03 },
  { id: 31, name: 'Right Forearm (Dorsal - Proximal Ulnar)', x: 0.73, y: 0.38, width: 0.04, height: 0.06 },
  { id: 31, name: 'Right Forearm (Dorsal - Proximal Radial)', x: 0.77, y: 0.39, width: 0.04, height: 0.06 },
  { id: 31, name: 'Right Forearm (Dorsal - Distal Ulnar)', x: 0.74, y: 0.44, width: 0.04, height: 0.07 },
  { id: 31, name: 'Right Forearm (Dorsal - Distal Radial)', x: 0.78, y: 0.45, width: 0.04, height: 0.07 },

  // Region 32: Left Hand (Dorsal)
  { id: 32, name: 'Left Wrist (Dorsum)', x: 0.20, y: 0.51, width: 0.05, height: 0.03 },
  { id: 32, name: 'Left Hand (Dorsum - Metacarpals)', x: 0.18, y: 0.54, width: 0.06, height: 0.05 },
  { id: 32, name: 'Left Thumb (Dorsal)', x: 0.15, y: 0.57, width: 0.02, height: 0.04 },
  { id: 32, name: 'Left Fingers 2-5 (Dorsal)', x: 0.17, y: 0.59, width: 0.05, height: 0.05 },

  // Region 33: Right Hand (Dorsal)
  { id: 33, name: 'Right Wrist (Dorsum)', x: 0.75, y: 0.51, width: 0.05, height: 0.03 },
  { id: 33, name: 'Right Hand (Dorsum - Metacarpals)', x: 0.76, y: 0.54, width: 0.06, height: 0.05 },
  { id: 33, name: 'Right Thumb (Dorsal)', x: 0.83, y: 0.57, width: 0.02, height: 0.04 },
  { id: 33, name: 'Right Fingers 2-5 (Dorsal)', x: 0.78, y: 0.59, width: 0.05, height: 0.05 },

  // Region 34: Left Mid Back (Para-thoracic)
  { id: 34, name: 'Thoracic Spine (T1-T2 - Left Paraspinal)', x: 0.475, y: 0.16, width: 0.025, height: 0.04 },
  { id: 34, name: 'Thoracic Spine (T3-T5 - Left Paraspinal)', x: 0.475, y: 0.20, width: 0.025, height: 0.05 },
  { id: 34, name: 'Thoracic Spine (T6-T9 - Left Paraspinal)', x: 0.475, y: 0.25, width: 0.025, height: 0.07 },
  { id: 34, name: 'Thoracic Spine (T10-T12 - Left Paraspinal)', x: 0.475, y: 0.32, width: 0.025, height: 0.06 },
  { id: 34, name: 'Left Upper Trapezius', x: 0.38, y: 0.16, width: 0.08, height: 0.06 },
  { id: 34, name: 'Left Mid Trapezius/Rhomboids', x: 0.40, y: 0.22, width: 0.07, height: 0.08 },
  { id: 34, name: 'Left Upper Trapezius (Superior Medial)', x: 0.42, y: 0.15, width: 0.04, height: 0.03 },
  { id: 34, name: 'Left Upper Trapezius (Superior Lateral)', x: 0.37, y: 0.15, width: 0.04, height: 0.03 },
  { id: 34, name: 'Left Upper Trapezius (Inferior Medial)', x: 0.42, y: 0.19, width: 0.04, height: 0.03 },
  { id: 34, name: 'Left Upper Trapezius (Inferior Lateral)', x: 0.37, y: 0.19, width: 0.04, height: 0.03 },
  { id: 34, name: 'Left Mid Traps (Superior Medial)', x: 0.43, y: 0.21, width: 0.035, height: 0.04 },
  { id: 34, name: 'Left Mid Traps (Superior Lateral)', x: 0.39, y: 0.21, width: 0.035, height: 0.04 },
  { id: 34, name: 'Left Mid Traps (Inferior Medial)', x: 0.43, y: 0.26, width: 0.035, height: 0.04 },
  { id: 34, name: 'Left Mid Traps (Inferior Lateral)', x: 0.39, y: 0.26, width: 0.035, height: 0.04 },

  // Region 35: Right Mid Back (Para-thoracic)
  { id: 35, name: 'Thoracic Spine (T1-T2 - Right Paraspinal)', x: 0.50, y: 0.16, width: 0.025, height: 0.04 },
  { id: 35, name: 'Thoracic Spine (T3-T5 - Right Paraspinal)', x: 0.50, y: 0.20, width: 0.025, height: 0.05 },
  { id: 35, name: 'Thoracic Spine (T6-T9 - Right Paraspinal)', x: 0.50, y: 0.25, width: 0.025, height: 0.07 },
  { id: 35, name: 'Thoracic Spine (T10-T12 - Right Paraspinal)', x: 0.50, y: 0.32, width: 0.025, height: 0.06 },
  { id: 35, name: 'Right Upper Trapezius', x: 0.54, y: 0.16, width: 0.08, height: 0.06 },
  { id: 35, name: 'Right Mid Trapezius/Rhomboids', x: 0.53, y: 0.22, width: 0.07, height: 0.08 },
  { id: 35, name: 'Right Upper Trapezius (Superior Medial)', x: 0.55, y: 0.15, width: 0.04, height: 0.03 },
  { id: 35, name: 'Right Upper Trapezius (Superior Lateral)', x: 0.60, y: 0.15, width: 0.04, height: 0.03 },
  { id: 35, name: 'Right Upper Trapezius (Inferior Medial)', x: 0.55, y: 0.19, width: 0.04, height: 0.03 },
  { id: 35, name: 'Right Upper Trapezius (Inferior Lateral)', x: 0.60, y: 0.19, width: 0.04, height: 0.03 },
  { id: 35, name: 'Right Mid Traps (Superior Medial)', x: 0.53, y: 0.21, width: 0.035, height: 0.04 },
  { id: 35, name: 'Right Mid Traps (Superior Lateral)', x: 0.57, y: 0.21, width: 0.035, height: 0.04 },
  { id: 35, name: 'Right Mid Traps (Inferior Medial)', x: 0.53, y: 0.26, width: 0.035, height: 0.04 },
  { id: 35, name: 'Right Mid Traps (Inferior Lateral)', x: 0.57, y: 0.26, width: 0.035, height: 0.04 },
  
  // Region 36: Left Lower Back / Flank
  { id: 36, name: 'Left Latissimus Dorsi (Upper Back)', x: 0.33, y: 0.28, width: 0.12, height: 0.1 },
  { id: 36, name: 'Left Lower Back (Flank - Thoracolumbar)', x: 0.35, y: 0.38, width: 0.1, height: 0.06 },
  
  // Region 37: Right Lower Back / Flank
  { id: 37, name: 'Right Latissimus Dorsi (Upper Back)', x: 0.55, y: 0.28, width: 0.12, height: 0.1 },
  { id: 37, name: 'Right Lower Back (Flank - Thoracolumbar)', x: 0.55, y: 0.38, width: 0.1, height: 0.06 },

  // Region 38: Left Buttock / Upper Posterior Thigh
  { id: 38, name: 'Lumbar Spine (L1-L3 - Left Paraspinal)', x: 0.475, y: 0.39, width: 0.025, height: 0.05 },
  { id: 38, name: 'Lumbar Spine (L4-L5 - Left Paraspinal)', x: 0.475, y: 0.44, width: 0.025, height: 0.04 },
  { id: 38, name: 'Left Lumbar Erector Spinae', x: 0.41, y: 0.39, width: 0.06, height: 0.09 },
  { id: 38, name: 'L Gluteal (Superior)', x: 0.35, y: 0.48, width: 0.1, height: 0.05 },
  { id: 38, name: 'L Gluteal (Mid-Lateral)', x: 0.29, y: 0.51, width: 0.07, height: 0.07 },
  { id: 38, name: 'L Gluteal (Mid-Medial)', x: 0.36, y: 0.53, width: 0.08, height: 0.06 },
  { id: 38, name: 'L Ischial Tuberosity Area', x: 0.38, y: 0.58, width: 0.06, height: 0.03 },
  { id: 38, name: 'L UpperOuterLumbar S1', x: 0.39, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S2', x: 0.40, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S3', x: 0.41, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S4', x: 0.42, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S5', x: 0.39, y: 0.38, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S6', x: 0.40, y: 0.38, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S7', x: 0.41, y: 0.38, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S8', x: 0.42, y: 0.38, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S9', x: 0.39, y: 0.39, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S10', x: 0.40, y: 0.39, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S11', x: 0.41, y: 0.39, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S12', x: 0.42, y: 0.39, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S13', x: 0.39, y: 0.40, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S14', x: 0.40, y: 0.40, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S15', x: 0.41, y: 0.40, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S16', x: 0.42, y: 0.40, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S17', x: 0.43, y: 0.385, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S18', x: 0.43, y: 0.395, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S19', x: 0.385, y: 0.38, width: 0.01, height: 0.01 },
  { id: 38, name: 'L UpperOuterLumbar S20', x: 0.385, y: 0.39, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar TopOuter A1', x: 0.39, y: 0.375, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar TopOuter A2', x: 0.40, y: 0.375, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar TopOuter A3', x: 0.39, y: 0.385, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar TopOuter A4', x: 0.40, y: 0.385, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar TopOuter B1', x: 0.38, y: 0.39, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar TopOuter B2', x: 0.39, y: 0.39, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar TopOuter B3', x: 0.38, y: 0.40, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar TopOuter B4', x: 0.39, y: 0.40, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar UpperLat C1', x: 0.395, y: 0.405, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar UpperLat C2', x: 0.405, y: 0.405, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar UpperLat C3', x: 0.395, y: 0.415, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar UpperLat C4', x: 0.405, y: 0.415, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar ES (SupLat 1)', x: 0.40, y: 0.38, width: 0.015, height: 0.015 },
  { id: 38, name: 'L Lumbar ES (SupLat 2)', x: 0.415, y: 0.38, width: 0.015, height: 0.015 },
  { id: 38, name: 'L Lumbar ES (SupLat 3)', x: 0.40, y: 0.395, width: 0.015, height: 0.015 },
  { id: 38, name: 'L Lumbar ES (SupMid 1)', x: 0.43, y: 0.38, width: 0.015, height: 0.015 },
  { id: 38, name: 'L Lumbar ES (SupMid 2)', x: 0.445, y: 0.38, width: 0.015, height: 0.015 },
  { id: 38, name: 'L Lumbar ES (SupMid 3)', x: 0.43, y: 0.395, width: 0.015, height: 0.015 },
  { id: 38, name: 'L Lumbar ES (MidLat 1)', x: 0.40, y: 0.41, width: 0.015, height: 0.015 },
  { id: 38, name: 'L Lumbar ES (MidLat 2)', x: 0.415, y: 0.41, width: 0.015, height: 0.015 },
  { id: 38, name: 'L Lumbar ES (MidLat 3)', x: 0.40, y: 0.425, width: 0.015, height: 0.015 },
  { id: 38, name: 'L Lumbar Para (Sup 1)', x: 0.45, y: 0.38, width: 0.012, height: 0.01 },
  { id: 38, name: 'L Lumbar Para (Sup 2)', x: 0.462, y: 0.38, width: 0.013, height: 0.01 },
  { id: 38, name: 'L Lumbar Para (Sup 3)', x: 0.45, y: 0.39, width: 0.012, height: 0.01 },
  { id: 38, name: 'L Lumbar Para (Mid 1)', x: 0.45, y: 0.40, width: 0.012, height: 0.01 },
  { id: 38, name: 'L Lumbar Para (Mid 2)', x: 0.462, y: 0.40, width: 0.013, height: 0.01 },
  { id: 38, name: 'L Lumbar Para (Mid 3)', x: 0.45, y: 0.41, width: 0.012, height: 0.01 },
  { id: 38, name: 'L Lumbar (TL 1a)', x: 0.40, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar (TL 1b)', x: 0.41, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar (TL 2a)', x: 0.42, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar (TL 2b)', x: 0.43, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar (TL 3a)', x: 0.40, y: 0.38, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar (TL 3b)', x: 0.41, y: 0.38, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar (TC 1a)', x: 0.44, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar (TC 1b)', x: 0.45, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar (TC 2a)', x: 0.46, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Lumbar (TC 2b)', x: 0.47, y: 0.37, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute SupLat (A1)', x: 0.30, y: 0.47, width: 0.02, height: 0.015 },
  { id: 38, name: 'L Glute SupLat (A2)', x: 0.32, y: 0.47, width: 0.02, height: 0.015 },
  { id: 38, name: 'L Glute SupLat (B1)', x: 0.33, y: 0.475, width: 0.02, height: 0.015 },
  { id: 38, name: 'L Glute SupLat (B2)', x: 0.35, y: 0.475, width: 0.02, height: 0.015 },
  { id: 38, name: 'L Glute SupMidLat (1)', x: 0.29, y: 0.49, width: 0.025, height: 0.015 },
  { id: 38, name: 'L Glute SupMidLat (2)', x: 0.315, y: 0.49, width: 0.025, height: 0.015 },
  { id: 38, name: 'L Glute UpOut (1)', x: 0.28, y: 0.48, width: 0.02, height: 0.015 },
  { id: 38, name: 'L Glute UpOut (2)', x: 0.30, y: 0.48, width: 0.02, height: 0.015 },
  { id: 38, name: 'L Glute TL (1a)', x: 0.28, y: 0.47, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (1b)', x: 0.29, y: 0.47, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (2a)', x: 0.30, y: 0.46, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (2b)', x: 0.31, y: 0.46, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (3a)', x: 0.32, y: 0.47, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (3b)', x: 0.33, y: 0.47, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (4a)', x: 0.34, y: 0.46, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (4b)', x: 0.35, y: 0.46, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (5a)', x: 0.31, y: 0.485, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (5b)', x: 0.32, y: 0.485, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (6a)', x: 0.33, y: 0.495, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute TL (6b)', x: 0.34, y: 0.495, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Glute (Superior Medial 1)', x: 0.36, y: 0.48, width: 0.02, height: 0.015 },
  { id: 38, name: 'L Glute (Superior Medial 2)', x: 0.38, y: 0.48, width: 0.02, height: 0.015 },
  { id: 38, name: 'L Glute (Superior Medial 3)', x: 0.37, y: 0.49, width: 0.02, height: 0.015 },
  { id: 38, name: 'L UpperLateralThigh S1', x: 0.28, y: 0.50, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S2', x: 0.29, y: 0.50, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S3', x: 0.30, y: 0.50, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S4', x: 0.28, y: 0.52, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S5', x: 0.29, y: 0.52, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S6', x: 0.30, y: 0.52, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S7', x: 0.28, y: 0.54, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S8', x: 0.29, y: 0.54, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S9', x: 0.30, y: 0.54, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S10', x: 0.28, y: 0.56, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S11', x: 0.29, y: 0.56, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S12', x: 0.30, y: 0.56, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S13', x: 0.28, y: 0.58, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S14', x: 0.29, y: 0.58, width: 0.01, height: 0.02 },
  { id: 38, name: 'L UpperLateralThigh S15', x: 0.30, y: 0.58, width: 0.01, height: 0.02 },
  { id: 38, name: 'Left Posterior Superior Iliac Spine (PSIS)', x: 0.42, y: 0.47, width: 0.04, height: 0.03 },
  { id: 38, name: 'L Sacrum TopOuter A1', x: 0.40, y: 0.455, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum TopOuter A2', x: 0.41, y: 0.455, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum TopOuter A3', x: 0.40, y: 0.465, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum TopOuter A4', x: 0.41, y: 0.465, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum UpperLat B1', x: 0.415, y: 0.47, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum UpperLat B2', x: 0.425, y: 0.47, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum UpperLat B3', x: 0.415, y: 0.48, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum UpperLat B4', x: 0.425, y: 0.48, width: 0.01, height: 0.01 },
  { id: 38, name: 'L PSIS (Sup 1)', x: 0.42, y: 0.46, width: 0.02, height: 0.01 },
  { id: 38, name: 'L PSIS (Sup 2)', x: 0.44, y: 0.46, width: 0.02, height: 0.01 },
  { id: 38, name: 'L PSIS (Lat 1)', x: 0.40, y: 0.47, width: 0.01, height: 0.015 },
  { id: 38, name: 'L PSIS (Lat 2)', x: 0.41, y: 0.47, width: 0.01, height: 0.015 },
  { id: 38, name: 'L SI Area (Sup 1)', x: 0.44, y: 0.465, width: 0.015, height: 0.012 },
  { id: 38, name: 'L SI Area (Sup 2)', x: 0.455, y: 0.465, width: 0.015, height: 0.013 },
  { id: 38, name: 'L Sacral Ala (Sup 1)', x: 0.45, y: 0.475, width: 0.012, height: 0.01 },
  { id: 38, name: 'L Sacral Ala (Sup 2)', x: 0.462, y: 0.475, width: 0.013, height: 0.01 },
  { id: 38, name: 'L Sacrum (TL 1a)', x: 0.41, y: 0.46, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum (TL 1b)', x: 0.42, y: 0.46, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum (TL 2a)', x: 0.43, y: 0.46, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum (TL 2b)', x: 0.44, y: 0.46, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum (TL 3a)', x: 0.41, y: 0.47, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum (TL 3b)', x: 0.42, y: 0.47, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum (TL 4a)', x: 0.41, y: 0.48, width: 0.01, height: 0.01 },
  { id: 38, name: 'L Sacrum (TL 4b)', x: 0.42, y: 0.48, width: 0.01, height: 0.01 },

  // Region 39: Right Buttock / Upper Posterior Thigh
  { id: 39, name: 'Lumbar Spine (L1-L3 - Right Paraspinal)', x: 0.50, y: 0.39, width: 0.025, height: 0.05 },
  { id: 39, name: 'Lumbar Spine (L4-L5 - Right Paraspinal)', x: 0.50, y: 0.44, width: 0.025, height: 0.04 },
  { id: 39, name: 'Right Lumbar Erector Spinae', x: 0.53, y: 0.39, width: 0.06, height: 0.09 },
  { id: 39, name: 'Right Gluteal (Superior)', x: 0.55, y: 0.48, width: 0.1, height: 0.05 },
  { id: 39, name: 'R Gluteal (Mid-Lateral)', x: 0.64, y: 0.51, width: 0.07, height: 0.07 },
  { id: 39, name: 'R Gluteal (Mid-Medial)', x: 0.56, y: 0.53, width: 0.08, height: 0.06 },
  { id: 39, name: 'R Ischial Tuberosity Area', x: 0.56, y: 0.58, width: 0.06, height: 0.03 },
  { id: 39, name: 'R UpperOuterLumbar S1', x: 0.57, y: 0.37, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S2', x: 0.58, y: 0.37, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S3', x: 0.59, y: 0.37, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S4', x: 0.60, y: 0.37, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S5', x: 0.57, y: 0.38, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S6', x: 0.58, y: 0.38, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S7', x: 0.59, y: 0.38, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S8', x: 0.60, y: 0.38, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S9', x: 0.57, y: 0.39, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S10', x: 0.58, y: 0.39, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S11', x: 0.59, y: 0.39, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S12', x: 0.60, y: 0.39, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S13', x: 0.57, y: 0.40, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S14', x: 0.58, y: 0.40, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S15', x: 0.59, y: 0.40, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S16', x: 0.60, y: 0.40, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S17', x: 0.565, y: 0.385, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S18', x: 0.565, y: 0.395, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S19', x: 0.605, y: 0.38, width: 0.01, height: 0.01 },
  { id: 39, name: 'R UpperOuterLumbar S20', x: 0.605, y: 0.39, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar TopOuter A1', x: 0.59, y: 0.375, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar TopOuter A2', x: 0.58, y: 0.375, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar TopOuter A3', x: 0.59, y: 0.385, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar TopOuter A4', x: 0.58, y: 0.385, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar TopOuter B1', x: 0.60, y: 0.39, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar TopOuter B2', x: 0.59, y: 0.39, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar TopOuter B3', x: 0.60, y: 0.40, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar TopOuter B4', x: 0.59, y: 0.40, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar UpperLat C1', x: 0.585, y: 0.405, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar UpperLat C2', x: 0.575, y: 0.405, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar UpperLat C3', x: 0.585, y: 0.415, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar UpperLat C4', x: 0.575, y: 0.415, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar ES (SupLat 1)', x: 0.52, y: 0.38, width: 0.015, height: 0.015 },
  { id: 39, name: 'R Lumbar ES (SupLat 2)', x: 0.535, y: 0.38, width: 0.015, height: 0.015 },
  { id: 39, name: 'R Lumbar ES (SupLat 3)', x: 0.52, y: 0.395, width: 0.015, height: 0.015 },
  { id: 39, name: 'R Lumbar ES (SupMid 1)', x: 0.55, y: 0.38, width: 0.015, height: 0.015 },
  { id: 39, name: 'R Lumbar ES (SupMid 2)', x: 0.565, y: 0.38, width: 0.015, height: 0.015 },
  { id: 39, name: 'R Lumbar ES (SupMid 3)', x: 0.55, y: 0.395, width: 0.015, height: 0.015 },
  { id: 39, name: 'R Lumbar ES (MidLat 1)', x: 0.52, y: 0.41, width: 0.015, height: 0.015 },
  { id: 39, name: 'R Lumbar ES (MidLat 2)', x: 0.535, y: 0.41, width: 0.015, height: 0.015 },
  { id: 39, name: 'R Lumbar ES (MidLat 3)', x: 0.52, y: 0.425, width: 0.015, height: 0.015 },
  { id: 39, name: 'R Lumbar Para (Sup 1)', x: 0.50, y: 0.38, width: 0.012, height: 0.01 },
  { id: 39, name: 'R Lumbar Para (Sup 2)', x: 0.512, y: 0.38, width: 0.013, height: 0.01 },
  { id: 39, name: 'R Lumbar Para (Sup 3)', x: 0.50, y: 0.39, width: 0.012, height: 0.01 },
  { id: 39, name: 'R Lumbar Para (Mid 1)', x: 0.50, y: 0.40, width: 0.012, height: 0.01 },
  { id: 39, name: 'R Lumbar Para (Mid 2)', x: 0.512, y: 0.40, width: 0.013, height: 0.01 },
  { id: 39, name: 'R Lumbar Para (Mid 3)', x: 0.50, y: 0.41, width: 0.012, height: 0.01 },
  { id: 39, name: 'R Lumbar (TR 1a)', x: 0.57, y: 0.37, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar (TR 1b)', x: 0.58, y: 0.37, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar (TR 2a)', x: 0.55, y: 0.37, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar (TR 2b)', x: 0.56, y: 0.37, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar (TR 3a)', x: 0.57, y: 0.38, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Lumbar (TR 3b)', x: 0.58, y: 0.38, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute SupLat (A1)', x: 0.66, y: 0.47, width: 0.02, height: 0.015 },
  { id: 39, name: 'R Glute SupLat (A2)', x: 0.64, y: 0.47, width: 0.02, height: 0.015 },
  { id: 39, name: 'R Glute SupLat (B1)', x: 0.63, y: 0.475, width: 0.02, height: 0.015 },
  { id: 39, name: 'R Glute SupLat (B2)', x: 0.61, y: 0.475, width: 0.02, height: 0.015 },
  { id: 39, name: 'R Glute SupMidLat (1)', x: 0.66, y: 0.49, width: 0.025, height: 0.015 },
  { id: 39, name: 'R Glute SupMidLat (2)', x: 0.635, y: 0.49, width: 0.025, height: 0.015 },
  { id: 39, name: 'R Glute UpOut (1)', x: 0.68, y: 0.48, width: 0.02, height: 0.015 },
  { id: 39, name: 'R Glute UpOut (2)', x: 0.66, y: 0.48, width: 0.02, height: 0.015 },
  { id: 39, name: 'R Glute TR (1a)', x: 0.68, y: 0.47, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (1b)', x: 0.67, y: 0.47, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (2a)', x: 0.66, y: 0.46, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (2b)', x: 0.65, y: 0.46, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (3a)', x: 0.64, y: 0.47, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (3b)', x: 0.63, y: 0.47, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (4a)', x: 0.62, y: 0.46, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (4b)', x: 0.61, y: 0.46, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (5a)', x: 0.65, y: 0.485, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (5b)', x: 0.64, y: 0.485, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (6a)', x: 0.63, y: 0.495, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute TR (6b)', x: 0.62, y: 0.495, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Glute (Superior Medial 1)', x: 0.60, y: 0.48, width: 0.02, height: 0.015 },
  { id: 39, name: 'R Glute (Superior Medial 2)', x: 0.58, y: 0.48, width: 0.02, height: 0.015 },
  { id: 39, name: 'R Glute (Superior Medial 3)', x: 0.59, y: 0.49, width: 0.02, height: 0.015 },
  { id: 39, name: 'R UpperLateralThigh S1', x: 0.68, y: 0.50, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S2', x: 0.69, y: 0.50, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S3', x: 0.70, y: 0.50, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S4', x: 0.68, y: 0.52, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S5', x: 0.69, y: 0.52, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S6', x: 0.70, y: 0.52, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S7', x: 0.68, y: 0.54, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S8', x: 0.69, y: 0.54, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S9', x: 0.70, y: 0.54, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S10', x: 0.68, y: 0.56, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S11', x: 0.69, y: 0.56, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S12', x: 0.70, y: 0.56, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S13', x: 0.68, y: 0.58, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S14', x: 0.69, y: 0.58, width: 0.01, height: 0.02 },
  { id: 39, name: 'R UpperLateralThigh S15', x: 0.70, y: 0.58, width: 0.01, height: 0.02 },
  { id: 39, name: 'Right Posterior Superior Iliac Spine (PSIS)', x: 0.54, y: 0.47, width: 0.04, height: 0.03 },
  { id: 39, name: 'R Sacrum TopOuter A1', x: 0.58, y: 0.455, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum TopOuter A2', x: 0.57, y: 0.455, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum TopOuter A3', x: 0.58, y: 0.465, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum TopOuter A4', x: 0.57, y: 0.465, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum UpperLat B1', x: 0.565, y: 0.47, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum UpperLat B2', x: 0.555, y: 0.47, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum UpperLat B3', x: 0.565, y: 0.48, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum UpperLat B4', x: 0.555, y: 0.48, width: 0.01, height: 0.01 },
  { id: 39, name: 'R PSIS (Sup 1)', x: 0.54, y: 0.46, width: 0.02, height: 0.01 },
  { id: 39, name: 'R PSIS (Sup 2)', x: 0.56, y: 0.46, width: 0.02, height: 0.01 },
  { id: 39, name: 'R PSIS (Lat 1)', x: 0.58, y: 0.47, width: 0.01, height: 0.015 },
  { id: 39, name: 'R PSIS (Lat 2)', x: 0.57, y: 0.47, width: 0.01, height: 0.015 },
  { id: 39, name: 'R SI Area (Sup 1)', x: 0.53, y: 0.465, width: 0.015, height: 0.012 },
  { id: 39, name: 'R SI Area (Sup 2)', x: 0.515, y: 0.465, width: 0.015, height: 0.013 },
  { id: 39, name: 'R Sacral Ala (Sup 1)', x: 0.525, y: 0.475, width: 0.012, height: 0.01 },
  { id: 39, name: 'R Sacral Ala (Sup 2)', x: 0.513, y: 0.475, width: 0.012, height: 0.01 },
  { id: 39, name: 'R Sacrum (TR 1a)', x: 0.57, y: 0.46, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum (TR 1b)', x: 0.56, y: 0.46, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum (TR 2a)', x: 0.55, y: 0.46, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum (TR 2b)', x: 0.54, y: 0.46, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum (TR 3a)', x: 0.57, y: 0.47, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum (TR 3b)', x: 0.56, y: 0.47, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum (TR 4a)', x: 0.57, y: 0.48, width: 0.01, height: 0.01 },
  { id: 39, name: 'R Sacrum (TR 4b)', x: 0.56, y: 0.48, width: 0.01, height: 0.01 },
  { id: 39, name: 'Sacrum (Midline)', x: 0.475, y: 0.48, width: 0.05, height: 0.04 },
  { id: 39, name: 'Sacrum (Sup Cent 1)', x: 0.475, y: 0.47, width: 0.025, height: 0.01 },
  { id: 39, name: 'Sacrum (Sup Cent 2)', x: 0.50, y: 0.47, width: 0.025, height: 0.01 },
  { id: 39, name: 'Sacrum (Mid Cent 1)', x: 0.475, y: 0.49, width: 0.025, height: 0.01 },
  { id: 39, name: 'Sacrum (Mid Cent 2)', x: 0.50, y: 0.49, width: 0.025, height: 0.01 },
  
  { id: 40, name: 'Left Proximal Hamstring', x: 0.33, y: 0.60, width: 0.11, height: 0.06 },
  { id: 40, name: 'L LowerLateralThigh S16', x: 0.28, y: 0.60, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S17', x: 0.29, y: 0.60, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S18', x: 0.30, y: 0.60, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S19', x: 0.28, y: 0.62, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S20', x: 0.29, y: 0.62, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S21', x: 0.30, y: 0.62, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S22', x: 0.28, y: 0.64, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S23', x: 0.29, y: 0.64, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S24', x: 0.30, y: 0.64, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S25', x: 0.28, y: 0.66, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S26', x: 0.29, y: 0.66, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S27', x: 0.30, y: 0.66, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S28', x: 0.28, y: 0.68, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S29', x: 0.29, y: 0.68, width: 0.01, height: 0.02 },
  { id: 40, name: 'L LowerLateralThigh S30', x: 0.30, y: 0.68, width: 0.01, height: 0.02 },
  
  { id: 41, name: 'Right Proximal Hamstring', x: 0.56, y: 0.60, width: 0.11, height: 0.06 },
  { id: 41, name: 'R LowerLateralThigh S16', x: 0.68, y: 0.60, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S17', x: 0.69, y: 0.60, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S18', x: 0.70, y: 0.60, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S19', x: 0.68, y: 0.62, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S20', x: 0.69, y: 0.62, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S21', x: 0.70, y: 0.62, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S22', x: 0.68, y: 0.64, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S23', x: 0.69, y: 0.64, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S24', x: 0.70, y: 0.64, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S25', x: 0.68, y: 0.66, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S26', x: 0.69, y: 0.66, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S27', x: 0.70, y: 0.66, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S28', x: 0.68, y: 0.68, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S29', x: 0.69, y: 0.68, width: 0.01, height: 0.02 },
  { id: 41, name: 'R LowerLateralThigh S30', x: 0.70, y: 0.68, width: 0.01, height: 0.02 },

  { id: 42, name: 'Left Mid-Hamstring', x: 0.33, y: 0.66, width: 0.11, height: 0.06 }, 
  { id: 42, name: 'Left Distal Hamstring (Popliteal Superior)', x: 0.34, y: 0.72, width: 0.1, height: 0.04 }, 
  { id: 42, name: 'Left Calf (Gastrocnemius - Medial Head)', x: 0.37, y: 0.76, width: 0.06, height: 0.07 }, 
  { id: 42, name: 'Left Calf (Gastrocnemius - Lateral Head)', x: 0.30, y: 0.76, width: 0.06, height: 0.07 }, 
  { id: 42, name: 'Left Calf (Soleus - Mid)', x: 0.33, y: 0.83, width: 0.08, height: 0.06 }, 
  { id: 42, name: 'Left Lateral Shin (Posterior)', x: 0.28, y: 0.80, width: 0.05, height: 0.08 },  
  
  { id: 43, name: 'Right Mid-Hamstring', x: 0.56, y: 0.66, width: 0.11, height: 0.06 }, 
  { id: 43, name: 'Right Distal Hamstring (Popliteal Superior)', x: 0.56, y: 0.72, width: 0.1, height: 0.04 }, 
  { id: 43, name: 'Right Calf (Gastrocnemius - Medial Head)', x: 0.57, y: 0.76, width: 0.06, height: 0.07 }, 
  { id: 43, name: 'Right Calf (Gastrocnemius - Lateral Head)', x: 0.64, y: 0.76, width: 0.06, height: 0.07 }, 
  { id: 43, name: 'Right Calf (Soleus - Mid)', x: 0.59, y: 0.83, width: 0.08, height: 0.06 }, 
  { id: 43, name: 'Right Lateral Shin (Posterior)', x: 0.67, y: 0.80, width: 0.05, height: 0.08 }, 

  { id: 44, name: 'Left Achilles Tendon', x: 0.35, y: 0.89, width: 0.05, height: 0.04 }, 
  { id: 44, name: 'Left Heel (Posterior)', x: 0.35, y: 0.93, width: 0.06, height: 0.03 }, 
  { id: 44, name: 'Left Sole (Plantar Heel)', x: 0.34, y: 0.96, width: 0.07, height: 0.03, isDetail: true }, 
  { id: 44, name: 'Left Sole (Plantar Arch - Medial)', x: 0.37, y: 0.95, width: 0.04, height: 0.02, isDetail: true }, 
  { id: 44, name: 'Left Sole (Plantar Arch - Lateral)', x: 0.31, y: 0.95, width: 0.04, height: 0.02, isDetail: true }, 
  { id: 44, name: 'Left Sole (Plantar Forefoot - Medial)', x: 0.36, y: 0.94, width: 0.04, height: 0.02, isDetail: true }, 
  { id: 44, name: 'Left Sole (Plantar Forefoot - Lateral)', x: 0.30, y: 0.94, width: 0.04, height: 0.02, isDetail: true }, 
  
  { id: 45, name: 'Right Achilles Tendon', x: 0.60, y: 0.89, width: 0.05, height: 0.04 }, 
  { id: 45, name: 'Right Heel (Posterior)', x: 0.59, y: 0.93, width: 0.06, height: 0.03 }, 
  { id: 45, name: 'Right Sole (Plantar Heel)', x: 0.59, y: 0.96, width: 0.07, height: 0.03, isDetail: true }, 
  { id: 45, name: 'Right Sole (Plantar Arch - Medial)', x: 0.59, y: 0.95, width: 0.04, height: 0.02, isDetail: true }, 
  { id: 45, name: 'Right Sole (Plantar Arch - Lateral)', x: 0.65, y: 0.95, width: 0.04, height: 0.02, isDetail: true }, 
  { id: 45, name: 'Right Sole (Plantar Forefoot - Medial)', x: 0.60, y: 0.94, width: 0.04, height: 0.02, isDetail: true }, 
  { id: 45, name: 'Right Sole (Plantar Forefoot - Lateral)', x: 0.66, y: 0.94, width: 0.04, height: 0.02, isDetail: true }, 
];

const getIntensityColor = (intensity: number): string => {
  if (intensity === 0) return '#cccccc'; 
  if (intensity >= 1 && intensity <= 2) return '#4ade80'; 
  if (intensity >= 3 && intensity <= 4) return '#84cc16'; 
  if (intensity >= 5 && intensity <= 6) return '#facc15'; 
  if (intensity >= 7 && intensity <= 8) return '#fb923c'; 
  if (intensity >= 9 && intensity <= 10) return '#f87171'; 
  return '#cccccc';
};

const PainMappingStep = forwardRef((props, ref) => {
  const { formData, updateFormData, formSessionId } = useFormContext();
  const [selectedPainAreaId, setSelectedPainAreaId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<BodyView>('front');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painMapContainerRef = useRef<HTMLDivElement>(null);

  const waitForViewRender = async (viewName: string) => {
    console.log(`[Pain Map] Waiting for ${viewName} view to render...`);
    // Wait for React state update + DOM repaint + image load
    await new Promise(resolve => setTimeout(resolve, 500));
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 300)));
    console.log(`[Pain Map] ${viewName} view should be ready now`);
  };

  const verifyUploadAvailability = async (relativePath: string): Promise<boolean> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/uploads/assessment_files/${relativePath}`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      return res.ok;
    } catch (err) {
      console.warn('Pain map availability check failed:', err);
      return false;
    } finally {
      clearTimeout(timeout);
    }
  };


  useImperativeHandle(ref, () => ({
    captureBothViews: async () => {
      try {
        console.log('[Pain Map] Starting capture of both views...');
        
        // Capture front view
        setCurrentView('front');
        await waitForViewRender('front');
        console.log('[Pain Map] Capturing front view...');
        await handleCapturePainMap('front');
        console.log('[Pain Map] Front view captured successfully');

        // Capture back view
        setCurrentView('back');
        await waitForViewRender('back');
        console.log('[Pain Map] Capturing back view...');
        await handleCapturePainMap('back');
        console.log('[Pain Map] Back view captured successfully');
        
        console.log('[Pain Map] Both views captured!');
      } catch (error) {
        console.error('[Pain Map] Capture failed:', error);
        throw error;
      }
    }
  }));

  const handleCapturePainMap = async (view: BodyView): Promise<string> => {
    console.log(`[Pain Map] handleCapturePainMap called for view: ${view}`);
    
    if (!painMapContainerRef.current) {
      console.error(`[Pain Map] Container ref is null for ${view}`);
      throw new Error('Pain map container is not ready.');
    }
    if (!formSessionId) {
      console.error(`[Pain Map] No formSessionId for ${view}`);
      throw new Error('Missing form session ID for pain map upload.');
    }

    try {
      console.log(`[Pain Map] Running html2canvas for ${view}...`);
      const canvas = await html2canvas(painMapContainerRef.current, {
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      console.log(`[Pain Map] Canvas created for ${view}, size: ${canvas.width}x${canvas.height}`);
      
      const imageData = canvas.toDataURL('image/png');
      console.log(`[Pain Map] Image data length for ${view}: ${imageData.length}`);

      console.log(`[Pain Map] Uploading ${view} to server...`);
      const response = await fetch(getApiUrl('/api/upload/pain-map'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          imageData,
          view: view,
          formSessionId: formSessionId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Pain Map] Upload failed for ${view}: ${response.status} - ${errorText}`);
        throw new Error(`Failed to upload ${view} pain map image.`);
      }

      const { filePath } = await response.json();
      console.log(`[Pain Map] ${view} uploaded successfully: ${filePath}`);

      if (view === 'front') {
        updateFormData({ painMapImageFront: filePath });
      } else {
        updateFormData({ painMapImageBack: filePath });
      }

      return filePath;
    } catch (error) {
      console.error(`[Pain Map] Error capturing or uploading ${view}:`, error);
      throw error;
    }
  };

  const handlePainAreaUpdate = (updatedPainAreas: PainArea[]) => {
    updateFormData({ painAreas: updatedPainAreas });
  };

  const removePainArea = (idToRemove: string) => {
    const updatedPainAreas = formData.painAreas.filter(area => area.id !== idToRemove);
    handlePainAreaUpdate(updatedPainAreas);
    if (selectedPainAreaId === idToRemove) {
      setSelectedPainAreaId(null); 
    }
  };

  const selectedPainArea = selectedPainAreaId
    ? formData.painAreas.find(area => area.id === selectedPainAreaId)
    : null;
  
  const handleIntensityChange = (newIntensity: number) => {
    if (selectedPainArea) {
      const updatedPainAreas = formData.painAreas.map(area =>
        area.id === selectedPainAreaId ? { ...area, intensity: newIntensity } : area
      );
      handlePainAreaUpdate(updatedPainAreas);
    }
  };

  const handleImageClick = (event: MouseEvent<HTMLImageElement>) => {
    const imgElement = event.currentTarget;
    const rect = imgElement.getBoundingClientRect();
    const imageWidth = rect.width; // Displayed width of the image
    const imageHeight = rect.height; // Displayed height of the image
    const clickX = event.clientX - rect.left; // Click X relative to displayed image
    const clickY = event.clientY - rect.top; // Click Y relative to displayed image

    console.log('Click on displayed image:', { clickX, clickY, imageWidth, imageHeight });

    if (clickX < 0 || clickX > imageWidth || clickY < 0 || clickY > imageHeight) {
      console.log('Click outside displayed image bounds.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.error('Canvas not ready or has no dimensions for pixel check.');
      return; 
    }

    const naturalWidth = canvas.width; // Natural width from canvas (set by img.naturalWidth)
    const naturalHeight = canvas.height; // Natural height from canvas (set by img.naturalHeight)

    // Map click coordinates from displayed image scale to natural image scale for canvas check
    const canvasClickX = Math.round((clickX / imageWidth) * naturalWidth);
    const canvasClickY = Math.round((clickY / imageHeight) * naturalHeight);
    
    console.log('Mapped click on canvas:', { canvasClickX, canvasClickY, naturalWidth, naturalHeight });

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available for pixel check.');
      return;
    }

    // Ensure calculated canvas coordinates are within canvas bounds before getImageData
    if (canvasClickX < 0 || canvasClickX >= naturalWidth || canvasClickY < 0 || canvasClickY >= naturalHeight) {
      console.log('Calculated canvas click is outside natural image bounds.');
      return; 
    }

    const pixelData = ctx.getImageData(canvasClickX, canvasClickY, 1, 1).data;
    console.log(`Pixel alpha at (${canvasClickX}, ${canvasClickY}): ${pixelData[3]}`);

    if (pixelData[3] < 10) { // Check alpha channel (10 is a small threshold for near-transparency)
      console.log('Clicked on a transparent part of the image.');
      return; 
    }

    const hotspotsToSearch = currentView === 'front' ? frontHotspots : backHotspots;
    let closestHotspot: Hotspot | null = null;
    let minDistance = Infinity;

    if (hotspotsToSearch.length === 0) return;

    for (const hotspot of hotspotsToSearch) {
        const hsCenterX = hotspot.x * imageWidth + (hotspot.width * imageWidth) / 2;
        const hsCenterY = hotspot.y * imageHeight + (hotspot.height * imageHeight) / 2;
        const distance = Math.sqrt(
            Math.pow(clickX - hsCenterX, 2) + Math.pow(clickY - hsCenterY, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            closestHotspot = hotspot;
        }
    }
    
    if (closestHotspot) {
      // Apply anatomical correction to region name for front view
      const originalRegionName = closestHotspot.name;
      const correctedRegionName = correctAnatomicalLabel(originalRegionName, currentView);
      
      // Store the corrected name so it will be displayed correctly in all systems
      const regionName = correctedRegionName;
      const regionIDForNotes = closestHotspot.id; 
      // Include both original and corrected names in the notes for reference
      let notes = `View: ${currentView}, RegionID: ${regionIDForNotes}`;
      if (closestHotspot.isDetail) notes += `, Detail: ${originalRegionName}`;

      // No mirroring needed - the hotspots are already positioned correctly with anatomical labels
      // We just need to make sure the pain point appears exactly where clicked
      console.log('Pain point coordinates:', { 
        view: currentView, 
        original: { x: clickX, y: clickY },
        imageWidth
      });
      
      const newPainArea: PainArea = {
        id: `point-${Date.now()}`,
        region: regionName, 
        intensity: 5, 
        coordinates: { x: clickX / 0.85, y: clickY / 0.85 }, 
        notes: notes,
      };
      handlePainAreaUpdate([...formData.painAreas, newPainArea]);
      setSelectedPainAreaId(newPainArea.id);
    }
  };

// Weakness area options for shoulder patients
const weaknessAreaOptions: { key: string, label: string }[] = [
  { key: 'Shoulder', label: 'Shoulder' },
  { key: 'Arm', label: 'Arm' },
  { key: 'Hand', label: 'Hand' },
  { key: 'OtherArea', label: 'Other' },
];

// Simplified red flag handler for Shoulder assessment
const handleRedFlagChange = (
  flagName: 'fevers' | 'nightPain',
  isPresent: boolean
) => {
  updateFormData({
    redFlags: {
      ...formData.redFlags,
      [flagName]: { present: isPresent },
    },
  });
};

const handleWeaknessChange = (isPresent: boolean) => {
  const newRedFlags = { ...formData.redFlags };
  newRedFlags.weakness.present = isPresent;
  if (!isPresent && newRedFlags.weakness.areas) {
    Object.keys(newRedFlags.weakness.areas).forEach(areaKey => {
      newRedFlags.weakness.areas![areaKey] = { selected: false };
    });
  }
  updateFormData({ redFlags: newRedFlags });
};

const handleWeaknessAreaChange = (areaKey: string, isSelected: boolean) => {
  const newRedFlags = { ...formData.redFlags };
  if (newRedFlags.weakness.areas && newRedFlags.weakness.areas[areaKey]) {
    newRedFlags.weakness.areas[areaKey].selected = isSelected;
  }
  updateFormData({ redFlags: newRedFlags });
};

const handleUnexplainedWeightLossChange = (isPresent: boolean) => {
  updateFormData({
    redFlags: {
      ...formData.redFlags,
      unexplainedWeightLoss: {
        present: isPresent,
        period: isPresent ? formData.redFlags.unexplainedWeightLoss.period : '',
        amountKg: isPresent ? formData.redFlags.unexplainedWeightLoss.amountKg : undefined,
      },
    },
  });
};

  const handleWeightLossPeriodChange = (period: string) => {
    updateFormData({
      redFlags: {
        ...formData.redFlags,
        unexplainedWeightLoss: {
          ...formData.redFlags.unexplainedWeightLoss,
          period: period,
        },
      },
    });
  };

  const handleWeightLossAmountChange = (amount: string) => {
    const numAmount = amount === '' ? undefined : parseFloat(amount);
    updateFormData({
      redFlags: {
        ...formData.redFlags,
        unexplainedWeightLoss: {
          ...formData.redFlags.unexplainedWeightLoss,
          amountKg: numAmount,
        },
      },
    });
  };

  // Function to correct the anatomical labeling of pain regions for front view
  const correctAnatomicalLabel = (name: string, view: BodyView): string => {
    if (view !== 'front') return name;
    
    // For front view, swap "Left" and "Right" in the region name
    if (name.includes('Left')) {
      return name.replace('Left', 'Right');
    } else if (name.includes('Right')) {
      return name.replace('Right', 'Left');
    }
    return name;
  };

  return (
    <div id="pain-mapping-step" className="step-container relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Pain Mapping</h2>
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <input 
              type="radio" 
              id="frontView" 
              name="bodyView" 
              value="front" 
              checked={currentView === 'front'} 
              onChange={() => { setCurrentView('front'); setSelectedPainAreaId(null); }} 
              className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 accent-sky-600" 
            />
            <label htmlFor="frontView" className="ml-2 text-sm font-medium text-gray-700 dark:text-neutral-300 cursor-pointer">Front</label>
          </div>
          <div className="flex items-center">
            <input 
              type="radio" 
              id="backView" 
              name="bodyView" 
              value="back" 
              checked={currentView === 'back'} 
              onChange={() => { setCurrentView('back'); setSelectedPainAreaId(null); }} 
              className="w-4 h-4 text-sky-600 bg-gray-100 border-gray-300 focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 accent-sky-600" 
            />
            <label htmlFor="backView" className="ml-2 text-sm font-medium text-gray-700 dark:text-neutral-300 cursor-pointer">Back</label>
          </div>
        </div>
      </div>
      <p className="text-base text-gray-600 dark:text-gray-300 mb-1 text-center">
        Click on the body map to mark any areas where you feel pain, then use the slider to rate the intensity from 1 to 10. You can mark multiple pain points if needed.
      </p>
      <canvas ref={canvasRef} style={{ display: 'none' }} /> {/* Invisible canvas */}
      <div className="w-full mb-2 text-center">
        <div ref={painMapContainerRef} style={{ position: 'relative', display: 'inline-block', transform: 'scale(0.85)', marginTop: '-2rem', marginBottom: '-2rem' }} >
          <img             
            src={currentView === 'front' ? bodyFrontImg : bodyBackImg} 
            alt={`${currentView} view of the body`} 
            className="max-w-xs sm:max-w-sm md:max-w-sm cursor-pointer block rounded" 
            onClick={handleImageClick} 
            onLoad={(e) => { 
              const imgElement = e.currentTarget; 
              const canvas = canvasRef.current;
              if (canvas && imgElement.naturalWidth > 0 && imgElement.naturalHeight > 0) { 
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  canvas.width = imgElement.naturalWidth;
                  canvas.height = imgElement.naturalHeight;
                  ctx.clearRect(0, 0, canvas.width, canvas.height); 
                  ctx.drawImage(imgElement, 0, 0, imgElement.naturalWidth, imgElement.naturalHeight);
                  console.log(`Canvas updated for ${currentView} view. Dimensions: ${canvas.width}x${canvas.height}`);
                }
              }
            }}
            crossOrigin="anonymous" 
          />
          {formData.painAreas.filter(area => area.notes?.includes(`View: ${currentView}`)).map(area => {
            // Simply use the stored coordinates as they are - they were already mirrored during click handling
            return area.coordinates && (
              <div 
                key={area.id} 
                style={{ 
                  position: 'absolute', 
                  left: `${area.coordinates.x}px`, 
                  top: `${area.coordinates.y}px`, 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: getIntensityColor(area.intensity), 
                  borderRadius: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  border: '1px solid white', 
                  boxShadow: '0 0 3px rgba(0,0,0,0.5)', 
                  cursor: 'pointer' 
                }} 
                onClick={() => { setSelectedPainAreaId(area.id); }} 
                title={`Pain: ${area.region} (Intensity: ${area.intensity})`} 
              />
            );
          })}
        </div>
      </div>


      {selectedPainArea && (
        <div className="p-4 border dark:border-gray-700 rounded-lg shadow-lg bg-white dark:bg-gray-800 fixed bottom-4 sm:bottom-10 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-xs sm:max-w-sm" >
          <h3 className="text-md font-semibold mb-2 text-center text-gray-800 dark:text-gray-100"> 
            Adjust Intensity: {selectedPainArea.region}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">0</span>
            <input type="range" min="0" max="10" value={selectedPainArea.intensity} onChange={(e) => handleIntensityChange(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-sky-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">10</span>
          </div>
          <p className="text-center text-lg font-bold mt-2" style={{ color: getIntensityColor(selectedPainArea.intensity) }}>
            {selectedPainArea.intensity}
          </p>
          <button onClick={() => { setSelectedPainAreaId(null); }} className="btn-secondary w-full mt-3 text-sm py-1">Done</button>
        </div>
      )}
      
      {formData.painAreas.length > 0 && (
        <div className="mt-8 p-4 border dark:border-gray-700 rounded-lg bg-slate-50 dark:bg-slate-800">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Selected Pain Areas:</h3> 
          <ul className="list-disc pl-5">
            {formData.painAreas.map((area, index) => (
              <li key={index} className="text-sm flex items-center text-gray-700 dark:text-gray-200 mb-1"> 
                <span 
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: getIntensityColor(area.intensity),
                    borderRadius: '50%',
                    marginRight: '8px',
                    display: 'inline-block',
                    border: '1px solid #ccc'
                  }}
                ></span>
                {area.region}: Intensity {area.intensity} {area.notes && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{`(${area.notes})`}</span>}
                <button 
                  onClick={() => removePainArea(area.id)}
                  className="ml-auto pl-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs"
                  title="Remove pain point"
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 mb-6 p-4 border dark:border-gray-700 rounded-lg bg-rose-50 dark:bg-rose-900/50">
        <h3 className="text-2xl font-semibold mb-4 text-rose-700 dark:text-rose-300">Red Flags</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Please indicate if you are experiencing any of the following symptoms. These are important to note.
        </p>

        {/* Fevers */}
        <div className="mb-4 p-3 border-b border-gray-300 dark:border-gray-600">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.redFlags.fevers.present}
              onChange={(e) => handleRedFlagChange('fevers', e.target.checked)}
              className="form-checkbox h-5 w-5 text-rose-600 accent-rose-500 focus:ring-rose-500"
            />
            <span className="text-md font-medium text-gray-800 dark:text-gray-200">Fevers</span>
          </label>
        </div>

        {/* Unexplained Weight Loss */}
        <div className="mb-4 p-3 border-b border-gray-300 dark:border-gray-600">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.redFlags.unexplainedWeightLoss.present}
              onChange={(e) => handleUnexplainedWeightLossChange(e.target.checked)}
              className="form-checkbox h-5 w-5 text-rose-600 accent-rose-500 focus:ring-rose-500"
            />
            <span className="text-md font-medium text-gray-800 dark:text-gray-200">Unexplained weight loss</span>
          </label>
          {formData.redFlags.unexplainedWeightLoss.present && (
            <div className="mt-3 pl-8 space-y-3">
              <div>
                <label htmlFor="weightLossAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  How many kg have you lost?
                </label>
                <input
                  type="number"
                  id="weightLossAmount"
                  value={formData.redFlags.unexplainedWeightLoss.amountKg === undefined ? '' : formData.redFlags.unexplainedWeightLoss.amountKg}
                  onChange={(e) => handleWeightLossAmountChange(e.target.value)}
                  placeholder="e.g., 5"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2"
                />
              </div>
              <div>
                <label htmlFor="weightLossPeriod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Over what period of time?
                </label>
                <input
                  type="text"
                  id="weightLossPeriod"
                  value={formData.redFlags.unexplainedWeightLoss.period || ''}
                  onChange={(e) => handleWeightLossPeriodChange(e.target.value)}
                  placeholder="e.g., last 3 months"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Night Pain */}
        <div className="mb-4 p-3 border-b border-gray-300 dark:border-gray-600">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.redFlags.nightPain.present}
              onChange={(e) => handleRedFlagChange('nightPain', e.target.checked)}
              className="form-checkbox h-5 w-5 text-rose-600 accent-rose-500 focus:ring-rose-500"
            />
            <span className="text-md font-medium text-gray-800 dark:text-gray-200">Night pain (pain that wakes you from sleep)</span>
          </label>
        </div>

        {/* Weakness */}
        <div className="mb-4 p-3 border-b border-gray-300 dark:border-gray-600">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.redFlags.weakness.present}
              onChange={(e) => handleWeaknessChange(e.target.checked)}
              className="form-checkbox h-5 w-5 text-rose-600 accent-rose-500 focus:ring-rose-500"
            />
            <span className="text-md font-medium text-gray-800 dark:text-gray-200">Weakness</span>
          </label>
          {formData.redFlags.weakness.present && formData.redFlags.weakness.areas && (
            <div className="mt-3 pl-8 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Where do you experience weakness?</p>
              {weaknessAreaOptions.map(area => (
                <label key={`weakness-${area.key}`} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.redFlags.weakness.areas![area.key]?.selected || false}
                    onChange={(e) => handleWeaknessAreaChange(area.key, e.target.checked)}
                    className="form-checkbox h-4 w-4 text-rose-500 accent-rose-400 focus:ring-rose-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{area.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Other Red Flags */}
        <div className="mb-4 p-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.redFlags.otherRedFlagPresent || false}
              onChange={(e) => updateFormData({ redFlags: { ...formData.redFlags, otherRedFlagPresent: e.target.checked, otherRedFlag: e.target.checked ? formData.redFlags.otherRedFlag : '' } })}
              className="form-checkbox h-5 w-5 text-rose-600 accent-rose-500 focus:ring-rose-500"
            />
            <span className="text-md font-medium text-gray-800 dark:text-gray-200">Other concerns or red flags?</span>
          </label>
          {formData.redFlags.otherRedFlagPresent && (
            <div className="mt-3 pl-8">
              <textarea
                value={formData.redFlags.otherRedFlag || ''}
                onChange={(e) => updateFormData({ redFlags: { ...formData.redFlags, otherRedFlag: e.target.value } })}
                placeholder="Please describe any other red flag symptoms or concerns..."
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 h-24"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 mb-6">
        <label htmlFor="treatmentGoals" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          What are you hoping to achieve from treatment?
        </label>
        <textarea
          id="treatmentGoals"
          name="treatmentGoals"
          rows={3}
          className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 placeholder-gray-400 dark:placeholder-gray-500 ${
            !formData.treatmentGoals ? 'pulsate-attention-goals' : ''
          }`}
          placeholder="e.g., reduce pain, improve mobility, return to specific activities..."
          value={formData.treatmentGoals || ''}
          onChange={(e) => updateFormData({ treatmentGoals: e.target.value })}
        />
      </div>
    </div>
  );
});

export default PainMappingStep;
