import request from 'supertest';
import appServer from '../index';
import * as responseGetters from '../utils/responseGetters';

import {
  INTERNAL_SERVER_ERROR_MESSAGE,
  INVALID_ID_MESSAGE,
  MISSING_FIELDS_MESSAGE,
  RESOURCE_NOT_EXIST_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} from '../constants/messages';

const INVALID_USER_ID = 'invalid_id';

afterAll((done) => {
  appServer.close(() => {
    done();
  });
});

describe('API Tests', () => {
  let createdUserId: string;

  it('GET api/users - Server should answer with status code 200 and all users records (empty array expected)', async () => {
    const response = await request(appServer).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST api/users - Server should answer with status code 201 and newly created record, and add user to DB', async () => {
    const newUser = {
      username: 'John Doe',
      age: 25,
      hobbies: ['reading', 'gaming'],
    };

    const response = await request(appServer).post('/api/users').send(newUser);
    const allUsersResponse = await request(appServer).get('/api/users');

    createdUserId = response.body?.id;

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(allUsersResponse.body).toEqual([
      {
        ...newUser,
        id: createdUserId,
      },
    ]);
  });

  it('GET api/users/{userId} - Server should answer with status code 200 and the created User', async () => {
    const response = await request(appServer).get(
      `/api/users/${createdUserId}`
    );
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdUserId);
  });

  it('PUT api/users/{userId} - Server should answer with status code 200 and updated record', async () => {
    const updatedUser = {
      username: 'Mike Prisson',
      age: 30,
      hobbies: ['reading', 'swimming'],
    };

    const response = await request(appServer)
      .put(`/api/users/${createdUserId}`)
      .send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdUserId);
    expect(response.body.username).toBe(updatedUser.username);
    expect(response.body.age).toBe(updatedUser.age);
    expect(response.body.hobbies).toEqual(updatedUser.hobbies);
  });

  it('DELETE api/users/{userId} - Server should answer with status code 204 if the record is found and deleted', async () => {
    const response = await request(appServer).delete(
      `/api/users/${createdUserId}`
    );
    expect(response.status).toBe(204);
  });

  it('GET api/users/{userId} - Server should answer with status code 400 and corresponding message if userId is invalid (not uuid)', async () => {
    const response = await request(appServer).get(
      `/api/users/${INVALID_USER_ID}`
    );
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(INVALID_ID_MESSAGE);
  });

  it('GET api/users/{userId} - Server should answer with status code 404 and corresponding message if not find the deleted user', async () => {
    const response = await request(appServer).get(
      `/api/users/${createdUserId}`
    );
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(USER_NOT_FOUND_MESSAGE);
  });

  const invalidUsers = [
    {
      username: 'John Doe',
      hobbies: ['reading', 'gaming'],
    },
    {
      age: 30,
      hobbies: ['reading', 'swimming'],
    },
    {
      username: 'Mike Prisson',
      age: 30,
    },
  ];

  test.each(invalidUsers)(
    `POST api/users - Server should answer with status code 400 and corresponding message if request body does not contain required fields`,
    async (newInvalidUser) => {
      const response = await request(appServer)
        .post('/api/users')
        .send(newInvalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe(MISSING_FIELDS_MESSAGE);
    }
  );

  it('PUT api/users/{userId} - Server should answer with status code 400 and corresponding message if userId is invalid (not uuid)', async () => {
    const updatedUser = {
      username: 'Mike Prisson',
      age: 30,
      hobbies: ['reading', 'swimming'],
    };

    const response = await request(appServer)
      .put(`/api/users/${INVALID_USER_ID}`)
      .send(updatedUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(INVALID_ID_MESSAGE);
  });

  it('PUT api/users/{userId} - Server should answer with status code 404 and corresponding message if not find the deleted user', async () => {
    const updatedUser = {
      username: 'Mike Prisson',
      age: 30,
      hobbies: ['reading', 'swimming'],
    };

    const response = await request(appServer)
      .put(`/api/users/${createdUserId}`)
      .send(updatedUser);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(USER_NOT_FOUND_MESSAGE);
  });

  it('DELETE api/users/{userId} - Server should answer with status code 400 and corresponding message if userId is invalid (not uuid)', async () => {
    const response = await request(appServer).delete(
      `/api/users/${INVALID_USER_ID}`
    );
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(INVALID_ID_MESSAGE);
  });

  it('DELETE api/users/{userId} - Server should answer with status code 404 and corresponding message if not find the deleted user', async () => {
    const response = await request(appServer).delete(
      `/api/users/${createdUserId}`
    );
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(USER_NOT_FOUND_MESSAGE);
  });

  it('GET some-non/existing/resource - to non-existing endpoints server should answer with status code 404 and corresponding message', async () => {
    const response = await request(appServer).get(
      '/some-non/existing/resource'
    );

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(RESOURCE_NOT_EXIST_MESSAGE);
  });

  test('GET api/users - handles server error correctly', async () => {
    jest.spyOn(responseGetters, 'getGetResponse').mockImplementation(() => {
      throw new Error('Error updating user');
    });

    const response = await request(appServer).get('/api/users');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe(INTERNAL_SERVER_ERROR_MESSAGE);
  });
});
