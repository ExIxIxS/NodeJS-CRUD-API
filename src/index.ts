import http, { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { getDeleteResponse, getGetResponse, getPostResponse, getPutResponse, getResponseObj } from './utils/responseGetters';

dotenv.config();

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  const { method, url, headers } = req;

  let body: Buffer[] = [];
  req
    .on('data', (chunk: Buffer) => {
      body.push(chunk);
    })
    .on('end', () => {
      const requestBody = Buffer.concat(body).toString();

      let responseObj = getResponseObj(404, 'Bad request')

      try{
        if (method === 'GET') {
          responseObj = getGetResponse(url);
        }

        if (method === 'POST' && url === '/api/users') {
          responseObj = getPostResponse(requestBody);
        }

        if (method === 'PUT' && url?.startsWith('/api/users/')) {
          responseObj = getPutResponse(url, requestBody)
        }

        if (method === 'DELETE'&& url?.startsWith('/api/users/')) {
          responseObj = getDeleteResponse(url);
        }
      } catch {
        responseObj = getResponseObj(500, 'Internal Server Error');
      }

      res.writeHead(responseObj.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });

      res.end(responseObj.response);
    });
});

const port = process.env.PORT || 3000; // - default if PORT is not set in the .env file

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
