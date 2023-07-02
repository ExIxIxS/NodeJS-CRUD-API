import http, { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

type RequestUrl = string | undefined;

let users: User[] = []; // Fake Database for users

function getResponseObj(statusCode: number, response: string) {
  return {
    statusCode,
    response,
  }
}

function isValidUUID(id: unknown): boolean {
  if (typeof(id) !== 'string') {
    return false;
  }

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidPattern.test(id);
};

function getGetResponse(url: RequestUrl) {
  if (url === '/api/users') {
    return getResponseObj(200, JSON.stringify(users));
  }

  if (url && url.startsWith('/api/users/')) {
    const userId = url.split('/api/users/').at(-1);
    const user = users.find((user) => user.id === userId);

    return (user)
      ? getResponseObj(200, JSON.stringify(user))
      : getResponseObj(404, JSON.stringify({ message: 'User not found' }));
  }

  return getResponseObj(404, JSON.stringify({ message: 'Resource doesn`t exist' }));

}

function getPostResponse(url: RequestUrl, requestBody: string) {
    const { username, age, hobbies }: Partial<User> = JSON.parse(requestBody);

    if (!username || !age || !hobbies?.length || !Array.isArray(hobbies)) {
      return getResponseObj(400, JSON.stringify({ message: 'Missing required fields' }));
    } else {
      const newUser: User = {
        id: uuidv4(),
        username,
        age,
        hobbies: hobbies,
      };

      users.push(newUser);
      return getResponseObj(201, JSON.stringify(newUser));
    }
}

function getPutResponse(url: string, requestBody: string) {
  const userId = url.split('/api/users/').at(-1);
  const { username, age, hobbies }: Partial<User> = JSON.parse(requestBody);

  const userIndex = users.findIndex((user) => user.id === userId);

  if (!isValidUUID(userId)) {
    return getResponseObj(400, JSON.stringify({ message: 'Not valid user id' }));
  }

  if (userIndex === -1) {
    return getResponseObj(404, JSON.stringify({ message: 'User not found' }));
  }

  const currentUser = {...users[userIndex]};

  const updatedUser: User = {
    id: currentUser.id,
    username: typeof(username) === 'string'
      ? username
      : currentUser.username,
    age: typeof(age) === 'number'
      ? age
      : currentUser.age,
    hobbies: (Array.isArray(hobbies) && Array.length)
      ? hobbies
      : currentUser.hobbies,
  };

    users[userIndex] = updatedUser;

    return getResponseObj(200, JSON.stringify(updatedUser));
}

function getDeleteResponse(url: string) {
  const userId = url.split('/api/users/')[1];
  const userIndex = users.findIndex((user) => user.id === userId);

  if (!isValidUUID(userId)) {
    return getResponseObj(400, JSON.stringify({ message: 'Not valid user id' }));
  }

  if (userIndex === -1) {
    return getResponseObj(404, JSON.stringify({ message: 'User not found' }))
  } else {
    users.splice(userIndex, 1);

    return getResponseObj(204, JSON.stringify({ message: 'User has been deleted' }));
  }
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  const { method, url, headers } = req;

  let body: Buffer[] = [];
  req
    .on('data', (chunk: Buffer) => {
      body.push(chunk);
    })
    .on('end', () => {
      const requestBody = Buffer.concat(body).toString();

      let responseObj = getResponseObj(404, '')

      if (method === 'GET') {
        responseObj = getGetResponse(url);
      }

      if (method === 'POST' && url === '/api/users') {
        responseObj = getPostResponse(url, requestBody);
      }

      if (method === 'PUT' && url?.startsWith('/api/users/')) {
        responseObj = getPutResponse(url, requestBody)
      }

      if (method === 'DELETE'&& url?.startsWith('/api/users/')) {
        responseObj = getDeleteResponse(url);
      }

      res.writeHead(responseObj.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(responseObj.response);
    });
});

const port = process.env.PORT || 3000; // 3000 - default if PORT is not set in the .env file

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
