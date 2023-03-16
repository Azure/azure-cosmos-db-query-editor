import React from "react";
import TypeOfValue from "./TypeOfValue";

// TODO Remove this and fix the any's
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Turns primitive types into span tag.
 * @param input
 * @returns {JSX.Element}
 */
export default function TypeToString({ input }: { input: any }): JSX.Element {
  return <span>{TypeOfValue(input)}</span>;
}
