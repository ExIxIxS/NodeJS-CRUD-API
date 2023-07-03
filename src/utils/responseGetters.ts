import { v4 as uuidv4 } from 'uuid';

import fakeDB from "../services/db";
import { isValidUUID } from "./checkers";

import { RequestUrl, User } from "../interfaces";

function getResponseObj(statusCode: number, response: string) {
  return {
    statusCode,
    response,
  }
}

function getGetResponse(url: RequestUrl) {
  if (url === '/api/users') {
    const users = fakeDB.getUsers();

    return getResponseObj(200, JSON.stringify(users));
  }

  if (url && url.startsWith('/api/users/')) {
    const userId = url.split('/api/users/').at(-1);

    if (!isValidUUID(userId)) {
      return getResponseObj(400, JSON.stringify({ message: 'Not valid user id' }));
    }

    const user = fakeDB.getUser(userId);

    return (user)
      ? getResponseObj(200, JSON.stringify(user))
      : getResponseObj(404, JSON.stringify({ message: 'User not found' }));
  }

  return getResponseObj(404, JSON.stringify({ message: 'Resource doesn`t exist' }));

}

function getPostResponse(requestBody: string) {
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

    fakeDB.addUser(newUser);

    return getResponseObj(201, JSON.stringify(newUser));
  }
}

function getPutResponse(url: string, requestBody: string) {
  const userId = url
    .split('/api/users/')
    .at(-1);

  const { username, age, hobbies }: Partial<User> = JSON.parse(requestBody);

  if (!isValidUUID(userId)) {
    return getResponseObj(400, JSON.stringify({ message: 'Not valid user id' }));
  }

  const currentUser = fakeDB.getUser(userId);

  if (!currentUser) {
    return getResponseObj(404, JSON.stringify({ message: 'User not found' }));
  }

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

    fakeDB.updateUser(updatedUser);

    return getResponseObj(200, JSON.stringify(updatedUser));
}

function getDeleteResponse(url: string) {
  const userId = url.split('/api/users/')[1];

  if (!isValidUUID(userId)) {
    return getResponseObj(400, JSON.stringify({ message: 'Not valid user id' }));
  }

  const deletedUser = fakeDB.deleteUser(userId);

  return (deletedUser)
    ? getResponseObj(204, JSON.stringify({ message: 'User has been deleted' }))
    : getResponseObj(404, JSON.stringify({ message: 'User not found' }));
}

export {
  getResponseObj,
  getGetResponse,
  getPostResponse,
  getPutResponse,
  getDeleteResponse,
}
