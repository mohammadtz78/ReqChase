import { storage } from '@forge/api';
import { generateUniqueId } from '../utils';

const VERIFICATION_CHECKLIST_STORAGE_KEY = 'verification-checklist';

// Get verification checklist
export const getVerificationChecklist = async () => {
  const storedData = await storage.get(VERIFICATION_CHECKLIST_STORAGE_KEY);
  return storedData || [];
};

// Add a new verification checklist item
export const addVerificationChecklistItem = async ({ payload }) => {
  const { name } = payload;
  const storedData = (await storage.get(VERIFICATION_CHECKLIST_STORAGE_KEY)) || [];

  const newItem = {
    id: generateUniqueId('verification'),
    name,
  };
  const updatedData = [...storedData, newItem];

  await storage.set(VERIFICATION_CHECKLIST_STORAGE_KEY, updatedData);
  return newItem;
};

// Update a verification checklist item
export const updateVerificationChecklistItem = async ({ payload }) => {
  const { id, name } = payload;
  const storedData = (await storage.get(VERIFICATION_CHECKLIST_STORAGE_KEY)) || [];
  const updatedData = storedData.map((item) => (item.id === id ? { ...item, name } : item));

  await storage.set(VERIFICATION_CHECKLIST_STORAGE_KEY, updatedData);
  return updatedData;
};

// Remove a verification checklist item
export const removeVerificationChecklistItem = async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(VERIFICATION_CHECKLIST_STORAGE_KEY)) || [];
  const updatedData = storedData.filter((item) => item.id !== id);

  await storage.set(VERIFICATION_CHECKLIST_STORAGE_KEY, updatedData);
  return updatedData;
}; 