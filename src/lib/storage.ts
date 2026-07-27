import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export const firebaseStorage = {
  /**
   * Uploads a file/blob to Firebase Storage under the given path.
   * e.g., 'products/shirt_10001.jpg' or 'backups/pos_backup.json'
   * Returns the public download URL.
   */
  uploadFile: async (path: string, file: File | Blob): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  },

  /**
   * Deletes a file from Firebase Storage given its reference path.
   */
  deleteFile: async (path: string): Promise<void> => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },

  /**
   * Retrieves the public download URL for a file in Firebase Storage.
   */
  getURL: async (path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  },
};
