import React from "react";
import TypeOfValue from "./TypeOfValue";

/**
 * Turns primitive types into span tag.
 * @param input
 * @returns {JSX.Element}
 */
export default function TypeToString({ input }: { input: any }): JSX.Element {
  return <span>{TypeOfValue(input)}</span>;
}
