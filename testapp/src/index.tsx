import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { QueryEditor, QueryEditorProps, UserQuery } from 'azure-cosmos-db-query-editor';
import { QueryEditorCommand, QueryEditorMessage } from './messageContract';

const vscode = (window as any).acquireVsCodeApi();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const onSubmitQuery = (connectionId: string, query: UserQuery): void => {
  console.log("onSubmitQuery", query);
  const message: QueryEditorCommand = {
    action: 'submitQuery',
    query
  };

  vscode.postMessage(message);
};

const onReady = (): void => {
  vscode.postMessage({
    action: 'ready'
  });
};

const Bootstrapper = (props: { onReady: () => void }) => {
  useEffect(() => props.onReady && props.onReady());
  return <>Not initialized yet</>;
}

const queryEditorProps: QueryEditorProps = {
  connectionId: "",
  databaseName: "",
  collectionName: "",
  queryInputLabel: "Enter query",
  queryButtonLabel: "Submit",
  onSubmitQuery
};

window.addEventListener('message', event => {
  const message: QueryEditorMessage = event.data; // The JSON data our extension sent
  // console.log('Webview received', message);

  switch (message.type) {
    case "initialize":
      queryEditorProps.connectionId = JSON.stringify(message.data);
      queryEditorProps.databaseName = message.data.databaseName;
      queryEditorProps.collectionName = message.data.collectionName;
      break;
    case "queryResult":
      queryEditorProps.queryResult = message.data;
      break;
    default:
      // console.log("Unknown type", message);
      return;
  }

  root.render(
    <React.StrictMode>
      <QueryEditor {...queryEditorProps} />
    </React.StrictMode>
  );
});

root.render(
  <React.StrictMode>
    <Bootstrapper onReady={onReady} />
  </React.StrictMode>
);
