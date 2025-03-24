import { storage, route } from '@forge/api';
import api from '@forge/api';
import { REQUIREMENT_ISSUE_STORAGE_KEY, USER_REQUIREMENTS_STORAGE_KEY } from '../config';

// Get assigned requirements for an issue
export const getAssignedRequirements = async ({ payload }) => {
  const { issueId } = payload;
  const storedData = (await storage.get(REQUIREMENT_ISSUE_STORAGE_KEY)) || {};
  const requirementIds = storedData[issueId] || [];
  const userRequirements = (await storage.get(USER_REQUIREMENTS_STORAGE_KEY)) || [];
  const requirementDict = {};
  userRequirements.forEach(req => {
    requirementDict[req.id] = req;
  });
  const assignedRequirements = requirementIds.map(id => { return { name: requirementDict[id].name, id } });
  return assignedRequirements;
};

// Assign requirements to an issue
export const assignRequirements = async ({ payload }) => {
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
};

// Get issues for a requirement
export const getRequirementIssues = async ({ payload }) => {
  const { requirementId } = payload;
  const requirementIssueMap = await storage.get(REQUIREMENT_ISSUE_STORAGE_KEY) || {};
  
  // Find all issues that have this requirement
  const linkedIssues = [];
  for (const [issueId, requirements] of Object.entries(requirementIssueMap)) {
    if (requirements?.includes?.(requirementId)) {
      linkedIssues.push(issueId);
    }
  }

  if (linkedIssues.length === 0) {
    return [];
  }

  try {
    const response = await api.asApp().requestJira(route`/rest/api/3/issue/bulkfetch`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        issueIdsOrKeys: linkedIssues,
        expand: ["names"],
        fieldsByKeys: false,
        fields: ["summary", "status", "priority", "assignee"]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch issues');
    }

    const data = await response.json();
    return data.issues.map(issue => {
      const assignee = issue.fields.assignee;
      return {
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority.name,
        assignee: assignee ? {
          accountId: assignee.accountId,
          displayName: assignee.displayName,
          avatarUrl: assignee.avatarUrls['48x48']
        } : null,
        isDone: ['Done', 'Closed', 'Resolved'].includes(issue.fields.status.name)
      };
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw error;
  }
}; 