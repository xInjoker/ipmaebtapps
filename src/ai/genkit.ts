import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Import flows so that they are registered with Genkit.
import * as projectAnalysisFlow from '@/ai/flows/project-analysis-flow';

const plugins = [googleAI()];

// Configure Google Cloud options
const gcpOptions = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Add emulator configuration for development if needed
if (process.env.NODE_ENV !== 'production' && process.env.FIRESTORE_EMULATOR_HOST) {
  Object.assign(gcpOptions, {
    firestore: {
      host: process.env.FIRESTORE_EMULATOR_HOST,
      ssl: false
    }
  });
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});