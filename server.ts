import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

dotenv.config();

const app = express();
const port = 3000;
app.use(express.json());

// Initialize GoogleGenAI on the server if key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API endpoint for AI Explanation
app.post('/api/gemini/explain', async (req: Request, res: Response) => {
  try {
    const { patientData, riskScore, riskLevel, topFactors } = req.body;

    if (!aiClient) {
      return res.json({
        success: false,
        source: 'local-engine',
        message: 'Gemini API key not configured on server; using local explainable AI engine.',
      });
    }

    const prompt = `
Explain the following cardiovascular risk model output for educational purposes:
- Patient: Age ${patientData?.age}, ${patientData?.sex}, BMI ${patientData?.bmi || 'N/A'}
- Blood Pressure: ${patientData?.systolicBp}/${patientData?.diastolicBp} mmHg
- Total / LDL / HDL: ${patientData?.totalCholesterol} / ${patientData?.ldlCholesterol} / ${patientData?.hdlCholesterol} mg/dL
- Fasting Glucose: ${patientData?.bloodGlucose} mg/dL, Diabetes: ${patientData?.diabetes ? 'Yes' : 'No'}
- Smoking: ${patientData?.smoking ? 'Yes' : 'No'}
- Predicted CAD Risk: ${riskScore}% (${riskLevel} risk tier)
- Top mathematical drivers: ${JSON.stringify(topFactors || [])}

Provide a concise, patient-friendly educational explanation (approx 80-120 words). Emphasize why these specific factors contributed to the model output in this prototype. Do not diagnose disease. Do not prescribe medication. Remind them to consult a qualified physician for clinical care.
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an educational cardiovascular risk intelligence assistant. Explain the provided model output in simple, objective, and empathetic language. Do not diagnose disease. Do not prescribe treatment. Clearly state that the result is a prototype prediction and encourage consultation with a qualified healthcare professional.',
        temperature: 0.7,
      },
    });

    const explanationText = response.text || '';

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      aiExplanation: explanationText,
    });
  } catch (error: any) {
    console.warn('Error in /api/gemini/explain:', error?.message || error);
    return res.json({
      success: false,
      source: 'local-fallback',
      error: error?.message || 'Server explanation error',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`CardioSynex AI server active at http://0.0.0.0:${port}`);
  });
}

startServer();
