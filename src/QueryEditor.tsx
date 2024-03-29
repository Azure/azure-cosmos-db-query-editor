import React, { ChangeEvent, useState } from "react";
import "./QueryEditor.css";
import { JsonEditor } from "./react-jsondata-editor";
import {
  Button,
  Link,
  Spinner,
  Tab,
  TabList,
  Textarea,
  TextareaOnChangeData,
  ToggleButton,
  Toolbar,
  ToolbarButton,
} from "@fluentui/react-components";
import Split from "@uiw/react-split";
import {
  Play16Regular,
  Stop16Regular,
  TextBulletListTree16Regular,
  Braces16Regular,
  ArrowLeft12Regular,
  ArrowRight12Regular,
} from "@fluentui/react-icons";
import RunQuery from "data-url:./images/RunQuery.png"; // data-url tells parcel to inline the image as base64. Otherwise the webview cannot find the image

/**
 * Query result offset paging information
 * @public
 */
type ResultOffsetPagingInfo = {
  kind: "offset";

  /**
   * Total number of results
   */
  total: number;

  /**
   * Paging offset: number of results to skip before displaying first result.
   * Echoed from the original user query
   */
  offset: number;

  /**
   * Paging limit: max number of results to display in a page
   * Echoed from the original user query
   */
  limit: number;
};

/**
 * Query result infinite paging information
 * @public
 */
type ResultInfinitePagingInfo = {
  kind: "infinite";

  /**
   * Returned by the query engine and to be submitted by the subsequent query request in order to receive the next set of results
   * Echoed from original query
   */
  continuationToken?: string;

  /**
   * Maximum number of results requested
   * Echoed from original query
   */
  maxCount?: number;

  /**
   * Request charge
   */
  requestCharge?: number;
};

/**
 * Query offset paging information
 * @public
 */
type QueryOffsetPagingInfo = {
  kind: "offset";

  /**
   * Paging limit: max number of results to display in a page
   */
  limit?: number;

  /**
   * Paging offset: number of results to skip before displaying first result.
   */
  offset?: number;

  /**
   * Request charge
   */
  requestCharge?: number;
};

/**
 * Query infinite paging information
 * @public
 */
export type QueryInfinitePagingInfo = {
  kind: "infinite";

  /**
   * Returned by the query engine and to be submitted by the subsequent query request in order to receive the next set of results
   */
  continuationToken?: string;

  /**
   * Maximum number of results requested
   */
  maxCount?: number;
};

/**
 * User query
 * Information related to the query that the user is submitting
 * @public
 */
export interface UserQuery {
  /**
   * The query text as entered by the user
   */
  query: string;

  /**
   * Paging information
   */
  pagingInfo: QueryOffsetPagingInfo | QueryInfinitePagingInfo;
}

/**
 * Query result
 * The result of the query passed to the editor in order to display it
 * @public
 */
export interface QueryResult {
  /**
   * Results of the query (an array of documents of unknown schema)
   */
  documents: unknown[];

  /**
   * Paging information. The type depends on the original query.
   * If the result is infinite, the query editor remembers the results and displays the results of the successive requests on top of each other
   */
  pagingInfo?: ResultOffsetPagingInfo | ResultInfinitePagingInfo;
}

/**
 * Properties of the query editor react component
 * @public
 */
export interface QueryEditorProps {
  /**
   * If there are multiple query editors, this can be used to uniquely identify them.
   */
  connectionId: string;

  /**
   * Database name
   */
  databaseName: string;

  /**
   * container name
   */
  containerName: string;

  /**
   * Label displayed for the query input UI element
   * @deprecated Not used anymore
   */
  queryInputLabel: string;

  /**
   * Label for the query submit button
   * @deprecated Not used anymore
   */
  queryButtonLabel: string;

  /**
   * Label for "Load more results"
   */
  loadMoreLabel?: string;

  /**
   * Default query input text if specified
   */
  defaultQueryText?: string;

  /**
   * Paging type:
   * - offset displays previous/next page buttons and information
   * - infinite displays "Load more results"
   */
  pagingType: "offset" | "infinite";

  /**
   * Called when the user submits a query by pressing the submit button
   * @param connectionId - Unique identifier specified as `QueryEditorProps.connectionId`
   * @param query - Query text
   * @returns
   */
  onSubmitQuery: (connectionId: string, query: UserQuery) => void;

  /**
   * Called when the user cancels a query by pressing the cancel button
   * @param connectionId - Unique identifier specified as `QueryEditorProps.connectionId`
   * @returns
   */
  onCancelQuery?: (connectionId: string) => void;

  /**
   * Query results to be displayed by the editor
   */
  queryResult?: QueryResult;

  /**
   * Query processing progress
   */
  progress?: {
    spinner?: boolean;
    meter?: {
      value: number;
      maxValue: number;
      unit?: string;
    };
    message?: string;
  };

  /**
   * Error message to be displayed
   */
  error?: {
    message: string;
  };

  /**
   * If true, the query input is disabled. For example when query is being executed
   */
  isInputDisabled?: boolean;

  /**
   * If true, the query submit button is disabled. For example when query is being executed
   */
  isSubmitDisabled?: boolean;

  /**
   * Called when the user edits some results
   * @param updatedData - Updated documents by the user
   * @returns
   */
  onResultUpdate?: (updatedData: unknown) => void;

  /**
   * optional style
   */
  style?: React.CSSProperties;
}

/**
 * Query editor React component
 * @public
 */
export const QueryEditor = (props: QueryEditorProps): JSX.Element => {
  const [query, setQuery] = useState<string | undefined>(
    props.defaultQueryText ?? ""
  );
  const [renderAsTree, setRenderAsTree] = useState(true);

  const handleSubmit = (params: {
    offset?: number;
    continuationToken?: string;
  }) => {
    if (query !== undefined && props.connectionId && props.onSubmitQuery) {
      switch (props.pagingType) {
        case "infinite":
          props.onSubmitQuery(props.connectionId, {
            query: query,
            pagingInfo: {
              kind: "infinite",
              continuationToken: params.continuationToken,
              maxCount: (
                props.queryResult?.pagingInfo as ResultInfinitePagingInfo
              )?.maxCount,
            },
          });
          break;
        case "offset":
          props.onSubmitQuery(props.connectionId, {
            query: query,
            pagingInfo: {
              kind: "offset",
              limit: (props.queryResult?.pagingInfo as ResultOffsetPagingInfo)
                ?.limit,
              offset: params.offset,
            },
          });
          break;
        default:
          // Do nothing
          break;
      }
    }
  };

  const handleCancel = () => {
    props.onCancelQuery?.(props.connectionId);
  };

  const { queryResult, style } = props;

  return (
    <Split mode="vertical" style={style}>
      <div
        style={{
          height: "30%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar aria-label="toolbar" size="small">
          <ToolbarButton
            aria-label="Run"
            appearance="subtle"
            icon={<Play16Regular color="green" />}
            onClick={() => handleSubmit({ offset: 0 })}
            disabled={props.isSubmitDisabled}
          >
            Run
          </ToolbarButton>
          <ToolbarButton
            aria-label="Cancel"
            appearance="subtle"
            icon={<Stop16Regular color="red" />}
            onClick={() => handleCancel()}
            disabled={!props.isSubmitDisabled && !props.progress}
          >
            Cancel
          </ToolbarButton>
          {/* <ToolbarButton aria-label="Learn More" appearance="subtle" icon={<Library16Regular />}
            onClick={() => handleSubmit({ offset: 0 })}
            disabled={props.isSubmitDisabled}
          >Learn More</ToolbarButton> */}
        </Toolbar>
        <Textarea
          aria-label="Query input"
          style={{ width: "100%", flexGrow: 1 }}
          value={query}
          onChange={(
            ev: ChangeEvent<HTMLTextAreaElement>,
            data: TextareaOnChangeData
          ) => setQuery(data.value)}
          disabled={props.isInputDisabled}
        />
      </div>
      <div
        style={{
          height: "70%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          margin: 10,
        }}
      >
        {props.progress?.spinner && <Spinner />}
        {queryResult && (
          <>
            <div style={{ marginBottom: 10 }}>
              <TabList size="small" defaultSelectedValue="results">
                <Tab value="results">Results</Tab>
              </TabList>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingRight: 20,
                }}
              >
                <span>
                  <ToggleButton
                    appearance="transparent"
                    icon={<TextBulletListTree16Regular />}
                    size="small"
                    onClick={() => setRenderAsTree(true)}
                    checked={renderAsTree}
                  >
                    Tree
                  </ToggleButton>
                  |
                  <ToggleButton
                    appearance="transparent"
                    icon={<Braces16Regular />}
                    size="small"
                    onClick={() => setRenderAsTree(false)}
                    checked={!renderAsTree}
                  >
                    Text
                  </ToggleButton>
                </span>
                {props.pagingType === "offset" && (
                  <OffsetPaginator
                    connectionId={props.connectionId}
                    queryText={query}
                    resultLength={queryResult.documents.length}
                    onPageRequestSubmit={handleSubmit}
                    pagingInfo={
                      props.queryResult?.pagingInfo as ResultOffsetPagingInfo
                    }
                  />
                )}
                {props.pagingType === "infinite" &&
                  (queryResult.pagingInfo as ResultInfinitePagingInfo)
                    ?.continuationToken && (
                    <Link
                      href=""
                      onClick={() =>
                        handleSubmit({
                          continuationToken: (
                            queryResult.pagingInfo as ResultInfinitePagingInfo
                          )?.continuationToken,
                        })
                      }
                    >
                      {props.loadMoreLabel || "Load more items"}
                    </Link>
                  )}
              </div>
            </div>
            {renderAsTree && (
              <div className="jsonEditor" style={{ overflow: "auto" }}>
                <JsonEditor
                  jsonObject={JSON.stringify(queryResult.documents, null, "")}
                  onChange={(output: unknown) => {
                    console.log(output);
                  }}
                  hideInsertObjectButton={true}
                  expandToGeneration={0}
                  isReadOnly={true}
                  indexOffset={
                    (props.queryResult?.pagingInfo as ResultOffsetPagingInfo)
                      ?.offset === undefined
                      ? undefined
                      : (
                          props.queryResult
                            ?.pagingInfo as ResultOffsetPagingInfo
                        )?.offset + 1
                  }
                />
              </div>
            )}
            {!renderAsTree && (
              <div style={{ overflow: "auto" }}>
                <pre>{JSON.stringify(queryResult.documents, null, 2)}</pre>
              </div>
            )}
          </>
        )}
        {!props.progress?.spinner && !queryResult && (
          <div style={{ margin: "auto", textAlign: "center" }}>
            <p>
              <img src={RunQuery} alt="Execute Query Watermark" />
            </p>
            <p>Execute a query to see the results</p>
          </div>
        )}
      </div>
    </Split>
  );
};

const OffsetPaginator = (props: {
  connectionId: string;
  queryText: string | undefined;
  resultLength: number | undefined;
  onPageRequestSubmit: (params: {
    offset?: number;
    continuationToken?: string;
  }) => void;
  pagingInfo?: ResultOffsetPagingInfo;
}): JSX.Element => {
  if (!props.pagingInfo || props.resultLength === undefined) {
    return <></>;
  }

  const { limit, offset, total } = props.pagingInfo;

  if (total !== undefined && total <= 0) {
    return <></>;
  }

  return (
    <span style={{ display: "flex", columnGap: 10 }}>
      {offset !== undefined && limit !== undefined ? (
        <span>
          {/* The -1 are for 0-based index */}
          {offset + 1} to {offset + limit > total ? total : offset + limit} of{" "}
          {total}
        </span>
      ) : (
        <span>Error offset or limit not specified</span>
      )}

      <div>
        <Button
          size="small"
          icon={<ArrowLeft12Regular />}
          disabled={offset <= 0}
          onClick={() =>
            props.onPageRequestSubmit({
              offset:
                offset !== undefined && limit !== undefined
                  ? offset - limit
                  : undefined,
            })
          }
        />
        <Button
          size="small"
          icon={<ArrowRight12Regular />}
          disabled={offset + props.resultLength >= total}
          onClick={() =>
            props.onPageRequestSubmit({
              offset:
                offset !== undefined && limit !== undefined
                  ? offset + limit
                  : undefined,
            })
          }
        />
      </div>
    </span>
  );
};
