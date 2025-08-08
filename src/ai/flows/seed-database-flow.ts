
'use server';
/**
 * @fileOverview A flow to seed the Firestore database with initial data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, collection, doc, writeBatch } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { initialUsers, initialRoles, initialBranches } from '@/lib/users';

const db = getFirestore(app);

const SeedDatabaseOutputSchema = z.string().describe("A summary of the seeding operation.");
export type SeedDatabaseOutput = z.infer<typeof SeedDatabaseOutputSchema>;

export async function seedDatabase(): Promise<SeedDatabaseOutput> {
  return seedDatabaseFlow();
}

const seedDatabaseFlow = ai.defineFlow(
  {
    name: 'seedDatabaseFlow',
    inputSchema: z.void(),
    outputSchema: SeedDatabaseOutputSchema,
  },
  async () => {
    console.log('Starting database seed...');
    const batch = writeBatch(db);

    // Seed Roles
    console.log(`Preparing to seed ${initialRoles.length} roles...`);
    initialRoles.forEach(role => {
      const roleRef = doc(db, 'roles', role.id);
      batch.set(roleRef, role);
    });

    // Seed Branches
    console.log(`Preparing to seed ${initialBranches.length} branches...`);
    initialBranches.forEach(branch => {
        const branchRef = doc(db, 'branches', branch.id);
        batch.set(branchRef, branch);
    });

    // Seed Users
    console.log(`Preparing to seed ${initialUsers.length} users...`);
    initialUsers.forEach(user => {
        const userRef = doc(db, 'users', String(user.id));
        batch.set(userRef, user);
    });

    try {
      await batch.commit();
      const summary = `Successfully seeded ${initialRoles.length} roles, ${initialBranches.length} branches, and ${initialUsers.length} users.`;
      console.log(summary);
      return summary;
    } catch (error) {
      console.error('Error committing batch:', error);
      throw new Error('Failed to seed database.');
    }
  }
);
