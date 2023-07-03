import http, { IncomingMessage, ServerResponse } from 'http';
import {
  getDeleteResponse,
  getGetResponse,
  getPostResponse,
  getPutResponse,
  getResponseObj,
} from '../utils/responseGetters';
import {
  INTERNAL_SERVER_ERROR_MESSAGE,
  RESOURCE_NOT_EXIST_MESSAGE,
} from '../constants/messages';

function createApiServer() {
  return http.createServer((req: IncomingMessage, res: ServerResponse) => {
    const { method, url } = req;

    const body: Buffer[] = [];
    req
      .on('data', (chunk: Buffer) => {
        body.push(chunk);
      })
      .on('end', () => {
        const requestBody = Buffer.concat(body).toString();

        let responseObj = getResponseObj(
          404,
          JSON.stringify({ message: RESOURCE_NOT_EXIST_MESSAGE })
        );

        try {
          if (method === 'GET') {
            responseObj = getGetResponse(url);
          }

          if (method === 'POST' && url === '/api/users') {
            responseObj = getPostResponse(requestBody);
          }

          if (method === 'PUT' && url?.startsWith('/api/users/')) {
            responseObj = getPutResponse(url, requestBody);
          }

          if (method === 'DELETE' && url?.startsWith('/api/users/')) {
            responseObj = getDeleteResponse(url);
          }
        } catch {
          responseObj = getResponseObj(
            500,
            JSON.stringify({ message: INTERNAL_SERVER_ERROR_MESSAGE })
          );
        }

        res.writeHead(responseObj.statusCode, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });

        res.end(responseObj.response);
      });
  });
}

export default createApiServer;
