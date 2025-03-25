import { storage, route } from '@forge/api';
import api from '@forge/api';
import {
  TYPES_STORAGE_KEY,
  STAGES_STORAGE_KEY,
  STATUS_STORAGE_KEY,
  VALIDATION_CHECKLIST_STORAGE_KEY,
  VERIFICATION_CHECKLIST_STORAGE_KEY
} from './config';

// Cache object to store data
const cache = {
  types: null,
  stages: null,
  statuses: null,
  validationChecklist: null,
  verificationChecklist: null,
  users: null
};

// Storage key to cache mapping
const storageKeyMap = {
  [TYPES_STORAGE_KEY]: 'types',
  [STAGES_STORAGE_KEY]: 'stages',
  [STATUS_STORAGE_KEY]: 'statuses',
  [VALIDATION_CHECKLIST_STORAGE_KEY]: 'validationChecklist',
  [VERIFICATION_CHECKLIST_STORAGE_KEY]: 'verificationChecklist'
};

// Initialize cache with data from storage
export const initializeCache = async () => {
  const promises = Object.entries(storageKeyMap).map(async ([key, cacheKey]) => {
    const data = await storage.get(key);
    cache[cacheKey] = data || [];
  });
  await Promise.all(promises);
};

export const getUserFromCache = async () => {
  if (!cache.users) {
    return await fetchAndCacheUsers()
  }
  return cache.users
}
// Get data from cache
export const getFromCache = (key) => {
  return cache[key];
};

// Update cache for specific keys
export const updateCache = async (keys) => {
  const promises = keys.map(async (key) => {
    if (storageKeyMap[key]) {
      const data = await storage.get(key);
      cache[storageKeyMap[key]] = data || [];
    }
  });
  await Promise.all(promises);
};

// Get all cached data
export const getAllCachedData = () => {
  return {
    types: cache.types,
    stages: cache.stages,
    statuses: cache.statuses,
    validationChecklist: cache.validationChecklist,
    verificationChecklist: cache.verificationChecklist,
    users: cache.users
  };
};

// Clear cache
export const clearCache = () => {
  Object.keys(cache).forEach(key => {
    cache[key] = null;
  });
};

// Fetch and cache users
export const fetchAndCacheUsers = async () => {

  const currentProject = await api.asUser().requestJira(route`/rest/api/3/project/search`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  const currentProjectKey = (await currentProject.json())?.values?.[0]?.key
  const response = await api.asUser().requestJira(route`/rest/api/3/user/search/query?query=is assignee of ${currentProjectKey}`, {
    headers: {
      'Accept': 'application/json'
    }
  });


  const users = (await response.json()).values || [];

  // Transform users to only include required fields
  const transformedUsers = users.reduce((acc, user) => {
    acc[user.accountId] = {
      accountId: user.accountId,
      displayName: user.displayName,
      avatarUrl: user.avatarUrls?.['48x48'] || null
    };
    return acc;
  }, {});

  cache.users = transformedUsers;
  return transformedUsers
}; 