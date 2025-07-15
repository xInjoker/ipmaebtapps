
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, onSnapshot, writeBatch, addDoc, updateDoc, query, where } from 'firebase/firestore';
import type { Project } from '@/lib/data';
import { initialProjects } from '@/lib/projects';

const PROJECTS_COLLECTION = 'projects';
const LOCAL_STORAGE_KEY = 'projects';

// --- Local Storage Functions ---
export const saveProjectsToLocalStorage = (projects: Project[]) => {
    try {
        const data = JSON.stringify(projects);
        localStorage.setItem(LOCAL_STORAGE_KEY, data);
    } catch (error) {
        console.error("Error saving projects to localStorage", error);
    }
};

export const loadProjectsFromLocalStorage = (): Project[] => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading projects from localStorage", error);
        return [];
    }
};


// --- Real-time listener ---
export const streamProjects = (callback: (projects: Project[]) => void) => {
    const projectsCollection = collection(db, PROJECTS_COLLECTION);
    return onSnapshot(projectsCollection, (snapshot) => {
        const projects: Project[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as unknown as Project)); // Cast needed because firestore returns its own types
        callback(projects);
    });
};

// --- CRUD Operations ---
export const addProject = async (projectData: Omit<Project, 'id'>) => {
    const projectsCollection = collection(db, PROJECTS_COLLECTION);
    // Correctly return the promise from the addDoc call
    return await addDoc(projectsCollection, projectData);
};

export const updateProject = async (id: string, projectData: Partial<Project>) => {
    const projectDoc = doc(db, PROJECTS_COLLECTION, id);
    await updateDoc(projectDoc, projectData);
};

// --- Data Seeding ---
export const seedInitialProjects = async () => {
    const projectsCollection = collection(db, PROJECTS_COLLECTION);
    const snapshot = await getDocs(projectsCollection);
    
    // Only seed if the collection is empty
    if (snapshot.empty) {
        console.log("Seeding initial projects to Firestore...");
        const batch = writeBatch(db);
        initialProjects.forEach(project => {
            const { id, ...projectData } = project; // Firestore will auto-generate IDs
            const newDocRef = doc(projectsCollection); // Create a new doc reference
            batch.set(newDocRef, projectData);
        });
        await batch.commit();
        console.log("Initial projects have been seeded.");
    }
};
