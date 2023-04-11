import React, { useState } from "react";
import "./QueryEditor.css";
import { JsonEditor } from "./react-jsondata-editor";
import { Stack } from "@fluentui/react/lib/Stack";
import { TextField } from "@fluentui/react/lib/TextField";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import { Link } from "@fluentui/react";

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
type ResultInfinitePaginInfo = {
  kind: "infinite";

  /**
   * Returned by the query engine and to be submitted by the subsequent query request in order to receive the next set of results
   * Echoed from original query
   */
  continuationToken: string;

  /**
   * Maximum number of results requested
   * Echoed from original query
   */
  maxCount?: number;
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
};

/**
 * Query infinite paging information
 * @public
 */
type QueryInfinitePaginInfo = {
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
  pagingInfo: QueryOffsetPagingInfo | QueryInfinitePaginInfo;
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
  pagingInfo?: ResultOffsetPagingInfo | ResultInfinitePaginInfo;
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
   */
  queryInputLabel: string;

  /**
   * Label for the query submit button
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
   * Query results to be displayed by the editor
   */
  queryResult?: QueryResult;

  /**
   * Called when the user edits some results
   * @param updatedData - Updated documents by the user
   * @returns
   */
  onResultUpdate?: (updatedData: unknown) => void;
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
                props.queryResult?.pagingInfo as ResultInfinitePaginInfo
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

  const { queryResult } = props;

  return (
    <div className="App">
      <Stack
        tokens={{
          childrenGap: 10,
          padding: 10,
        }}
      >
        <div>
          <h1>
            {props.databaseName}.<small>{props.containerName}</small>
          </h1>
        </div>
        <Stack horizontal verticalAlign="end">
          <TextField
            className="queryInput"
            label={props.queryInputLabel}
            value={query}
            onChange={(evt, newText: string | undefined) => setQuery(newText)}
          />
          <PrimaryButton onClick={() => handleSubmit({ offset: 0 })}>
            {props.queryButtonLabel}
          </PrimaryButton>
        </Stack>

        {queryResult && (
          <>
            <Stack
              horizontal
              tokens={{
                childrenGap: 60,
                padding: 10,
              }}
            >
              <Stack horizontal tokens={{ childrenGap: 20 }}>
                <input
                  type="radio"
                  name="renderJson"
                  value="tree"
                  checked={renderAsTree}
                  onChange={() => setRenderAsTree(true)}
                />
                Tree
                <input
                  type="radio"
                  name="renderJson"
                  value="text"
                  checked={!renderAsTree}
                  onChange={() => setRenderAsTree(false)}
                />
                Text
              </Stack>
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
            </Stack>
            {renderAsTree && (
              <div className="jsonEditor">
                <JsonEditor
                  jsonObject={JSON.stringify(queryResult.documents, null, "")}
                  onChange={(output: unknown) => {
                    console.log(output);
                  }}
                  hideInsertObjectButton={true}
                  expandToGeneration={0}
                  isReadOnly={true}
                />
              </div>
            )}
            {!renderAsTree && (
              <div>
                <pre>{JSON.stringify(queryResult.documents, null, 2)}</pre>
              </div>
            )}
            {props.pagingType === "infinite" && (
              <Link
                href=""
                underline
                onClick={() =>
                  handleSubmit({
                    continuationToken: (
                      queryResult.pagingInfo as ResultInfinitePaginInfo
                    )?.continuationToken,
                  })
                }
              >
                {props.loadMoreLabel || "Load more items"}
              </Link>
            )}
          </>
        )}
        {/* {props.queryResult && props.queryResult.map((r: any) => (
          <p key={r["_id"]}>{JSON.stringify(r)}</p>
          )
        )} */}
      </Stack>
    </div>
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

  return (
    <Stack horizontal tokens={{ childrenGap: 10 }}>
      {offset !== undefined && limit !== undefined ? (
        <span>
          Showing {offset} to {offset + limit} of {total}{" "}
        </span>
      ) : (
        <span>Error offset or limit not specified</span>
      )}

      <div>
        <button
          disabled={offset <= 0}
          onClick={() =>
            props.onPageRequestSubmit({
              offset:
                offset !== undefined && limit !== undefined
                  ? offset - limit
                  : undefined,
            })
          }
        >
          &#60;
        </button>
        <button
          disabled={offset + props.resultLength >= total}
          onClick={() =>
            props.onPageRequestSubmit({
              offset:
                offset !== undefined && limit !== undefined
                  ? offset + limit
                  : undefined,
            })
          }
        >
          &#62;
        </button>
      </div>
    </Stack>
  );
};
