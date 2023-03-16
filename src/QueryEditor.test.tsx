import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryEditor } from "./QueryEditor";

test("renders query editor", () => {
  render(
    <QueryEditor
      databaseName="databaseName"
      collectionName="collectionName"
      connectionId="connectionId"
      queryButtonLabel="Submit"
      queryInputLabel="Enter query"
      paginationType="infinite"
      onSubmitQuery={() => {
        // Noop
      }}
    />
  );
  const buttonElement = screen.getByText(/Submit/i);
  expect(buttonElement).toBeInTheDocument();
});
