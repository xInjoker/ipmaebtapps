
import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';
import {googleCloud} from '@genkit-ai/google-cloud';

// Import flows so that they are registered with Genkit.
import * as projectAnalysisFlow from '@/ai/flows/project-analysis-flow';
import * as seedDatabaseFlow from '@/ai/flows/seed-database-flow';

const plugins: Plugin[] = [googleAI()];
if (process.env.NODE_ENV === 'production') {
  plugins.push(firebase(), googleCloud());
} else {
  // For local development, ensure Firebase plugin is initialized for seeding
  plugins.push(firebase());
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
