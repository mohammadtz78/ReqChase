import { storage, route } from '@forge/api';
import api from '@forge/api';
import { generateUniqueId } from '../utils';
import { USER_REQUIREMENTS_STORAGE_KEY, REQUIREMENT_ISSUE_STORAGE_KEY } from '../config';
import { getTypes } from './typeResolvers';
import { getStages } from './stageResolvers';
import { getStatuses } from './statusResolvers';
import { fetchAndCacheUsers, getFromCache } from '../cache';


// Get all user requirements
export const getRequirements = async () => {
  const storedData = await storage.get(USER_REQUIREMENTS_STORAGE_KEY);
  const requirementIssueMappings = await storage.get(REQUIREMENT_ISSUE_STORAGE_KEY) || {};

  if (!storedData) return [];

  // Get types, stages, and statuses from cache
  const types = getFromCache('types') || await getTypes();
  const stages = getFromCache('stages') || await getStages();
  const statuses = getFromCache('statuses') || await getStatuses();

  const typesMap = types.reduce((acc, type) => {
    acc[type.id] = type;
    return acc;
  }, {});

  const stagesMap = stages.reduce((acc, stage) => {
    acc[stage.id] = stage;
    return acc;
  }, {});

  const statusesMap = statuses.reduce((acc, status) => {
    acc[status.id] = status;
    return acc;
  }, {});

  // Get all issues that are related to requirements
  const issueIds = Object.keys(requirementIssueMappings);
  let issueStatuses = {};

  if (issueIds.length > 0) {
    try {
      const response = await api.asApp().requestJira(route`/rest/api/3/issue/bulkfetch`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "properties": [],
          issueIdsOrKeys: issueIds,
          "expand": ["names"],
          "fieldsByKeys": false,
          fields: ['status']
        })
      });

      if (response.ok) {
        const data = await response.json();
        issueStatuses = data.issues.reduce((acc, issue) => {
          acc[issue.id] = issue.fields.status.statusCategory.key;
          return acc;
        }, {});
      }
    } catch (error) {
      console.error('Error fetching issue statuses:', error);
    }
  }

  // Calculate progress for each requirement
  return storedData.map(requirement => {
    const relatedIssueIds = [];
    for (const [issueId, reqIds] of Object.entries(requirementIssueMappings)) {
      if (reqIds?.includes?.(requirement.id)) {
        relatedIssueIds.push(issueId);
      }
    }

    let progress = 0;
    if (relatedIssueIds.length > 0) {
      const completedIssues = relatedIssueIds.filter(issueId =>
        issueStatuses[issueId] === 'done'
      ).length;
      progress = Math.round((completedIssues / relatedIssueIds.length) * 100);
    }

    return {
      ...requirement,
      progress,
      type: requirement.typeId ? (typesMap[requirement.typeId] || { id: requirement.typeId, name: '-', color: '#e0e0e0' }) : { name: '-', color: '#e0e0e0' },
      stage: requirement.stageId ? (stagesMap[requirement.stageId] || { name: '-', color: '#e0e0e0' }) : { name: '-', color: '#e0e0e0' },
      status: requirement.statusId ? (statusesMap[requirement.statusId] || { name: '-', color: '#e0e0e0' }) : { name: '-', color: '#e0e0e0' }
    };
  });
};

// Add a new user requirement
export const addRequirement = async ({ payload, context }) => {
  const { name, description, typeId, stageId, statusId, size } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];
  const user = context?.accountId;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB');
  
  const newRequirement = {
    id: generateUniqueId('requirement'),
    name,
    description,
    validationChecks: [],
    verificationChecks: [],
    typeId,
    stageId,
    statusId,
    size,
    logs: [`{{@${user}@}} created requirement {{#${dateStr}#}}`]
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

  // Also remove this requirement from any issue-requirement mappings
  const requirementIssueMap = await storage.get(REQUIREMENT_ISSUE_STORAGE_KEY) || {};
  let mapUpdated = false;

  // Iterate through all issues and remove this requirement ID from their arrays
  for (const issueId in requirementIssueMap) {
    if (requirementIssueMap[issueId]?.includes?.(id)) {
      requirementIssueMap[issueId] = requirementIssueMap[issueId].filter(reqId => reqId !== id);
      mapUpdated = true;
    }
  }

  // Save the updated mapping if changes were made
  if (mapUpdated) {
    await storage.set(REQUIREMENT_ISSUE_STORAGE_KEY, requirementIssueMap);
  }

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

  // Get users from cache to transform IDs to display names in logs
  const users = getFromCache('users') || {};
  
  // Transform logs to use display names
  const transformedLogs = requirement?.logs?.map?.(log => {
    // Replace all instances of {{@userId@}} with the user's display name
    return log.replace(/{{@([^@]+)@}}/g, (match, userId) => {
      return users[userId]?.displayName || userId;
    });
  });

  return {
    ...requirement,
    logs: transformedLogs
  };
};

// Update an existing requirement
export const updateRequirement = async ({ payload, context }) => {
  const { id, name, description, validationChecks, verificationChecks, typeId, stageId, statusId, priority, importance, size } = payload;
  const storedData = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];

  const index = storedData.findIndex((req) => req.id === id);
  if (index === -1) {
    throw new Error(`Requirement ${id} not found.`);
  }

  const oldRequirement = storedData?.[index]||{};
  const newRequirement = {
    ...oldRequirement,
    name,
    description,
    validationChecks: validationChecks || oldRequirement.validationChecks || [],
    verificationChecks: verificationChecks || oldRequirement.verificationChecks || [],
    typeId,
    stageId,
    statusId,
    priority,
    importance,
    size
  };

  // Generate logs for changes
  const logs = [...(oldRequirement.logs || [])];
  const user = context?.accountId;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB');

  // Get lookup data from cache
  const types = getFromCache('types') || await getTypes();
  const stages = getFromCache('stages') || await getStages();
  const statuses = getFromCache('statuses') || await getStatuses();

  // Create lookup maps for faster access
  const typesMap = types.reduce((acc, type) => {
    acc[type.id] = type;
    return acc;
  }, {});

  const stagesMap = stages.reduce((acc, stage) => {
    acc[stage.id] = stage;
    return acc;
  }, {});

  const statusesMap = statuses.reduce((acc, status) => {
    acc[status.id] = status;
    return acc;
  }, {});

  // Track changes for each field
  if (name !== oldRequirement.name) {
    logs.push(`{{@${user}@}} changed name from "${oldRequirement.name}" to "${name}" {{#${dateStr}#}}`);
  }
  if (description !== oldRequirement.description) {
    logs.push(`{{@${user}@}} changed description from "${oldRequirement.description}" to "${description}" {{#${dateStr}#}}`);
  }
  if (typeId !== oldRequirement.typeId) {
    const oldType = typesMap[oldRequirement.typeId]?.name || 'None';
    const newType = typesMap[typeId]?.name || 'None';
    logs.push(`{{@${user}@}} changed type from "${oldType}" to "${newType}" {{#${dateStr}#}}`);
  }
  if (stageId !== oldRequirement.stageId) {
    const oldStage = stagesMap[oldRequirement.stageId]?.name || 'None';
    const newStage = stagesMap[stageId]?.name || 'None';
    logs.push(`{{@${user}@}} changed stage from "${oldStage}" to "${newStage}" {{#${dateStr}#}}`);
  }
  if (statusId !== oldRequirement.statusId) {
    const oldStatus = statusesMap[oldRequirement.statusId]?.name || 'None';
    const newStatus = statusesMap[statusId]?.name || 'None';
    logs.push(`{{@${user}@}} changed status from "${oldStatus}" to "${newStatus}" {{#${dateStr}#}}`);
  }
  if (priority !== oldRequirement.priority) {
    logs.push(`{{@${user}@}} changed priority from "${oldRequirement.priority || 'None'}" to "${priority || 'None'}" {{#${dateStr}#}}`);
  }
  if (importance !== oldRequirement.importance) {
    logs.push(`{{@${user}@}} changed importance from "${oldRequirement.importance || 'None'}" to "${importance || 'None'}" {{#${dateStr}#}}`);
  }
  if (size !== oldRequirement.size) {
    logs.push(`{{@${user}@}} changed size from "${oldRequirement.size || 'None'}" to "${size || 'None'}" {{#${dateStr}#}}`);
  }

  // Track checklist changes
  if (JSON.stringify(validationChecks) !== JSON.stringify(oldRequirement.validationChecks)) {
    logs.push(`{{@${user}@}} updated validation checklist {{#${dateStr}#}}`);
  }
  if (JSON.stringify(verificationChecks) !== JSON.stringify(oldRequirement.verificationChecks)) {
    logs.push(`{{@${user}@}} updated verification checklist {{#${dateStr}#}}`);
  }

  newRequirement.logs = logs;
  storedData[index] = newRequirement;
  await storage.set(USER_REQUIREMENTS_STORAGE_KEY, storedData);
  return getRequirement({ payload: { id } });
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
        fields: ['summary', 'id', 'description']
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch issues`);
    }

    issueData = await response.json();
    for (const issue of issueData.issues) {
      // Extract text from ADF description format
      let descriptionText = 'No description available';

      if (issue.fields.description) {
        try {
          // Navigate through the ADF structure to extract text
          const descriptionDoc = issue.fields.description;
          descriptionText = extractTextFromADF(descriptionDoc);
        } catch (err) {
          console.error('Error parsing description:', err);
          descriptionText = 'Error parsing description';
        }
      }

      issueDataDict[issue.id] = {
        summary: issue.fields.summary,
        description: descriptionText
      };
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
      name: issueDataDict[issueId]?.summary || `Issue ${issueId}`,
      description: issueDataDict[issueId]?.description || 'No description available'
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

// Helper function to extract text from Atlassian Document Format (ADF)
function extractTextFromADF(doc) {
  if (!doc || typeof doc !== 'object') {
    return '';
  }

  let text = '';

  // If the document has content array, process each node
  if (Array.isArray(doc.content)) {
    doc.content.forEach(node => {
      // If node has text directly
      if (node.text) {
        text += node.text + ' ';
      }
      // If node has content (recursive structure)
      else if (Array.isArray(node.content)) {
        text += extractTextFromADF(node) + ' ';
      }
    });
  }

  // Handle text nodes directly
  if (doc.type === 'text' && doc.text) {
    text += doc.text + ' ';
  }

  return text.trim() || 'No description text found';
} 