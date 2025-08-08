
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
