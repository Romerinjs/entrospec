export const SEED_VERSION = 'seed-v1';

export const SEED_STREAM_NAMES = [
  'composition', 'grid', 'hierarchy', 'hero', 'region-sequence', 'typography',
  'geometry', 'media', 'ornament', 'interaction', 'motion', 'responsive'
] as const;

export type SeedStreamName = typeof SEED_STREAM_NAMES[number] | `region:${string}` | `local:${string}`;

function hash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

export function deriveSeed(entropySeed: string, streamName: SeedStreamName | string, version = SEED_VERSION): string {
  const material = `${version}\u001f${entropySeed.normalize('NFC')}\u001f${streamName}`;
  const first = hash32(`a:${material}`).toString(16).padStart(8, '0');
  const second = hash32(`b:${material}`).toString(16).padStart(8, '0');
  const third = hash32(`c:${material}`).toString(16).padStart(8, '0');
  const fourth = hash32(`d:${material}`).toString(16).padStart(8, '0');
  return `${first}${second}${third}${fourth}`;
}

export interface DeterministicRandom {
  next(): number;
  int(maxExclusive: number): number;
  between(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export function createDeterministicRandom(seed: string): DeterministicRandom {
  let state = hash32(seed) || 0x6d2b79f5;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(maxExclusive) {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) throw new RangeError('maxExclusive must be a positive integer');
      return Math.floor(next() * maxExclusive);
    },
    between(min, max) {
      if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) throw new RangeError('Invalid random range');
      return min + next() * (max - min);
    },
    pick<T>(items: readonly T[]) {
      if (!items.length) throw new RangeError('Cannot pick from an empty list');
      return items[Math.floor(next() * items.length)];
    },
    shuffle<T>(items: readonly T[]) {
      const result = [...items];
      for (let index = result.length - 1; index > 0; index--) {
        const other = Math.floor(next() * (index + 1));
        [result[index], result[other]] = [result[other], result[index]];
      }
      return result;
    }
  };
}

export interface SeedStreams {
  version: string;
  entropySeed: string;
  seedFor(name: SeedStreamName | string): string;
  rngFor(name: SeedStreamName | string): DeterministicRandom;
}

export function createSeedStreams(entropySeed: string, version = SEED_VERSION): SeedStreams {
  const root = entropySeed.trim() || 'entrospec-default-entropy';
  return {
    version,
    entropySeed: root,
    seedFor: name => deriveSeed(root, name, version),
    rngFor: name => createDeterministicRandom(deriveSeed(root, name, version))
  };
}
