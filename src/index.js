// Forge Backend: Resolvers using Jira's Storage API
import Resolver from '@forge/resolver'; // Correct import for Resolver
import api, { storage, route } from '@forge/api';

const USER_REQUIREMENTS_STORAGE_KEY = 'user-requirements'; // Static key for shared memory access
const VALIDATION_CHECKLIST_STORAGE_KEY = 'validation-checklist'; // Static key for shared memory access
const VERIFICATION_CHECKLIST_STORAGE_KEY = 'verification-checklist'; // Static key for shared memory access
const REQUIREMENT_ISSUE_STORAGE_KEY = 'requirement-issue-join'; // Static key for shared memory access
const TYPES_STORAGE_KEY = 'types'; // Static key for shared memory access

const resolver = new Resolver();

// Get all user requirements
resolver.define('getRequirements', async () => {
  const storedData = await storage.get(USER_REQUIREMENTS_STORAGE_KEY);
  return storedData || [];
});

// Add a new user requirement
resolver.define('addRequirement', async ({ payload }) => {
  const { name, description, typeId } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];

  const newRequirement = {
    id: new Date().toISOString(), // Unique ID based on timestamp
    name,
    description,
    validationChecks: [],
    verificationChecks: [],
    typeId
  };
  const updatedData = [...storedData, newRequirement];

  await storage.set(USER_REQUIREMENTS_STORAGE_KEY, updatedData);
  return newRequirement;
});

// Delete a user requirement
resolver.define('deleteRequirement', async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];

  const foundItem = storedData.find((req) => req.id === id);
  if (!foundItem) {
    return `Requirement ${id} not found.`;
  }
  const updatedData = storedData.filter((req) => req.id !== id);
  await storage.set(USER_REQUIREMENTS_STORAGE_KEY, updatedData);

  return `Requirement ${id} deleted successfully.`;
});

resolver.define('getRequirement', async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];

  const requirement = storedData.find((req) => req.id === id);
  if (!requirement) {
    throw new Error(`Requirement ${id} not found.`);
  }

  return requirement;
});

// Update an existing requirement
resolver.define('updateRequirement', async ({ payload }) => {
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
});

resolver.define('getAssignedRequirements', async ({ payload }) => {
  const { issueId } = payload;
  const storedData = (await storage.get(REQUIREMENT_ISSUE_STORAGE_KEY)) || {};
  const requirementIds = storedData[issueId] || [];
  const userRequirements = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];
  const requirementDict = {}
  userRequirements.forEach(req => {
    requirementDict[req.id] = req;
  });
  const assignedRequirements = requirementIds.map(id => { return { name: requirementDict[id].name, id } });
  return assignedRequirements;
})

resolver.define('getDashboardData', async ({ payload }) => {
  const requirements = await storage.get(USER_REQUIREMENTS_STORAGE_KEY) || [];
  const requirementIssueMappings = await storage.get(REQUIREMENT_ISSUE_STORAGE_KEY) || {};
  let issueData = { d: Object.keys(requirementIssueMappings) }
  let issueDataDict = {}

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
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch issue ${issueId}`);
    }

    issueData = await response.json()
    for (const issue of issueData.issues) {
      issueDataDict[issue.id] = issue.fields.summary
    }
  } catch (error) {
    console.error(error);
    return { error: error.message }
  }

  const data = requirements.map((requirement) => {
    const { id, name, description } = requirement;
    const issueIds = []
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
})

// Assign requirements to an issue
resolver.define('assignRequirements', async ({ payload }) => {
  const { issueId, requirements } = payload;

  if (!issueId || !Array.isArray(requirements)) {
    throw new Error('Invalid payload: issueId and requirements must be provided.');
  }

  // Fetch existing data
  const storedData = (await storage.get(REQUIREMENT_ISSUE_STORAGE_KEY)) || {};

  // Update the data with new assignments
  storedData[issueId] = requirements;

  // Save back to storage
  await storage.set(REQUIREMENT_ISSUE_STORAGE_KEY, storedData);

  return {
    message: `Requirements successfully assigned to issue ${issueId}.`,
    issueId,
    requirements,
  };
});

resolver.define("getValidationChecklist", async () => {
  const storedData = await storage.get(VALIDATION_CHECKLIST_STORAGE_KEY);
  return storedData || [];
});

// Add a new validation checklist item
resolver.define("addValidationChecklistItem", async ({ payload }) => {
  const { name } = payload;
  const storedData = (await storage.get(VALIDATION_CHECKLIST_STORAGE_KEY)) || [];

  const newItem = {
    id: new Date().toISOString(),
    name,
  };
  const updatedData = [...storedData, newItem];

  await storage.set(VALIDATION_CHECKLIST_STORAGE_KEY, updatedData);
  return newItem;
});

// Update a validation checklist item
resolver.define("updateValidationChecklistItem", async ({ payload }) => {
  const { id, name } = payload;
  const storedData = (await storage.get(VALIDATION_CHECKLIST_STORAGE_KEY)) || [];
  const updatedData = storedData.map((item) => (item.id === id ? { ...item, name } : item));

  await storage.set(VALIDATION_CHECKLIST_STORAGE_KEY, updatedData);
  return updatedData;
});

// Remove a validation checklist item
resolver.define("removeValidationChecklistItem", async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(VALIDATION_CHECKLIST_STORAGE_KEY)) || [];
  const updatedData = storedData.filter((item) => item.id !== id);

  await storage.set(VALIDATION_CHECKLIST_STORAGE_KEY, updatedData);
  return updatedData;
});

resolver.define("getVerificationChecklist", async () => {
  const storedData = await storage.get(VERIFICATION_CHECKLIST_STORAGE_KEY);
  return storedData || [];
});

// Add a new Verification checklist item
resolver.define("addVerificationChecklistItem", async ({ payload }) => {
  const { name } = payload;
  const storedData = (await storage.get(VERIFICATION_CHECKLIST_STORAGE_KEY)) || [];

  const newItem = {
    id: new Date().toISOString(),
    name,
  };
  const updatedData = [...storedData, newItem];

  await storage.set(VERIFICATION_CHECKLIST_STORAGE_KEY, updatedData);
  return newItem;
});

// Update a Verification checklist item
resolver.define("updateVerificationChecklistItem", async ({ payload }) => {
  const { id, name } = payload;
  const storedData = (await storage.get(VERIFICATION_CHECKLIST_STORAGE_KEY)) || [];
  const updatedData = storedData.map((item) => (item.id === id ? { ...item, name } : item));

  await storage.set(VERIFICATION_CHECKLIST_STORAGE_KEY, updatedData);
  return updatedData;
});

// Remove a Verification checklist item
resolver.define("removeVerificationChecklistItem", async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(VERIFICATION_CHECKLIST_STORAGE_KEY)) || [];
  const updatedData = storedData.filter((item) => item.id !== id);

  await storage.set(VERIFICATION_CHECKLIST_STORAGE_KEY, updatedData);
  return updatedData;
});

// Types Resolver Functions
resolver.define("getTypes", async () => {
  const storedData = await storage.get(TYPES_STORAGE_KEY);
  return storedData || [];
});

// Add a new type
resolver.define("addType", async ({ payload }) => {
  const { name, color } = payload;
  const storedData = (await storage.get(TYPES_STORAGE_KEY)) || [];

  const newItem = {
    id: new Date().toISOString(),
    name,
    color
  };
  const updatedData = [...storedData, newItem];

  await storage.set(TYPES_STORAGE_KEY, updatedData);
  return newItem;
});

// Update a type
resolver.define("updateType", async ({ payload }) => {
  const { id, name, color } = payload;
  const storedData = (await storage.get(TYPES_STORAGE_KEY)) || [];
  const updatedData = storedData.map((item) => (item.id === id ? { ...item, name, color } : item));

  await storage.set(TYPES_STORAGE_KEY, updatedData);
  return updatedData;
});

// Remove a type
resolver.define("removeType", async ({ payload }) => {
  const { id } = payload;
  const storedData = (await storage.get(TYPES_STORAGE_KEY)) || [];
  const updatedData = storedData.filter((item) => item.id !== id);

  await storage.set(TYPES_STORAGE_KEY, updatedData);
  return updatedData;
});

export const handler = resolver.getDefinitions();