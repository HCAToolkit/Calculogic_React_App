export const toReportableExtensionsSet = (extensionArray) => new Set(extensionArray);

export const toNamingRolesRuntime = (rolesArray) => {
  const roleMetadata = new Map();

  rolesArray.forEach((entry) => {
    if (!roleMetadata.has(entry.role)) {
      roleMetadata.set(entry.role, entry);
    }
  });

  const activeRoles = new Set(
    Array.from(roleMetadata.values())
      .filter((entry) => entry.status === 'active')
      .map((entry) => entry.role),
  );

  const roleSuffixes = Array.from(roleMetadata.keys()).sort(
    (left, right) => right.length - left.length,
  );

  return {
    roleMetadata,
    activeRoles,
    roleSuffixes,
  };
};


export const toReportableRootFilesSet = (rootFilesArray) => new Set(rootFilesArray);


export const toSummaryBucketsRuntime = (summaryBuckets) => ({
  classificationBuckets: [...summaryBuckets.classificationBuckets],
  secondaryBucketFamilies: [...summaryBuckets.secondaryBucketFamilies],
});


export const toMissingRolePatternsRuntime = (missingRolePatterns) =>
  missingRolePatterns.map((pattern) => ({
    ...pattern,
    extensionSegmentIndexes: [...pattern.extensionSegmentIndexes],
    literalSegmentConstraints: { ...pattern.literalSegmentConstraints },
  }));
