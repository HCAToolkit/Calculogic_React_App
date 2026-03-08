export const normalizeTargetCliPath = (targetPath) => targetPath.trim().replaceAll('\\', '/');

export const parseRepeatableTargetArgument = ({ argv, index, argument, targets }) => {
  if (argument === '--target') {
    const rawTarget = argv[index + 1];
    if (!rawTarget || rawTarget.startsWith('--')) {
      throw new Error('Missing required value for --target');
    }

    targets.push(normalizeTargetCliPath(rawTarget));
    return { handled: true, nextIndex: index + 1 };
  }

  if (argument.startsWith('--target=')) {
    targets.push(normalizeTargetCliPath(argument.slice('--target='.length)));
    return { handled: true, nextIndex: index };
  }

  return { handled: false, nextIndex: index };
};
