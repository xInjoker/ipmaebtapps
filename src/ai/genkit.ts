import { genkit, Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { googleCloud } from '@genkit-ai/google-cloud';

// Import flows so that they are registered with Genkit.
// import * as projectAnalysisFlow from '@/ai/flows/project-analysis-flow';

const plugins: Plugin[] = [googleAI()];

let firebasePlugin: any;

if (process.env.NODE_ENV === 'production') {
  firebasePlugin = require('@genkit-ai/firebase/firebase').firebase({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
  
  plugins.push(
    firebasePlugin,
    googleCloud()
  );
} else {
  firebasePlugin = require('@genkit-ai/firebase/firebase').firebase({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    emulators: {
      firestore: process.env.FIRESTORE_EMULATOR_HOST 
        ? { host: process.env.FIRESTORE_EMULATOR_HOST } 
        : undefined
    }
  });
  
  plugins.push(firebasePlugin);
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
