import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryEditor } from "./QueryEditor";

test("renders learn react link", () => {
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
  const linkElement = screen.getByText(/Query is/i);
  expect(linkElement).toBeInTheDocument();
});
