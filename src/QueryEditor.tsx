import React, { useState } from "react";
import "./QueryEditor.css";
import { JsonEditor } from "./react-jsondata-editor";
import { Stack } from "@fluentui/react/lib/Stack";
import { TextField } from "@fluentui/react/lib/TextField";
import { PrimaryButton } from "@fluentui/react/lib/Button";

export interface UserQuery {
  query: string;
  offset?: number;
  limit?: number;
}

export interface QueryResult {
  // estlint-disable @typescript-eslint/no-explicit-any
  documents: any[];
  total: number;
  offset: number;
  limit: number;
}

export interface QueryEditorProps {
  connectionId: string;
  databaseName: string;
  collectionName: string;
  queryInputLabel: string;
  queryButtonLabel: string;
  onSubmitQuery: (connectionId: string, query: UserQuery) => void;
  queryResult?: QueryResult;
}

export const QueryEditor = (props: QueryEditorProps) => {
  const [query, setQuery] = useState<string | undefined>("{ }");
  const [renderAsTree, setRenderAsTree] = useState(true);

  const handleSubmit = (offset: number | undefined) => {
    if (query !== undefined && props.connectionId && props.onSubmitQuery) {
      props.onSubmitQuery(props.connectionId, {
        query,
        limit,
        offset,
      });
    }
  };

  const { queryResult } = props;
  const limit = props.queryResult?.limit;
  const offset = props.queryResult?.offset;

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
            label={props.queryInputLabel}
            value={query}
            onChange={(evt, newText: string | undefined) => setQuery(newText)}
          />
          <PrimaryButton onClick={() => handleSubmit(0)}>
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
              <Stack horizontal tokens={{ childrenGap: 10 }}>
                {offset !== undefined && limit !== undefined ? (
                  <span>
                    Showing {offset} to {offset + limit} of {queryResult.total}{" "}
                  </span>
                ) : (
                  <span>Error offset or limit not specified</span>
                )}

                <div>
                  <button
                    disabled={queryResult.offset <= 0}
                    onClick={() =>
                      handleSubmit(
                        offset !== undefined && limit !== undefined
                          ? offset - limit
                          : undefined
                      )
                    }
                  >
                    &#60;
                  </button>
                  <button
                    disabled={
                      queryResult.offset + queryResult.documents.length >=
                      queryResult.total
                    }
                    onClick={() =>
                      handleSubmit(
                        offset !== undefined && limit !== undefined
                          ? offset + limit
                          : undefined
                      )
                    }
                  >
                    &#62;
                  </button>
                </div>
              </Stack>
            </Stack>
            {renderAsTree && (
              <div className="jsonEditor">
                <JsonEditor
                  jsonObject={JSON.stringify(queryResult.documents, null, "")}
                  onChange={(output: any) => {
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
