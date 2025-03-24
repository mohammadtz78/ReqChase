import { storage } from '@forge/api';
import { generateUniqueId } from '../utils';
import { STAGES_STORAGE_KEY } from '../config';
import { getFromCache, updateCache } from '../cache';

export const getStages = async () => {
  const cachedStages = getFromCache('stages');
  if (cachedStages !== null) {
    return cachedStages;
  }
  
  const stages = await storage.get(STAGES_STORAGE_KEY) || [];
  return stages;
};

export const addStage = async ({ payload }) => {
  const { name, color } = payload;
  const stages = await getStages();
  
  const newStage = {
    id: generateUniqueId('stage'),
    name,
    color
  };
  
  stages.push(newStage);
  await storage.set(STAGES_STORAGE_KEY, stages);
  await updateCache([STAGES_STORAGE_KEY]);
  return newStage;
};

export const updateStage = async ({ payload }) => {
  const { id, name, color } = payload;
  const stages = await getStages();
  
  const index = stages.findIndex(stage => stage.id === id);
  if (index === -1) throw new Error('Stage not found');
  
  stages[index] = { ...stages[index], name, color };
  await storage.set(STAGES_STORAGE_KEY, stages);
  await updateCache([STAGES_STORAGE_KEY]);
  return stages[index];
};

export const removeStage = async ({ payload }) => {
  const { id } = payload;
  const stages = await getStages();
  
  const filteredStages = stages.filter(stage => stage.id !== id);
  await storage.set(STAGES_STORAGE_KEY, filteredStages);
  await updateCache([STAGES_STORAGE_KEY]);
  return filteredStages;
}; 