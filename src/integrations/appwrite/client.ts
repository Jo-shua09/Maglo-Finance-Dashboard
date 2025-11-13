import { Client, Account, Databases, ID } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || "project-id");

export const databases = new Databases(client);
export const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || "database-id";
export const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ID || "collection-id";
export { ID };

export const account = new Account(client);
export { client };
