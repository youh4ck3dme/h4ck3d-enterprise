export type ProjectState =
  | 'Draft'
  | 'Inputs Ready'
  | 'Blueprint Pending'
  | 'Blueprint Approved'
  | 'Phase In Progress'
  | 'Blocked'
  | 'Testing'
  | 'Passed'
  | 'Failed'
  | 'Review Pending'
  | 'Ready for Deploy'
  | 'Deployed';

export const WORKFLOW_STATES: ProjectState[] = [
  'Draft',
  'Inputs Ready',
  'Blueprint Pending',
  'Blueprint Approved',
  'Phase In Progress',
  'Blocked',
  'Testing',
  'Passed',
  'Failed',
  'Review Pending',
  'Ready for Deploy',
  'Deployed'
];

export interface WorkflowRules {
  inspectFirst: boolean;
  planByPhases: boolean;
  safeShell: boolean;
  gatedDeploy: boolean;
}

export const EDITOR_RULES: WorkflowRules = {
  inspectFirst: true,
  planByPhases: true,
  safeShell: true,
  gatedDeploy: true,
};
