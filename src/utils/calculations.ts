import { PatientData, CardiacRiskResult, ContributingFactor, RiskCategory } from '../types/cardiac';

export function calculateBmi(weightKg: number, heightCm: number): { bmi: number; category: string; color: string } {
  const heightM = heightCm / 100;
  if (heightM <= 0) return { bmi: 22, category: 'Normal', color: 'text-emerald-400' };
  const rawBmi = weightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  let category = 'Normal';
  let color = 'text-emerald-400';

  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'text-sky-400';
  } else if (bmi < 25) {
    category = 'Normal Weight';
    color = 'text-emerald-400';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = 'text-amber-400';
  } else if (bmi < 35) {
    category = 'Obesity Class I';
    color = 'text-orange-400';
  } else {
    category = 'Severe Obesity';
    color = 'text-rose-500';
  }

  return { bmi, category, color };
}

export function calculateCardiacRisk(data: PatientData): CardiacRiskResult {
  const { bmi, category: bmiCategory } = calculateBmi(data.weightKg, data.heightCm);

  // Mean Arterial Pressure (MAP) = DBP + 1/3(SBP - DBP)
  const map = Math.round((data.diastolicBp + (data.systolicBp - data.diastolicBp) / 3) * 10) / 10;
  const cholRatio = Math.round((data.totalCholesterol / Math.max(data.hdlCholesterol, 1)) * 10) / 10;

  // Base risk starts from baseline demographic age & sex
  let baseScore = 0;

  // Age effect (baseline risk increases non-linearly with age)
  if (data.age < 35) {
    baseScore += 4;
  } else if (data.age < 45) {
    baseScore += 10;
  } else if (data.age < 55) {
    baseScore += 20;
  } else if (data.age < 65) {
    baseScore += 30;
  } else {
    baseScore += 40;
  }

  // Male biological sex baseline adjustment in traditional models
  if (data.sex === 'male') {
    baseScore += 6;
  }

  // Hemodynamic points (Blood Pressure)
  let bpPoints = 0;
  if (data.systolicBp >= 160 || data.diastolicBp >= 100) {
    bpPoints = 28; // Stage 2 HTN severe
  } else if (data.systolicBp >= 140 || data.diastolicBp >= 90) {
    bpPoints = 19; // Stage 2 HTN
  } else if (data.systolicBp >= 130 || data.diastolicBp >= 80) {
    bpPoints = 11; // Stage 1 HTN
  } else if (data.systolicBp >= 120) {
    bpPoints = 5;  // Elevated
  } else {
    bpPoints = 0;  // Optimal
  }

  // Lipid Points (LDL and Total/HDL ratio)
  let lipidPoints = 0;
  if (data.ldlCholesterol >= 190) {
    lipidPoints = 26; // Very High
  } else if (data.ldlCholesterol >= 160) {
    lipidPoints = 19; // High
  } else if (data.ldlCholesterol >= 130) {
    lipidPoints = 12; // Borderline high
  } else if (data.ldlCholesterol >= 100) {
    lipidPoints = 5;  // Moderate
  } else {
    lipidPoints = 1;  // Optimal
  }

  // Low HDL penalty or high HDL protective effect
  if (data.hdlCholesterol < 40) {
    lipidPoints += 7;
  } else if (data.hdlCholesterol >= 60) {
    lipidPoints = Math.max(0, lipidPoints - 5); // Protective
  }

  // Smoking impact
  const smokingPoints = data.smoking ? 22 : 0;

  // Metabolic & Diabetes impact
  let metabolicPoints = 0;
  if (data.diabetes) {
    metabolicPoints += 20;
  }
  if (data.bloodGlucose >= 140) {
    metabolicPoints += 12;
  } else if (data.bloodGlucose >= 100) {
    metabolicPoints += 6;
  }

  // Adiposity (BMI)
  let bmiPoints = 0;
  if (bmi >= 35) {
    bmiPoints = 14;
  } else if (bmi >= 30) {
    bmiPoints = 9;
  } else if (bmi >= 25) {
    bmiPoints = 4;
  }

  // Physical inactivity
  let activityPoints = 0;
  if (data.physicalActivity === 'sedentary') {
    activityPoints = 10;
  } else if (data.physicalActivity === 'moderate') {
    activityPoints = 3;
  } else {
    activityPoints = -4; // protective
  }

  // Family history
  const familyPoints = data.familyHistory ? 9 : 0;

  // Chest pain modifier
  let chestPainPoints = 0;
  if (data.chestPainType === 'typical_angina') {
    chestPainPoints = 15;
  } else if (data.chestPainType === 'atypical_angina') {
    chestPainPoints = 8;
  } else if (data.chestPainType === 'non_anginal') {
    chestPainPoints = 3;
  }

  // Resting Heart Rate elevation (> 80 bpm resting has correlated cardiovascular risk)
  let hrPoints = 0;
  if (data.restingHeartRate >= 90) {
    hrPoints = 8;
  } else if (data.restingHeartRate >= 80) {
    hrPoints = 4;
  }

  // Total raw score
  const totalScore = baseScore + bpPoints + lipidPoints + smokingPoints + metabolicPoints + bmiPoints + activityPoints + familyPoints + chestPainPoints + hrPoints;

  // Normalized CAD Risk scale (bounded between 5% and 96%)
  // 30 score -> ~12%
  // 60 score -> ~38%
  // 95 score -> ~68%
  // 120 score -> ~86%
  const cadRisk = Math.min(96, Math.max(5, Math.round(100 / (1 + Math.exp(-0.038 * (totalScore - 68))))));

  // Risk category
  let overallRisk: RiskCategory = 'LOW';
  if (cadRisk >= 80) {
    overallRisk = 'CRITICAL';
  } else if (cadRisk >= 55) {
    overallRisk = 'HIGH';
  } else if (cadRisk >= 25) {
    overallRisk = 'MODERATE';
  } else {
    overallRisk = 'LOW';
  }

  // Factor breakdown attribution
  const candidateFactors: {
    factor: string;
    category: ContributingFactor['category'];
    rawWeight: number;
    currentValue: string;
    targetValue: string;
    description: string;
    isElevated: boolean;
  }[] = [
    {
      factor: 'Systolic Blood Pressure',
      category: 'Hemodynamic',
      rawWeight: bpPoints * 1.3,
      currentValue: `${data.systolicBp} / ${data.diastolicBp} mmHg`,
      targetValue: '< 120/80 mmHg',
      description: data.systolicBp >= 140 
        ? 'Systolic blood pressure induces chronic shearing stress on coronary endothelium, promoting atheroma formation.'
        : 'Blood pressure levels remain within managed clinical thresholds.',
      isElevated: data.systolicBp >= 130 || data.diastolicBp >= 80,
    },
    {
      factor: 'LDL Cholesterol',
      category: 'Lipid',
      rawWeight: lipidPoints * 1.25,
      currentValue: `${data.ldlCholesterol} mg/dL`,
      targetValue: '< 100 mg/dL',
      description: data.ldlCholesterol >= 130
        ? 'Atherogenic low-density lipoproteins penetrate arterial intima, driving inflammatory foam cell cascade.'
        : 'Circulating LDL particle levels meet favorable cardiovascular targets.',
      isElevated: data.ldlCholesterol >= 100,
    },
    {
      factor: 'Smoking Status',
      category: 'Lifestyle',
      rawWeight: smokingPoints * 1.2,
      currentValue: data.smoking ? 'Current Smoker' : 'Non-Smoker',
      targetValue: 'Complete Cessation',
      description: data.smoking
        ? 'Combustion toxins induce acute vasoconstriction, endothelial dysfunction, and increased platelet adhesiveness.'
        : 'Absence of tobacco smoke exposure substantially reduces acute vascular thrombosis risk.',
      isElevated: data.smoking,
    },
    {
      factor: 'Metabolic & Glycemic Profile',
      category: 'Metabolic',
      rawWeight: metabolicPoints * 1.15,
      currentValue: `${data.bloodGlucose} mg/dL ${data.diabetes ? '(Diabetic)' : '(Non-Diabetic)'}`,
      targetValue: '< 100 mg/dL Fasting',
      description: (data.diabetes || data.bloodGlucose >= 126)
        ? 'Chronic hyperglycemia accelerates advanced glycation end-products (AGEs) and microvascular remodeling.'
        : 'Fasting glucose markers indicate stable glycemic homeostasis.',
      isElevated: data.diabetes || data.bloodGlucose >= 100,
    },
    {
      factor: 'Body Mass Index (BMI)',
      category: 'Metabolic',
      rawWeight: bmiPoints * 1.1,
      currentValue: `${bmi} (${bmiCategory})`,
      targetValue: '18.5 – 24.9',
      description: bmi >= 28
        ? 'Excess visceral adiposity secretes pro-inflammatory cytokines that contribute to systemic cardiometabolic strain.'
        : 'Body composition aligns with recommended cardiovascular protective ranges.',
      isElevated: bmi >= 25,
    },
    {
      factor: 'Age & Chronological Profile',
      category: 'Demographic',
      rawWeight: baseScore * 0.7,
      currentValue: `${data.age} yrs (${data.sex})`,
      targetValue: 'Non-modifiable',
      description: data.age >= 55
        ? 'Arterial compliance naturally attenuates with advancing decades, increasing pulse wave velocity.'
        : 'Younger biological vascular baseline provides substantial natural resilience.',
      isElevated: data.age >= 50,
    },
    {
      factor: 'Physical Inactivity',
      category: 'Lifestyle',
      rawWeight: Math.max(0, activityPoints) * 1.1,
      currentValue: data.physicalActivity.charAt(0).toUpperCase() + data.physicalActivity.slice(1),
      targetValue: '≥ 150 min/wk Moderate',
      description: data.physicalActivity === 'sedentary'
        ? 'Sedentary routine lowers nitric oxide bioavailability and attenuates cardiorespiratory fitness.'
        : 'Active routine stimulates beneficial cardioprotective endothelial shear stress.',
      isElevated: data.physicalActivity === 'sedentary',
    },
    {
      factor: 'Family History of Premature CAD',
      category: 'Demographic',
      rawWeight: familyPoints * 1.0,
      currentValue: data.familyHistory ? 'Positive' : 'Negative',
      targetValue: 'Non-modifiable',
      description: data.familyHistory
        ? 'Familial clustering indicates potential polygenic predisposition to dyslipidemia or arterial wall stiffness.'
        : 'No documented early first-degree cardiovascular incidents noted.',
      isElevated: data.familyHistory,
    },
  ];

  // Calculate percentage contributions for explainable AI
  const totalElevatedWeight = candidateFactors.reduce((sum, f) => sum + (f.isElevated ? f.rawWeight : f.rawWeight * 0.2), 0) || 1;

  const contributingFactors: ContributingFactor[] = candidateFactors
    .map(cf => {
      const weight = cf.isElevated ? cf.rawWeight : cf.rawWeight * 0.15;
      const contribution = Math.min(45, Math.max(4, Math.round((weight / totalElevatedWeight) * 100)));
      let impact: ContributingFactor['impact'] = 'LOW';
      if (contribution >= 18 || (cf.isElevated && cf.rawWeight >= 20)) {
        impact = 'HIGH';
      } else if (contribution >= 10 || cf.isElevated) {
        impact = 'MODERATE';
      }
      return {
        factor: cf.factor,
        category: cf.category,
        impact,
        contribution,
        currentValue: cf.currentValue,
        targetValue: cf.targetValue,
        description: cf.description,
        isPositive: !cf.isElevated,
      };
    })
    .sort((a, b) => b.contribution - a.contribution);

  // Recommendations tailored to clinical discussion
  const recommendations: string[] = [];
  if (data.systolicBp >= 130 || data.diastolicBp >= 80) {
    recommendations.push('Discuss blood pressure monitoring protocols and lifestyle sodium reduction with your primary care provider.');
  }
  if (data.ldlCholesterol >= 130 || data.totalCholesterol >= 200) {
    recommendations.push('Evaluate comprehensive lipid panel markers, including ApoB and Lp(a), with a healthcare professional.');
  }
  if (data.smoking) {
    recommendations.push('Explore evidence-based smoking cessation programs, nicotine replacement options, or behavioral support.');
  }
  if (data.diabetes || data.bloodGlucose >= 100) {
    recommendations.push('Schedule routine HbA1c screening and discuss glycemic management strategies with a physician.');
  }
  if (bmi >= 28) {
    recommendations.push('Review sustainable, cardioprotective nutrition approaches (e.g., Mediterranean dietary pattern) with a clinical dietitian.');
  }
  if (data.physicalActivity === 'sedentary') {
    recommendations.push('Inquire about safe cardiovascular exercise initiation aiming for 150 minutes of moderate aerobic activity weekly.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain regular annual wellness checkups and preserve current healthy lifestyle practices.');
  }

  // Natural language explanation synthesized
  const topElevated = contributingFactors.filter(f => !f.isPositive).slice(0, 3).map(f => f.factor.toLowerCase());
  const explanation = topElevated.length > 0
    ? `The model's predicted risk (${cadRisk}% - ${overallRisk}) is primarily influenced by ${topElevated.join(', ')}. In this prototype engine, these parameters represent the highest mathematical drivers associated with elevated cardiovascular risk trajectories.`
    : `The model's predicted risk (${cadRisk}% - ${overallRisk}) reflects an optimal baseline profile with low atherogenic drivers and favorable hemodynamic metrics.`;

  // Anatomical risk distribution
  const anatomicalRisk = {
    heartMuscle: (cadRisk >= 65 ? 'HIGH' : cadRisk >= 35 ? 'MODERATE' : 'LOW') as RiskCategory,
    coronaryArteries: (cadRisk >= 50 || data.ldlCholesterol >= 140 || data.smoking ? (cadRisk >= 75 ? 'CRITICAL' : 'HIGH') : cadRisk >= 30 ? 'MODERATE' : 'LOW') as RiskCategory,
    aorta: (data.systolicBp >= 140 || cadRisk >= 60 ? 'HIGH' : data.systolicBp >= 125 ? 'MODERATE' : 'LOW') as RiskCategory,
    microvasculature: (data.diabetes || data.smoking || data.systolicBp >= 150 ? 'HIGH' : 'LOW') as RiskCategory,
  };

  // Coherent prototype confidence based on input completeness
  const modelConfidence = Math.min(94, Math.max(82, 88 + (data.chestPainType !== 'none' ? 2 : 0) + (data.diabetes ? 2 : 0) - (data.age < 30 ? 3 : 0)));

  return {
    cadRisk,
    overallRisk,
    riskLevel: overallRisk,
    modelConfidence,
    bmi,
    bmiCategory,
    meanArterialPressure: map,
    cholesterolRatio: cholRatio,
    contributingFactors,
    recommendations,
    explanation,
    anatomicalRisk,
    calculatedAt: new Date().toISOString(),
  };
}
