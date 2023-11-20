import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryEditor } from "./QueryEditor";

test("renders query editor", () => {
  render(
    <QueryEditor
      databaseName="databaseName"
      containerName="collectionName"
      connectionId="connectionId"
      queryButtonLabel="Submit"
      queryInputLabel="Enter query"
      pagingType="infinite"
      onSubmitQuery={() => {
        // Noop
      }}
    />
  );
  const buttonElement = screen.getByText(/Run/i);
  expect(buttonElement).toBeInTheDocument();
});
