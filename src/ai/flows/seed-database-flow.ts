
'use server';
/**
 * @fileOverview A flow to seed the Firestore database with initial data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';
import { initialRoles, initialBranches } from '@/lib/users';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

export const seedDatabaseFlow = ai.defineFlow(
  {
    name: 'seedDatabaseFlow',
    inputSchema: z.void(),
    outputSchema: z.string(),
  },
  async () => {
    console.log('Starting database seed...');
    const batch = writeBatch(db);

    // Seed Roles
    initialRoles.forEach((role) => {
      const roleRef = doc(db, 'roles', role.id);
      batch.set(roleRef, role);
    });
    console.log(`${initialRoles.length} roles added to batch.`);
    
    // Seed Branches
    initialBranches.forEach((branch) => {
      const branchRef = doc(db, 'branches', branch.id);
      batch.set(branchRef, branch);
    });
    console.log(`${initialBranches.length} branches added to batch.`);

    try {
      await batch.commit();
      const successMessage = 'Successfully seeded roles and branches collections.';
      console.log(successMessage);
      return successMessage;
    } catch (error) {
      console.error('Error committing batch:', error);
      throw new Error('Failed to seed database.');
    }
  }
);

export async function seedDatabase(): Promise<string> {
    return seedDatabaseFlow();
}
