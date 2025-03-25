import { getFromCache } from '../cache';

// Get all users
export const getUsers = async () => {
  const users = await getUserFromCache();
  return Object.values(users);
}; 