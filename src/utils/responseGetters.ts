import { v4 as uuidv4 } from 'uuid';

import fakeDB from "../services/db";
import { isValidUUID } from "./checkers";

import {
  MISSING_FIELDS_MESSAGE,
  INVALID_ID_MESSAGE,
  RESOURCE_NOT_EXIST_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
  USER_SUCCESSFULLY_DELETE_MESSAGE
} from '../constants/messages';

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
      return getResponseObj(400, JSON.stringify({ message: INVALID_ID_MESSAGE }));
    }

    const user = fakeDB.getUser(userId);

    return (user)
      ? getResponseObj(200, JSON.stringify(user))
      : getResponseObj(404, JSON.stringify({ message: USER_NOT_FOUND_MESSAGE }));
  }

  return getResponseObj(404, JSON.stringify({ message: RESOURCE_NOT_EXIST_MESSAGE }));

}

function getPostResponse(requestBody: string) {
  const { username, age, hobbies }: Partial<User> = JSON.parse(requestBody);

  if (!username || !age || !hobbies?.length || !Array.isArray(hobbies)) {
    return getResponseObj(400, JSON.stringify({ message: MISSING_FIELDS_MESSAGE }));
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
    return getResponseObj(400, JSON.stringify({ message: INVALID_ID_MESSAGE }));
  }

  const currentUser = fakeDB.getUser(userId);

  if (!currentUser) {
    return getResponseObj(404, JSON.stringify({ message: USER_NOT_FOUND_MESSAGE }));
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
    return getResponseObj(400, JSON.stringify({ message: INVALID_ID_MESSAGE }));
  }

  const deletedUser = fakeDB.deleteUser(userId);

  return (deletedUser)
    ? getResponseObj(204, JSON.stringify({ message: USER_SUCCESSFULLY_DELETE_MESSAGE }))
    : getResponseObj(404, JSON.stringify({ message: USER_NOT_FOUND_MESSAGE }));
}

export {
  getResponseObj,
  getGetResponse,
  getPostResponse,
  getPutResponse,
  getDeleteResponse,
}
