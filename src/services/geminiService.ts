import { PatientData, CardiacRiskResult } from '../types/cardiac';

export async function fetchAiRiskExplanation(
  patientData: PatientData,
  result: CardiacRiskResult
): Promise<{ text: string; source: 'gemini' | 'engine' }> {
  try {
    const topFactors = result.contributingFactors.slice(0, 3).map(f => ({
      factor: f.factor,
      impact: f.impact,
      contribution: `${f.contribution}%`,
      current: f.currentValue,
    }));

    const response = await fetch('/api/gemini/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientData: {
          age: patientData.age,
          sex: patientData.sex,
          bmi: result.bmi,
          systolicBp: patientData.systolicBp,
          diastolicBp: patientData.diastolicBp,
          totalCholesterol: patientData.totalCholesterol,
          ldlCholesterol: patientData.ldlCholesterol,
          hdlCholesterol: patientData.hdlCholesterol,
          bloodGlucose: patientData.bloodGlucose,
          diabetes: patientData.diabetes,
          smoking: patientData.smoking,
        },
        riskScore: result.cadRisk,
        riskLevel: result.overallRisk,
        topFactors,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.aiExplanation) {
        return { text: data.aiExplanation, source: 'gemini' };
      }
    }
  } catch (err) {
    console.info('Client fell back to local explainable AI text generator:', err);
  }

  // High quality local fallback explanation
  const topElevated = result.contributingFactors
    .filter(f => !f.isPositive)
    .slice(0, 3)
    .map(f => `${f.factor} (${f.currentValue})`);

  const fallbackText = topElevated.length > 0
    ? `Your prototype risk score of ${result.cadRisk}% (${result.overallRisk}) is predominantly driven by ${topElevated.join(', ')}. In cardiovascular modeling, concurrent elevation of hemodynamic pressure and atherogenic lipoproteins accelerates arterial shear stress and lipid deposition. Note: This result is an educational model prediction and not a medical diagnosis.`
    : `Your prototype risk score of ${result.cadRisk}% (${result.overallRisk}) reflects an optimal physiological baseline with preserved vascular metrics. Continue routine lifestyle maintenance and periodic clinical wellness evaluations.`;

  return { text: fallbackText, source: 'engine' };
}
