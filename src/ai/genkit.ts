import { genkit, Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// Use named import instead of default import
import { firebase } from '@genkit-ai/firebase'; // Corrected import
import { googleCloud } from '@genkit-ai/google-cloud';

// Import flows so that they are registered with Genkit.
// import * as projectAnalysisFlow from '@/ai/flows/project-analysis-flow';

const plugins: Plugin[] = [googleAI()];

if (process.env.NODE_ENV === 'production') {
  // In production, Firebase and Google Cloud plugins are needed.
  // App Hosting automatically provides the necessary credentials.
  plugins.push(
    firebase({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    }),
    googleCloud()
  );
} else {
  // For local development using the emulator or a real project
  plugins.push(
    firebase({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      emulators: {
        firestore: process.env.FIRESTORE_EMULATOR_HOST 
          ? { host: process.env.FIRESTORE_EMULATOR_HOST } 
          : undefined
      }
    })
  );
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
