// Forge Backend: Resolvers using Jira's Storage API
import Resolver from '@forge/resolver';
import { initializeCache, fetchAndCacheUsers } from './cache';

// Import resolvers from separate files
import * as requirementResolvers from './resolvers/requirementResolvers';
import * as validationResolvers from './resolvers/validationResolvers';
import * as verificationResolvers from './resolvers/verificationResolvers';
import * as typeResolvers from './resolvers/typeResolvers';
import * as issueResolvers from './resolvers/issueResolvers';
import * as stageResolvers from './resolvers/stageResolvers';
import * as statusResolvers from './resolvers/statusResolvers';
import * as userResolvers from './resolvers/userResolvers';
import * as versionResolvers from './resolvers/versionResolvers';

const resolver = new Resolver();

// Initialize cache and fetch users when the application starts
Promise.all([
  initializeCache(),
  fetchAndCacheUsers()
]).catch(error => {
  console.error('Failed to initialize cache or fetch users:', error);
});

// Register requirement resolvers
resolver.define('getRequirements', requirementResolvers.getRequirements);
resolver.define('addRequirement', requirementResolvers.addRequirement);
resolver.define('deleteRequirement', requirementResolvers.deleteRequirement);
resolver.define('getRequirement', requirementResolvers.getRequirement);
resolver.define('updateRequirement', requirementResolvers.updateRequirement);
resolver.define('getDashboardData', requirementResolvers.getDashboardData);

// Register validation checklist resolvers
resolver.define('getValidationChecklist', validationResolvers.getValidationChecklist);
resolver.define('addValidationChecklistItem', validationResolvers.addValidationChecklistItem);
resolver.define('updateValidationChecklistItem', validationResolvers.updateValidationChecklistItem);
resolver.define('removeValidationChecklistItem', validationResolvers.removeValidationChecklistItem);

// Register verification checklist resolvers
resolver.define('getVerificationChecklist', verificationResolvers.getVerificationChecklist);
resolver.define('addVerificationChecklistItem', verificationResolvers.addVerificationChecklistItem);
resolver.define('updateVerificationChecklistItem', verificationResolvers.updateVerificationChecklistItem);
resolver.define('removeVerificationChecklistItem', verificationResolvers.removeVerificationChecklistItem);

// Register type resolvers
resolver.define('getTypes', typeResolvers.getTypes);
resolver.define('addType', typeResolvers.addType);
resolver.define('updateType', typeResolvers.updateType);
resolver.define('removeType', typeResolvers.removeType);

// Register stage resolvers
resolver.define('getStages', stageResolvers.getStages);
resolver.define('addStage', stageResolvers.addStage);
resolver.define('updateStage', stageResolvers.updateStage);
resolver.define('removeStage', stageResolvers.removeStage);

// Register status resolvers
resolver.define('getStatuses', statusResolvers.getStatuses);
resolver.define('addStatus', statusResolvers.addStatus);
resolver.define('updateStatus', statusResolvers.updateStatus);
resolver.define('removeStatus', statusResolvers.removeStatus);

// Register issue resolvers
resolver.define('getAssignedRequirements', issueResolvers.getAssignedRequirements);
resolver.define('assignRequirements', issueResolvers.assignRequirements);
resolver.define('getRequirementIssues', issueResolvers.getRequirementIssues);

// Register user resolvers
resolver.define('getUsers', userResolvers.getUsers);

// Register version resolvers
resolver.define('getVersions', versionResolvers.getVersions);
resolver.define('createVersion', versionResolvers.createVersion);
resolver.define('removeVersion', versionResolvers.removeVersion);
resolver.define('restoreVersion', versionResolvers.restoreVersion);

export const handler = resolver.getDefinitions();