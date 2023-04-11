import { QueryEditorCommand, QueryEditorMessage } from './messageContract';

const documentsSeed =  [
  { "_id": "6331aaf57332db3caefd02e1", "id": "0012D555-C7DE-4C4B-B4A4-2E8A6B8E1161", "type": "customer", "customerId": "0012D555-C7DE-4C4B-B4A4-2E8A6B8E1161", "title": "", "firstName": "Franklin", "lastName": "Fksdjflk", "emailAddress": "email1@adomain.com", "phoneNumber": "1 (11) 500 555-1234", "creationDate": "2014-02-05T00:00:00", "addresses": [{ "addressLine1": "1234 Westbury Dr.", "addressLine2": "", "city": "Melton", "state": "VIC", "country": "AU", "zipCode": "3337" }], "salesOrderCount": 2 },
  { "_id": "6331aaf57332db3caefd03ab", "id": "03FD4278-2C77-4FC4-93F1-20E0E58AD87A", "type": "customer", "customerId": "03FD4278-2C77-4FC4-93F1-20E0E58AD87A", "title": "", "firstName": "Franklin", "lastName": "Adflgkj", "emailAddress": "email2@adomain.com", "phoneNumber": "1 (33) 500 555-1235", "creationDate": "2014-02-05T00:00:00", "addresses": [{ "addressLine1": "5664 Wilke Drive", "addressLine2": "", "city": "Liverpool", "state": "ENG", "country": "GB", "zipCode": "L4 4HB" }], "salesOrderCount": 2 },
  { "_id": "6331aaf57332db3caefd0694", "id": "137B4594-90AC-4A76-8AA3-6B4B3764E87E", "type": "customer", "customerId": "137B4594-90AC-4A76-8AA3-6B4B3764E87E", "title": "", "firstName": "Franklin", "lastName": "Glssldfjfsdlk", "emailAddress": "email3@adomain.com", "phoneNumber": "1 (44) 500 555-1236", "creationDate": "2014-05-05T00:00:00", "addresses": [{ "addressLine1": "409, rue Saint Denis", "addressLine2": "", "city": "Paris", "state": "75 ", "country": "FR", "zipCode": "75005" }], "salesOrderCount": 1 },
  { "generation": 0, child: { "generation": 1, child: { "generation": 2, child: { "generation": 3 , child: { "generation": 4 } } } }}
];
const MAX_RESULT_SIZE = 132;

// Generate results
const results: any[] = [];
for (let i=0; i < MAX_RESULT_SIZE; i++) {
  const randomIndex = Math.floor(Math.random() * documentsSeed.length);
  results.push({ ...documentsSeed[randomIndex], index: i });
}

export const acquireVsCodeApi = () => ({
  postMessage: (msg: QueryEditorCommand) => {
  console.log("mock posMessage:", msg);

  switch (msg.action) {
    case "ready":
      // Send initialization
      window.postMessage({
        type: "initialize",
        data: {
          connectionId: "connectionId",
          databaseName: "databaseName",
          collectionName: "collectionName"
        }
      });
      break;
    case "submitQuery":
      const query = msg.query;
      if (query.pagingInfo.kind === "offset") {
        const offset = query.pagingInfo.offset ?? 0;
        const limit = query.pagingInfo.limit ?? 10;
        const response: QueryEditorMessage = {
          type: "queryResult",
          data: {
            documents: results.slice(offset, offset + limit),
            pagingInfo: {
              kind: "offset",
              offset,
              limit,
              total: results.length,
            },
          },
        };
        window.postMessage(response);
      } else if (query.pagingInfo.kind === "infinite") {
        const continuationToken = query.pagingInfo.continuationToken;
        const offset = continuationToken ? Number.parseInt(continuationToken) : 0;
        const maxCount = query.pagingInfo.maxCount ?? 10;
        const response: QueryEditorMessage = {
          type: "queryResult",
          data: {
            documents: results.slice(offset, offset + maxCount),
            pagingInfo: {
              kind: "infinite",
              continuationToken: (offset + maxCount).toString(),
              maxCount
            },
          },
        };
        window.postMessage(response);
      }

      break;
  }
  }
});
