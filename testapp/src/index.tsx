import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { QueryEditor, QueryEditorProps, UserQuery } from 'azure-cosmos-db-query-editor';
import { QueryEditorCommand, QueryEditorMessage } from './messageContract';
import { acquireVsCodeApi } from './vscodeMock';

const vscode = acquireVsCodeApi();

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

const queryEditorPropsOffset: QueryEditorProps = {
  connectionId: "",
  databaseName: "",
  collectionName: "",
  defaultQueryText: "{}",
  queryInputLabel: "Enter query",
  queryButtonLabel: "Submit",
  paginationType: "offset",
  onSubmitQuery
};

const queryEditorPropsInfinite: QueryEditorProps = {
  connectionId: "",
  databaseName: "",
  collectionName: "",
  defaultQueryText: "{}",
  queryInputLabel: "Enter query",
  queryButtonLabel: "Submit",
  paginationType: "infinite",
  onSubmitQuery: (connectionId: string, query: UserQuery) => {
    if (queryEditorPropsInfinite.queryResult && query.infinitePagingInfo?.continuationToken === undefined) {
      queryEditorPropsInfinite.queryResult = undefined;
    }
    return onSubmitQuery(connectionId, query);
  }
};


window.addEventListener('message', event => {
  const message: QueryEditorMessage = event.data; // The JSON data our extension sent
  // console.log('Webview received', message);

  switch (message.type) {
    case "initialize":
      queryEditorPropsOffset.connectionId = JSON.stringify(message.data);
      queryEditorPropsOffset.databaseName = message.data.databaseName;
      queryEditorPropsOffset.collectionName = message.data.collectionName;

      queryEditorPropsInfinite.connectionId = JSON.stringify(message.data);
      queryEditorPropsInfinite.databaseName = message.data.databaseName;
      queryEditorPropsInfinite.collectionName = message.data.collectionName;
      break;
    case "queryResult":
      queryEditorPropsOffset.queryResult = message.data;
      if (queryEditorPropsInfinite.queryResult === undefined) {
        queryEditorPropsInfinite.queryResult = message.data;
      } else {
        const documents = queryEditorPropsInfinite.queryResult.documents.concat(message.data.documents);
        queryEditorPropsInfinite.queryResult = { ...message.data, documents };
      }
      break;
    default:
      // console.log("Unknown type", message);
      return;
  }

  root.render(
    <React.StrictMode>
      <h1>Offset pagination</h1>
      <QueryEditor {...queryEditorPropsOffset} />

      <h1>Infinite scrolling pagination</h1>
      <QueryEditor {...queryEditorPropsInfinite} />
    </React.StrictMode>
  );
});

root.render(
  <React.StrictMode>
    <Bootstrapper onReady={onReady} />
  </React.StrictMode>
);
