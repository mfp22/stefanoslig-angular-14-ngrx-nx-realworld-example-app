import { computed } from '@angular/core';

export function memo<T>(fn: () => T) {
  return computed(fn, { equal: (a, b) => a === b });
}
