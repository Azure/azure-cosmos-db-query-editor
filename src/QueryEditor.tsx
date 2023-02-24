import React, { useState } from "react";
import "./QueryEditor.css";
import { JsonEditor } from "./react-jsondata-editor";
import { Stack } from "@fluentui/react/lib/Stack";
import { TextField } from "@fluentui/react/lib/TextField";
import { PrimaryButton } from "@fluentui/react/lib/Button";
import { Link } from "@fluentui/react";

export interface UserQuery {
  query: string;
  offsetPagingInfo?: {
    limit?: number;
    offset?: number;
  };
  infinitePagingInfo?: {
    continuationToken?: string;
    maxCount?: number;
  };
}

export interface QueryResult {
  documents: unknown[];

  offsetPagingInfo?: {
    total: number;
    offset: number;
    limit: number;
  };
  infinitePagingInfo?: {
    continuationToken: string;
    maxCount?: number;
  };
}

export interface QueryEditorProps {
  connectionId: string;
  databaseName: string;
  collectionName: string;
  queryInputLabel: string;
  queryButtonLabel: string;
  loadMoreLabel?: string;
  defaultQueryText?: string;
  paginationType: "offset" | "infinite";
  onSubmitQuery: (connectionId: string, query: UserQuery) => void;
  queryResult?: QueryResult;
  onResultUpdate?: (updatedData: unknown) => void;
}

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
      switch (props.paginationType) {
        case "infinite":
          props.onSubmitQuery(props.connectionId, {
            query: query,
            infinitePagingInfo: {
              continuationToken: params.continuationToken,
              maxCount: props.queryResult?.infinitePagingInfo?.maxCount,
            },
          });
          break;
        case "offset":
          props.onSubmitQuery(props.connectionId, {
            query: query,
            offsetPagingInfo: {
              limit: props.queryResult?.offsetPagingInfo?.limit,
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
            {props.databaseName}.<small>{props.collectionName}</small>
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
              {props.paginationType === "offset" && (
                <OffsetPaginator
                  connectionId={props.connectionId}
                  queryText={query}
                  resultLength={queryResult.documents.length}
                  onPageRequestSubmit={handleSubmit}
                  offsetPagingInfo={props.queryResult?.offsetPagingInfo}
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
            {props.paginationType === "infinite" && (
              <Link
                href=""
                underline
                onClick={() =>
                  handleSubmit({
                    continuationToken:
                      queryResult.infinitePagingInfo?.continuationToken,
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
  offsetPagingInfo?: {
    total: number;
    offset: number;
    limit: number;
  };
}): JSX.Element => {
  if (!props.offsetPagingInfo || props.resultLength === undefined) {
    return <></>;
  }

  const { limit, offset, total } = props.offsetPagingInfo;

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
