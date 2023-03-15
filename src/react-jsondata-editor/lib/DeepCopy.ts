/**
 * Returns deep copy of input
 *
 * @param input
 * @returns new value or object
 *
 */

// TODO Remove this and fix the any's
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DeepCopy(input: unknown): any {
  if (input === undefined) {
    return undefined;
  } else if (input === null) {
    return null;
  } else {
    return JSON.parse(JSON.stringify(input));
  }
}
