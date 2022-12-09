import React, { useState } from "react";
import "./QueryEditor.css";
import { MongoQuery, QueryResult } from "./messageContract";
import { JsonEditor } from "./react-jsondata-editor";

export interface QueryEditorProps {
  connectionId: string;
  databaseName: string;
  collectionName: string;
  onSubmitQuery: (connectionId: string, query: MongoQuery) => void;
  queryResult?: QueryResult;
}

export const QueryEditor = (props: QueryEditorProps) => {
  const [query, setQuery] = useState<string>('{ "firstName": "Franklin" }');
  const [renderAsTree, setRenderAsTree] = useState(true);

  const handleSubmit = (offset: number | undefined) => {
    if (props.connectionId && props.onSubmitQuery) {
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
      <header className="App-header">
        <p>Connection ID: {props.connectionId}</p>
        <p>
          Database: {props.databaseName} Collection: {props.collectionName}
        </p>
        <input value={query} onChange={(evt) => setQuery(evt.target.value)} />
        <button onClick={() => handleSubmit(offset)}>Submit</button>
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
        {queryResult && (
          <div>
            {offset !== undefined && limit !== undefined ? (
              <span>
                Showing {offset} to {offset + limit} of {queryResult.total}{" "}
              </span>
            ) : (
              <span>Error offset or limit not specified</span>
            )}
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
          </div>
        )}
        {/* {props.queryResult && props.queryResult.map((r: any) => (
          <p key={r["_id"]}>{JSON.stringify(r)}</p>
          )
        )} */}
      </header>
    </div>
  );
};
