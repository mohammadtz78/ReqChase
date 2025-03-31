import { storage } from '@forge/api';
import { generateUniqueId } from '../utils';
import { STATUS_STORAGE_KEY } from '../config';
import { getFromCache, updateCache } from '../cache';

export const getStatuses = async () => {
  const cachedStatuses = await getFromCache('statuses');
  if (cachedStatuses !== null) {
    return cachedStatuses;
  }
  
  const statuses = await storage.get(STATUS_STORAGE_KEY) || [];
  return statuses;
};

export const addStatus = async ({ payload }) => {
  const { name, color } = payload;
  const statuses = await getStatuses();
  
  const newStatus = {
    id: generateUniqueId('status'),
    name,
    color
  };
  
  statuses.push(newStatus);
  await storage.set(STATUS_STORAGE_KEY, statuses);
  await updateCache([STATUS_STORAGE_KEY]);
  return newStatus;
};

export const updateStatus = async ({ payload }) => {
  const { id, name, color } = payload;
  const statuses = await getStatuses();
  
  const index = statuses.findIndex(status => status.id === id);
  if (index === -1) throw new Error('Status not found');
  
  statuses[index] = { ...statuses[index], name, color };
  await storage.set(STATUS_STORAGE_KEY, statuses);
  await updateCache([STATUS_STORAGE_KEY]);
  return statuses[index];
};

export const removeStatus = async ({ payload }) => {
  const { id } = payload;
  const statuses = await getStatuses();
  
  const filteredStatuses = statuses.filter(status => status.id !== id);
  await storage.set(STATUS_STORAGE_KEY, filteredStatuses);
  await updateCache([STATUS_STORAGE_KEY]);
  return filteredStatuses;
}; 