import { storage, route } from '@forge/api';
import api from '@forge/api';
import { generateUniqueId } from '../utils';

const USER_REQUIREMENTS_STORAGE_KEY = 'user-requirements';

// Get all user requirements
export const getRequirements = async () => {
  const storedData = await storage.get(USER_REQUIREMENTS_STORAGE_KEY);
  return storedData || [];
};

// Add a new user requirement
export const addRequirement = async ({ payload }) => {
  const { name, description, typeId } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];

  const newRequirement = {
    id: generateUniqueId('requirement'),
    name,
    description,
    validationChecks: [],
    verificationChecks: [],
    typeId
  };
  const updatedData = [...storedData, newRequirement];

  await storage.set(USER_REQUIREMENTS_STORAGE_KEY, updatedData);
  return newRequirement;
};

// Delete a user requirement
export const deleteRequirement = async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];

  const foundItem = storedData.find((req) => req.id === id);
  if (!foundItem) {
    return `Requirement ${id} not found.`;
  }
  const updatedData = storedData.filter((req) => req.id !== id);
  await storage.set(USER_REQUIREMENTS_STORAGE_KEY, updatedData);

  return `Requirement ${id} deleted successfully.`;
};

// Get a specific requirement
export const getRequirement = async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];

  const requirement = storedData.find((req) => req.id === id);
  if (!requirement) {
    throw new Error(`Requirement ${id} not found.`);
  }

  return requirement;
};

// Update an existing requirement
export const updateRequirement = async ({ payload }) => {
  const { id, name, description, validationChecks, verificationChecks, typeId } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];

  const index = storedData.findIndex((req) => req.id === id);
  if (index === -1) {
    throw new Error(`Requirement ${id} not found.`);
  }

  storedData[index] = { 
    ...storedData[index], 
    name, 
    description,
    validationChecks: validationChecks || storedData[index].validationChecks || [],
    verificationChecks: verificationChecks || storedData[index].verificationChecks || [],
    typeId
  };

  await storage.set(USER_REQUIREMENTS_STORAGE_KEY, storedData);
  return storedData[index];
};

// Get dashboard data
export const getDashboardData = async ({ payload }) => {
  const requirements = await storage.get(USER_REQUIREMENTS_STORAGE_KEY) || [];
  const requirementIssueMappings = await storage.get('requirement-issue-join') || {};
  let issueData = { d: Object.keys(requirementIssueMappings) };
  let issueDataDict = {};

  try {
    const response = await api.asApp().requestJira(route`/rest/api/3/issue/bulkfetch`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "properties": [],
        issueIdsOrKeys: Object.keys(requirementIssueMappings),
        "expand": [
          "names"
        ],
        "fieldsByKeys": false,
        fields: ['summary', 'id']
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch issue ${issueId}`);
    }

    issueData = await response.json();
    for (const issue of issueData.issues) {
      issueDataDict[issue.id] = issue.fields.summary;
    }
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }

  const data = requirements.map((requirement) => {
    const { id, name, description } = requirement;
    const issueIds = [];
    for (const [issueId, requirements] of Object.entries(requirementIssueMappings)) {
      if (requirements?.includes?.(id)) {
        issueIds.push(issueId);
      }
    }

    const children = issueIds.map((issueId) => ({
      id: `${id}-${issueId}`,
      name: `Issue ${issueId}`,
      description: `description`
    }));

    return {
      id,
      name,
      description,
      children
    };
  });

  return { data };
}; 