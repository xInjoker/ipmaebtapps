
'use server';
/**
 * @fileOverview A Genkit flow for seeding the Firestore database with initial data.
 * This flow should be run once to populate the database.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Import initial data
import { initialProjects } from '@/lib/projects';
import { initialUsers, initialRoles, initialBranches } from '@/lib/users';
import { initialEquipment } from '@/lib/equipment';
import { initialInspectors } from '@/lib/inspectors';
import { initialReports } from '@/lib/reports';
import { initialTrips } from '@/lib/trips';
import { initialTenders } from '@/lib/tenders';

// Initialize Firebase Admin SDK
if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        initializeApp({
            credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
        });
    } else {
        // For local development, it will use application default credentials.
        // Ensure you've run `gcloud auth application-default login`
        initializeApp();
    }
}

const db = getFirestore();

async function seedCollection(collectionName: string, data: any[], idPrefix?: string) {
    const collectionRef = db.collection(collectionName);
    const batch = db.batch();

    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        let docId: string;
        if (item.id) {
            docId = String(item.id);
        } else if (idPrefix) {
            docId = `${idPrefix}-${String(i + 1).padStart(3, '0')}`;
        } else {
             docId = collectionRef.doc().id;
        }
        
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
    results.equipment = await seedCollection('equipment', initialEquipment, 'EQ');
    results.inspectors = await seedCollection('inspectors', initialInspectors, 'INSP');
    results.reports = await seedCollection('reports', initialReports, 'REP');
    results.trips = await seedCollection('trips', initialTrips, 'TRIP');
    results.tenders = await seedCollection('tenders', initialTenders, 'TND');
    
    return {
        status: 'Database seeding completed!',
        results,
    };
  }
);
