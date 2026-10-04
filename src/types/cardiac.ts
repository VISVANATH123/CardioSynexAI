export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'moderate' | 'active';

export type ChestPainType = 'none' | 'typical_angina' | 'atypical_angina' | 'non_anginal';

export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface PatientData {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  systolicBp: number;
  diastolicBp: number;
  restingHeartRate: number;
  totalCholesterol: number;
  hdlCholesterol: number;
  ldlCholesterol: number;
  bloodGlucose: number;
  smoking: boolean;
  diabetes: boolean;
  physicalActivity: ActivityLevel;
  familyHistory: boolean;
  chestPainType: ChestPainType;
}

export interface ContributingFactor {
  factor: string;
  category: 'Hemodynamic' | 'Metabolic' | 'Lipid' | 'Lifestyle' | 'Demographic';
  impact: 'HIGH' | 'MODERATE' | 'LOW';
  contribution: number; // percentage contribution (0 - 100)
  currentValue: string;
  targetValue: string;
  description: string;
  isPositive: boolean; // positive = reducing risk, negative = increasing risk
}

export interface AnatomicalRiskStatus {
  heartMuscle: RiskCategory;
  coronaryArteries: RiskCategory;
  aorta: RiskCategory;
  microvasculature: RiskCategory;
  selectedRegion?: string;
}

export interface CardiacRiskResult {
  cadRisk: number; // 0 - 100
  overallRisk: RiskCategory;
  riskLevel: RiskCategory;
  modelConfidence: number; // e.g. 88
  bmi: number;
  bmiCategory: string;
  meanArterialPressure: number;
  cholesterolRatio: number;
  contributingFactors: ContributingFactor[];
  recommendations: string[];
  explanation: string;
  aiExplanation?: string;
  anatomicalRisk: AnatomicalRiskStatus;
  calculatedAt: string;
}

export interface AssessmentRecord {
  id: string;
  patientName: string;
  date: string;
  patientData: PatientData;
  result: CardiacRiskResult;
}
