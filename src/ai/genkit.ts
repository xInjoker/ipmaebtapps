
import { genkit, Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
// Use the correct import for Firebase integration
import firebasePlugin from '@genkit-ai/firebase';
import { googleCloud } from '@genkit-ai/google-cloud';

// Import flows so that they are registered with Genkit.
// import * as projectAnalysisFlow from '@/ai/flows/project-analysis-flow';

const plugins: Plugin[] = [googleAI()];

if (process.env.NODE_ENV === 'production') {
  // Use the imported firebasePlugin directly
  plugins.push(
    firebasePlugin({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    }),
    googleCloud()
  );
} else {
  // For local development
  plugins.push(
    firebasePlugin({
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
