import React, { useCallback, useEffect } from 'react';
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import ReactDOM from 'react-dom/client';
import './index.css';
import { QueryEditor, QueryEditorProps, QueryInfinitePagingInfo, UserQuery } from '../../src/QueryEditor';
import { QueryEditorCommand, QueryEditorMessage } from './messageContract';
import { acquireVsCodeApi } from './vscodeMock';
import {
  Button,
  makeStyles,
  Tab,
  TabList,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    // ...shorthands.padding("50px", "20px"),
    rowGap: "20px",
  },
});

const vscode = acquireVsCodeApi();

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

type TabValue = "offset" | "infinite" | "progress";

const titleStrings = {
  offset: "Offset pagination",
  infinite: "Infinite pagination",
  progress: "Progress indicator"
}

const Bootstrapper: React.FC<{ onReady: () => void }> = (props: { onReady: () => void }) => {
  const styles = useStyles();
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [tab, setTab] = React.useState<TabValue>("offset");
  const [queryEditorPropsOffset, setQueryEditorPropsOffset] = React.useState<QueryEditorProps>({
    connectionId: "",
    databaseName: "",
    containerName: "",
    defaultQueryText: "{}",
    queryInputLabel: "Enter query",
    queryButtonLabel: "Submit",
    pagingType: "offset",
    onSubmitQuery
  });
  const [queryEditorPropsInfinite, setQueryEditorPropsInfinite] = React.useState<QueryEditorProps>({
    connectionId: "",
    databaseName: "initial",
    containerName: "",
    defaultQueryText: "{}",
    queryInputLabel: "Enter query",
    queryButtonLabel: "Submit",
    pagingType: "infinite",
    onSubmitQuery: (connectionId: string, query: UserQuery) => {
      if (queryEditorPropsInfinite.queryResult && (query.pagingInfo as QueryInfinitePagingInfo)?.continuationToken === undefined) {
        queryEditorPropsInfinite.queryResult = undefined;
      }
      return onSubmitQuery(connectionId, query);
    }
  });
  const queryEditorPropsProgress ={
    connectionId: "connectionId",
    databaseName: "databaseName",
    containerName: "containerName",
    defaultQueryText: "{}",
    queryInputLabel: "Enter query",
    queryButtonLabel: "Submit",
    pagingType: "offset" as "offset" | "infinite",
    onSubmitQuery: () => {},
    progress: {
      spinner: true,
    },
    isInputDisabled: true,
    isSubmitDisabled: true
  };

  const onClear = () => {
    setQueryEditorPropsOffset({
      ...queryEditorPropsOffset,
      queryResult: undefined
    });

    setQueryEditorPropsInfinite({
      ...queryEditorPropsInfinite,
      queryResult: undefined
    });
  };

  const listenerFct = useCallback((event: MessageEvent) => {
    const message: QueryEditorMessage = event.data; // The JSON data our extension sent
    if (message.type) {
      console.log('Webview received', message);
    }

    switch (message.type) {
      case "initialize": {
        setQueryEditorPropsOffset({
          ...queryEditorPropsOffset,
          connectionId: JSON.stringify(message.data),
          databaseName: message.data.databaseName,
          containerName: message.data.containerName,
        });

        setQueryEditorPropsInfinite({
          ...queryEditorPropsInfinite,
          connectionId: JSON.stringify(message.data),
          databaseName: message.data.databaseName,
          containerName: message.data.containerName,
        });
      }
        break;
      case "queryResult":
        if (message.data.pagingInfo?.kind === "offset") {
          setQueryEditorPropsOffset({
            ...queryEditorPropsOffset,
          queryResult: message.data,
          });

        } else if (message.data.pagingInfo?.kind === "infinite") {
          if (queryEditorPropsInfinite!.queryResult === undefined) {
            setQueryEditorPropsInfinite({
              ...queryEditorPropsInfinite,
              queryResult: message.data,
            });
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
  }, [queryEditorPropsOffset, queryEditorPropsInfinite]);

  useEffect(() => {
    console.log("Bootstrapper.useEffect setup");
    window.addEventListener('message', listenerFct);
    setIsInitialized(true);

    if(!isInitialized) {
      props.onReady();
    }

    return () => {
      window.removeEventListener("message", listenerFct);
      console.log("Bootstrapper.useEffect cleanup");
    };
  }, [listenerFct, isInitialized]);

  return (
    <FluentProvider theme={teamsLightTheme}>
      <div className={styles.root}>
        <TabList size="small" defaultSelectedValue={tab} onTabSelect={(event, tab) => setTab(tab.value as TabValue)}>
          <Tab value="offset">Offset pagination</Tab>
          <Tab value="infinite">Infinite pagination</Tab>
          <Tab value="progress">Progress indicator</Tab>
        </TabList>
        <div>
          <h1>{titleStrings[tab]}</h1>
          <Button onClick={onClear} >Clear</Button>
          {tab === "offset" && <QueryEditor key="offset" {...queryEditorPropsOffset} />}
          {tab === "infinite" && <QueryEditor key="infinite" {...queryEditorPropsInfinite} />}
          {tab === "progress" && <QueryEditor key="progress" {...queryEditorPropsProgress} />}
        </div>
      </div>
    </FluentProvider>
  );
  // return <>Not initialized yet</>;
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Bootstrapper onReady={onReady} />);
