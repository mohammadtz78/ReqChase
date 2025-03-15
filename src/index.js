// Forge Backend: Resolvers using Jira's Storage API
import Resolver from '@forge/resolver';

// Import resolvers from separate files
import * as requirementResolvers from './resolvers/requirementResolvers';
import * as validationResolvers from './resolvers/validationResolvers';
import * as verificationResolvers from './resolvers/verificationResolvers';
import * as typeResolvers from './resolvers/typeResolvers';
import * as issueResolvers from './resolvers/issueResolvers';

const resolver = new Resolver();

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

// Register issue resolvers
resolver.define('getAssignedRequirements', issueResolvers.getAssignedRequirements);
resolver.define('assignRequirements', issueResolvers.assignRequirements);
resolver.define('getRequirementIssues', issueResolvers.getRequirementIssues);

export const handler = resolver.getDefinitions();