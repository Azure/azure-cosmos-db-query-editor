import React from "react";

// TODO Remove this and fix the any's
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Turns primitive values into string.
 *
 * @param input
 * @returns {JSX.Element}
 *
 */
export default function ValueToString({ input }: { input: any }): JSX.Element {
  let toStringValue;

  if (input == null) toStringValue = "null";
  else if (typeof input == "boolean") toStringValue = input ? "true" : "false";
  else toStringValue = input;

  return <span>{toStringValue}</span>;
}
