import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { QueryEditor, QueryEditorProps, QueryInfinitePaginInfo, UserQuery } from '@azure/cosmos-query-editor-react';
import { QueryEditorCommand, QueryEditorMessage } from './messageContract';
import { acquireVsCodeApi } from './vscodeMock';
import { DefaultButton } from '@fluentui/react';

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
  containerName: "",
  defaultQueryText: "{}",
  queryInputLabel: "Enter query",
  queryButtonLabel: "Submit",
  pagingType: "offset",
  onSubmitQuery
};

const queryEditorPropsInfinite: QueryEditorProps = {
  connectionId: "",
  databaseName: "",
  containerName: "",
  defaultQueryText: "{}",
  queryInputLabel: "Enter query",
  queryButtonLabel: "Submit",
  pagingType: "infinite",
  onSubmitQuery: (connectionId: string, query: UserQuery) => {
    if (queryEditorPropsInfinite.queryResult && (query.pagingInfo as QueryInfinitePaginInfo)?.continuationToken === undefined) {
      queryEditorPropsInfinite.queryResult = undefined;
    }
    return onSubmitQuery(connectionId, query);
  }
};

const queryEditorPropsProgress: QueryEditorProps = {
  connectionId: "connectionId",
  databaseName: "databaseName",
  containerName: "containerName",
  defaultQueryText: "{}",
  queryInputLabel: "Enter query",
  queryButtonLabel: "Submit",
  pagingType: "offset",
  onSubmitQuery: () => {},
  queryProgress: {
    // showMessage: "test",
    showSpinner: true,
  }
};


window.addEventListener('message', event => {
  const message: QueryEditorMessage = event.data; // The JSON data our extension sent
  // console.log('Webview received', message);

  const onClear = () => {
    queryEditorPropsOffset.queryResult = undefined;
    queryEditorPropsInfinite.queryResult = undefined;
    render();
  };

  const render = () => {
    root.render(
      <React.StrictMode>
        <DefaultButton text="Clear" onClick={onClear} />

        <h1>Offset pagination</h1>
        <QueryEditor {...queryEditorPropsOffset} />

        <h1>Infinite scrolling pagination</h1>
        <QueryEditor {...queryEditorPropsInfinite} />

        <h1>Progress indicator</h1>
        <QueryEditor {...queryEditorPropsProgress} />

      </React.StrictMode>
    );
  };

  switch (message.type) {
    case "initialize":
      queryEditorPropsOffset.connectionId = JSON.stringify(message.data);
      queryEditorPropsOffset.databaseName = message.data.databaseName;
      queryEditorPropsOffset.containerName = message.data.containerName;

      queryEditorPropsInfinite.connectionId = JSON.stringify(message.data);
      queryEditorPropsInfinite.databaseName = message.data.databaseName;
      queryEditorPropsInfinite.containerName = message.data.containerName;
      break;
    case "queryResult":
      if (message.data.pagingInfo?.kind === "offset") {
        queryEditorPropsOffset.queryResult = message.data;
        queryEditorPropsInfinite.queryResult = undefined;

      } else if (message.data.pagingInfo?.kind === "infinite") {
        if (queryEditorPropsInfinite.queryResult === undefined) {
          queryEditorPropsInfinite.queryResult = message.data;
        } else {
          const documents = queryEditorPropsInfinite.queryResult.documents.concat(message.data.documents);
          queryEditorPropsInfinite.queryResult = { ...message.data, documents };
        }

        queryEditorPropsOffset.queryResult = undefined;
      }
      break;
    default:
      // console.log("Unknown type", message);
      return;
  }

  render();
});

root.render(
  <React.StrictMode>
    <Bootstrapper onReady={onReady} />
  </React.StrictMode>
);
