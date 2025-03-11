// Forge Backend: Resolvers using Jira's Storage API
import Resolver from '@forge/resolver'; // Correct import for Resolver
import api, { storage, route } from '@forge/api';

const USER_REQUIREMENTS_STORAGE_KEY = 'user-requirements'; // Static key for shared memory access
const REQUIREMENT_ISSUE_STORAGE_KEY = 'requirement-issue-join'; // Static key for shared memory access

const resolver = new Resolver();

// Get all user requirements
resolver.define('getRequirements', async () => {
  const storedData = await storage.get(USER_REQUIREMENTS_STORAGE_KEY);
  return storedData || [];
});

// Add a new user requirement
resolver.define('addRequirement', async ({ payload }) => {
  const { name, description } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];

  const newRequirement = {
    id: new Date().toISOString(), // Unique ID based on timestamp
    name,
    description
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

export const handler = resolver.getDefinitions();