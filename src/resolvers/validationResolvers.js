import { storage } from '@forge/api';
import { generateUniqueId } from '../utils';
import { VALIDATION_CHECKLIST_STORAGE_KEY } from '../config';
import { getFromCache, updateCache } from '../cache';

// Get validation checklist
export const getValidationChecklist = async () => {
  const cachedChecklist = getFromCache('validationChecklist');
  if (cachedChecklist !== null) {
    return cachedChecklist;
  }
  
  const storedData = await storage.get(VALIDATION_CHECKLIST_STORAGE_KEY);
  return storedData || [];
};

// Add a new validation checklist item
export const addValidationChecklistItem = async ({ payload }) => {
  const { name } = payload;
  const storedData = (await storage.get(VALIDATION_CHECKLIST_STORAGE_KEY)) || [];

  const newItem = {
    id: generateUniqueId('validation'),
    name,
  };
  const updatedData = [...storedData, newItem];

  await storage.set(VALIDATION_CHECKLIST_STORAGE_KEY, updatedData);
  await updateCache([VALIDATION_CHECKLIST_STORAGE_KEY]);
  return newItem;
};

// Update a validation checklist item
export const updateValidationChecklistItem = async ({ payload }) => {
  const { id, name } = payload;
  const storedData = (await storage.get(VALIDATION_CHECKLIST_STORAGE_KEY)) || [];
  const updatedData = storedData.map((item) => (item.id === id ? { ...item, name } : item));

  await storage.set(VALIDATION_CHECKLIST_STORAGE_KEY, updatedData);
  await updateCache([VALIDATION_CHECKLIST_STORAGE_KEY]);
  return updatedData;
};

// Remove a validation checklist item
export const removeValidationChecklistItem = async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(VALIDATION_CHECKLIST_STORAGE_KEY)) || [];
  const updatedData = storedData.filter((item) => item.id !== id);

  await storage.set(VALIDATION_CHECKLIST_STORAGE_KEY, updatedData);
  await updateCache([VALIDATION_CHECKLIST_STORAGE_KEY]);
  return updatedData;
}; 