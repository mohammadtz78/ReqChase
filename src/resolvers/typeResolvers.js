import { storage } from '@forge/api';
import { generateUniqueId } from '../utils';

const TYPES_STORAGE_KEY = 'types';

// Get all types
export const getTypes = async () => {
  const storedData = await storage.get(TYPES_STORAGE_KEY);
  return storedData || [];
};

// Add a new type
export const addType = async ({ payload }) => {
  const { name, color } = payload;
  const storedData = (await storage.get(TYPES_STORAGE_KEY)) || [];

  const newItem = {
    id: generateUniqueId('type'),
    name,
    color
  };
  const updatedData = [...storedData, newItem];

  await storage.set(TYPES_STORAGE_KEY, updatedData);
  return newItem;
};

// Update a type
export const updateType = async ({ payload }) => {
  const { id, name, color } = payload;
  const storedData = (await storage.get(TYPES_STORAGE_KEY)) || [];
  const updatedData = storedData.map((item) => (item.id === id ? { ...item, name, color } : item));

  await storage.set(TYPES_STORAGE_KEY, updatedData);
  return updatedData;
};

// Remove a type
export const removeType = async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(TYPES_STORAGE_KEY)) || [];
  const updatedData = storedData.filter((item) => item.id !== id);

  await storage.set(TYPES_STORAGE_KEY, updatedData);
  return updatedData;
}; 