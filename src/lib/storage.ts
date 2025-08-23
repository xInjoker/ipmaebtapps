
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

/**
 * Uploads a file to Firebase Cloud Storage.
 * @param file The file to upload.
 * @param path The path where the file should be stored in Cloud Storage.
 * @returns A promise that resolves with the public download URL of the file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading file to ${path}:`, error);
    // Depending on your error handling strategy, you might want to re-throw the error
    // or return a specific error message or a default URL.
    throw new Error(`File upload failed for path: ${path}`);
  }
}

/**
 * Deletes a file from Firebase Cloud Storage using its download URL.
 * @param url The full download URL of the file to delete.
 * @returns A promise that resolves when the file is deleted.
 */
export async function deleteFileByUrl(url: string): Promise<void> {
    if (!url.startsWith('https://firebasestorage.googleapis.com')) {
        console.warn(`URL is not a Firebase Storage URL, skipping deletion: ${url}`);
        return;
    }
    try {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef);
    } catch (error: any) {
        // It's common to encounter 'object-not-found' errors if a file was already deleted
        // or if the URL is somehow invalid. We can choose to log these without failing the whole operation.
        if (error.code === 'storage/object-not-found') {
            console.warn(`File not found for deletion, it might have been already deleted: ${url}`);
        } else {
            console.error(`Error deleting file from URL ${url}:`, error);
        }
    }
}
