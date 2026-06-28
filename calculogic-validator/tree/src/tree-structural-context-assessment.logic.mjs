const SOURCE_ID = 'tree-structural-context-assessment';

const REQUIRED_SELECTORS = [
  'structuralClass',
  'structuralKind',
  'relationshipQualified',
  'classificationEvidenceKind',
  'relationshipPerspective',
  'relationshipInterpretation',
];

const TRACEABILITY_FIELDS = [
  'addressPath',
  'parentAddressPath',
  'path',
  'name',
  'occurrenceType',
  'structuralClass',
  'structuralKind',
  'relationshipQualified',
  'classificationEvidenceKind',
  'relationshipPerspective',
  'relationshipInterpretation',
  'structuralRole',
  'semanticContext',
  'semanticContextEvidenceAddressPath',
];

const isNonEmptyString = (value) => typeof value === 'string' && value.length > 0;

const assertInput = ({ currentOccurrenceClassificationRecords, structuralContextAssessmentPoliciesRegistry }) => {
  if (!Array.isArray(currentOccurrenceClassificationRecords)) {
    throw new Error('Tree structural-context assessment requires currentOccurrenceClassificationRecords array.');
  }

  if (
    !structuralContextAssessmentPoliciesRegistry ||
    typeof structuralContextAssessmentPoliciesRegistry !== 'object' ||
    Array.isArray(structuralContextAssessmentPoliciesRegistry)
  ) {
    throw new Error('Tree structural-context assessment requires structuralContextAssessmentPoliciesRegistry object.');
  }

  if (!Array.isArray(structuralContextAssessmentPoliciesRegistry.policies)) {
    throw new Error('Tree structural-context assessment requires structuralContextAssessmentPoliciesRegistry.policies array.');
  }
};

const classificationHasCompleteMatchShape = (record) => (
  record &&
  typeof record === 'object' &&
  !Array.isArray(record) &&
  record.occurrenceType === 'folder' &&
  isNonEmptyString(record.addressPath) &&
  isNonEmptyString(record.structuralRole) &&
  REQUIRED_SELECTORS.every((selector) => Object.hasOwn(record, selector))
);

const policyMatchesClassification = (policy, record) => (
  classificationHasCompleteMatchShape(record) &&
  REQUIRED_SELECTORS.every((selector) => record[selector] === policy.match?.[selector])
);

const toAssessmentRecord = (classificationRecord, policy) => {
  const traceability = {};

  for (const field of TRACEABILITY_FIELDS) {
    if (Object.hasOwn(classificationRecord, field)) {
      traceability[field] = classificationRecord[field];
    }
  }

  return {
    ...traceability,
    assessmentPolicyId: policy.policyId,
    assessmentOutcome: policy.assessment.outcome,
    assessmentKind: policy.assessment.kind,
    reportable: policy.assessment.reportable,
    rationale: policy.assessment.rationale,
  };
};

const compareAssessmentRecords = (left, right) => (
  String(left.path ?? '').localeCompare(String(right.path ?? '')) ||
  String(left.addressPath ?? '').localeCompare(String(right.addressPath ?? '')) ||
  String(left.assessmentPolicyId ?? '').localeCompare(String(right.assessmentPolicyId ?? ''))
);

export const prepareTreeStructuralContextAssessment = ({
  currentOccurrenceClassificationRecords,
  structuralContextAssessmentPoliciesRegistry,
}) => {
  assertInput({ currentOccurrenceClassificationRecords, structuralContextAssessmentPoliciesRegistry });

  const assessmentRecords = [];

  for (const classificationRecord of currentOccurrenceClassificationRecords) {
    if (!classificationHasCompleteMatchShape(classificationRecord)) {
      continue;
    }

    const matchingPolicies = structuralContextAssessmentPoliciesRegistry.policies.filter((policy) => (
      policyMatchesClassification(policy, classificationRecord)
    ));

    if (matchingPolicies.length === 0) {
      continue;
    }

    if (matchingPolicies.length > 1) {
      const policyIds = matchingPolicies.map((policy) => policy.policyId).sort((left, right) => left.localeCompare(right));
      throw new Error(
        `Tree structural-context assessment policy ambiguity for addressPath "${classificationRecord.addressPath ?? ''}": ${policyIds.join(', ')}`,
      );
    }

    assessmentRecords.push(toAssessmentRecord(classificationRecord, matchingPolicies[0]));
  }

  assessmentRecords.sort(compareAssessmentRecords);

  return {
    source: SOURCE_ID,
    assessmentRecords,
  };
};
