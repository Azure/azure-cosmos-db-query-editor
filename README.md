# Azure Cosmos DB Query Editor
This project contains a reusable query editor React component.

# Basic Usage
```typescript
const queryEditorPropsInfinite: QueryEditorProps = {
  connectionId: "connectionId",
  databaseName: "myDatabase",
  containerName: "myContainer",
  defaultQueryText: "select * from c",
  queryInputLabel: "Enter query",
  queryButtonLabel: "Submit",
  pagingType: "infinite",
  onSubmitQuery: (connectionId: string, query: UserQuery) => {
    console.log(`A query has been submitted from the editor: ${query}`);
  }
};

<QueryEditor {...queryEditorPropsOffset} />
```

## Parameters
| Name | Description |
|-|-|
|`connectionId`| Provides context when running multiple query editors. A query editor is associated with a connection which is echoed in `onSubmitQuery`.|
|`databaseName`| The Database name|
|`containerName`| The container name|
|`defaultQueryText`| (Optional) The default query that appears in the input box|
|`loadMoreLabel`| (Optional) Label on the button to load more results|
|`queryInputLabel`| The label for the query input box|
|`queryButtonLabel`| The text on the submit button|
|`paginationType`| `"offset"`: previous/next page buttons are displayed for paging through results. `"infinite"`: a "Load more results" button appears to load more results |
|`onSubmitQuery`| Called when the Submit button is pressed|
| `onCancelQuery` | (Optional) Called when the cancel button is pressed |
|`queryResult`| (Optional) The query result that the editor must display. It must be an array of json objects.|
|`progress`| (Optional) Indicate progress in the query editor |
|`error`| (Optional) Display error |
|`style` | (Optional) CSS styles |

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

### Using the `testapp/` to debug
The easiest way to debug changes in the library is to use the webapp in the `testapp/` folder.

In the `testapp/package.json` file in the `dependencies` section, the following options can help you test:
1. Use the current source code of the library:
  * In `testapp/package.json`, use: `"@azure/cosmos-query-editor-react": ".."`
  * Make sure you run `npm i` on every change
2. Use the package that gets published
  * In `testapp/package.json`, use: `"@azure/cosmos-query-editor-react": "../azure-cosmos-query-editor-react-1.0.0-beta.2.tgz"`
  * From the root folder, run `npm run publish`. This will create a `.tgz` file.
  * To rebuild `testapp/` and incorporate the new changes in the `.tgz` file, you need to update the package and clear the webpack cache, so rebuild with: `rm -rf node_modules/.cache/default-development && npm update @azure/cosmos-query-editor-react && npm start`
3. Use the final published package from npmjs:
  * In `testapp/package.json`, use: `"@azure/cosmos-query-editor-react": "1.0.0-beta.2"`

Or you can use the component directly:
In `testapp/src/index.tsx`, replace:

`import { QueryEditor, QueryEditorProps, QueryInfinitePagingInfo, UserQuery } from '@azure/cosmos-query-editor-react';`

by

`import { QueryEditor, QueryEditorProps, QueryInfinitePagingInfo, UserQuery } from '../../src/QueryEditor';`

To debug:
1. Build the library:
  * `cd <path to cosmos-query-editor-react>`
  * `npm run build` (this will create a `dist/` folder)
2. Run the `testapp`:
  * `cd <path to cosmos-query-editor-react>/testapp`
  * `npm i`
  * `npm start` (the browser automatically opens to the `localhost` url)

## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft
trademarks or logos is subject to and must follow
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
