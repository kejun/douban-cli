function humanizeProfileKey(key) {
  return key
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatScalar(value) {
  if (value == null || value === '') {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

function formatMarkdownEntries(value, depth = 0) {
  if (value == null || value === '') {
    return [];
  }

  const indent = '  '.repeat(depth);

  if (Array.isArray(value)) {
    const compact = value.filter((item) => item != null && item !== '');
    if (compact.length === 0) {
      return [];
    }

    if (compact.every((item) => typeof item !== 'object')) {
      return [`${indent}${compact.map((item) => formatScalar(item)).join(', ')}`];
    }

    return compact.flatMap((item) => {
      if (typeof item !== 'object') {
        return [`${indent}- ${formatScalar(item)}`];
      }

      const nested = Object.entries(item).flatMap(([key, nestedValue]) =>
        formatMarkdownField(key, nestedValue, depth + 1)
      );
      return nested.length > 0 ? [`${indent}-`, ...nested] : [];
    });
  }

  if (typeof value !== 'object') {
    return [`${indent}${formatScalar(value)}`];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    formatMarkdownField(key, nestedValue, depth)
  );
}

function formatMarkdownField(key, value, depth = 0) {
  if (value == null || value === '') {
    return [];
  }

  const indent = '  '.repeat(depth);
  const label = humanizeProfileKey(key);

  if (Array.isArray(value) && value.every((item) => typeof item !== 'object')) {
    return [`${indent}- ${label}: ${value.map((item) => formatScalar(item)).join(', ')}`];
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    const nested = formatMarkdownEntries(value, depth + 1);
    if (nested.length === 0) {
      return [];
    }
    if (nested.length === 1 && !nested[0].startsWith(`${'  '.repeat(depth + 1)}-`)) {
      return [`${indent}- ${label}: ${nested[0].trim()}`];
    }
    return [`${indent}- ${label}:`, ...nested];
  }

  const nested = formatMarkdownEntries(value, depth + 1);
  return nested.length > 0 ? [`${indent}- ${label}:`, ...nested] : [];
}

function pickProfileTitle(profile) {
  return (
    profile?.name ||
    profile?.displayName ||
    profile?.userName ||
    profile?.username ||
    profile?.id ||
    'Douban Profile'
  );
}

export function formatProfileMarkdown(profile) {
  if (profile == null) {
    return '# Douban Profile';
  }

  if (typeof profile !== 'object' || Array.isArray(profile)) {
    return `# Douban Profile\n\n- Value: ${formatScalar(profile)}`;
  }

  const lines = [`# ${pickProfileTitle(profile)}`];
  const fields = Object.entries(profile).flatMap(([key, value]) => formatMarkdownField(key, value));

  if (fields.length > 0) {
    lines.push('', ...fields);
  }

  return lines.join('\n');
}
