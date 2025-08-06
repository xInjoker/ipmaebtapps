
import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase/plugin';
import {googleCloud} from '@genkit-ai/google-cloud';

// Import flows so that they are registered with Genkit.
// import * as projectAnalysisFlow from '@/ai/flows/project-analysis-flow';


const plugins: Plugin[] = [googleAI()];

if (process.env.NODE_ENV === 'production') {
  // In production, Firebase and Google Cloud plugins are needed.
  // App Hosting automatically provides the necessary credentials.
  plugins.push(firebase(), googleCloud());
} else {
  // For local development using the emulator or a real project, 
  // you may need to initialize Firebase differently.
  // For the seeding script, firebase() is required to interact with Firestore.
  plugins.push(firebase());
}


export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
