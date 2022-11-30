import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryEditor } from './QueryEditor';

test('renders learn react link', () => {
  render(<QueryEditor
    databaseName="databaseName"
    collectionName="collectionName"
    connectionId="connectionId"
    onSubmitQuery={() => {}}  />);
  const linkElement = screen.getByText(/Query is/i);
  expect(linkElement).toBeInTheDocument();
});
