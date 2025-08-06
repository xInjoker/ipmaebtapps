
'use server';
/**
 * @fileOverview A Genkit flow for seeding the Firestore database with initial data.
 * This flow should be run once to populate the database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Import initial data
import { initialProjects } from '@/lib/projects';
import { initialUsers, initialRoles, initialBranches } from '@/lib/users';
import { initialEquipment } from '@/lib/equipment';
import { initialInspectors } from '@/lib/inspectors';
import { initialReports } from '@/lib/reports';
import { initialTrips } from '@/lib/trips';
import { initialTenders } from '@/lib/tenders';

// Initialize Firebase Admin SDK if not already initialized.
// On App Hosting, this will use the service account associated with the backend.
// For local development, it uses GOOGLE_APPLICATION_CREDENTIALS.
if (!getApps().length) {
    initializeApp();
}

const db = getFirestore();

async function seedCollection(collectionName: string, data: any[]) {
    const collectionRef = db.collection(collectionName);
    const batch = db.batch();

    for (const item of data) {
        // Use a predefined ID if it exists, otherwise Firestore will generate one.
        const docId = item.id ? String(item.id) : collectionRef.doc().id;
        const docRef = collectionRef.doc(docId);
        batch.set(docRef, { ...item, id: docId });
    }

    await batch.commit();
    return { success: true, count: data.length };
}


export const seedDatabaseFlow = ai.defineFlow(
  {
    name: 'seedDatabaseFlow',
    inputSchema: z.void(),
    outputSchema: z.object({
        status: z.string(),
        results: z.record(z.object({ success: z.boolean(), count: z.number() }))
    }),
  },
  async () => {
    const results: Record<string, { success: boolean; count: number }> = {};
    
    results.branches = await seedCollection('branches', initialBranches);
    results.roles = await seedCollection('roles', initialRoles);
    results.users = await seedCollection('users', initialUsers);
    results.projects = await seedCollection('projects', initialProjects);
    results.equipment = await seedCollection('equipment', initialEquipment);
    results.inspectors = await seedCollection('inspectors', initialInspectors);
    results.reports = await seedCollection('reports', initialReports);
    results.trips = await seedCollection('trips', initialTrips);
    results.tenders = await seedCollection('tenders', initialTenders);
    
    return {
        status: 'Database seeding completed!',
        results,
    };
  }
);
