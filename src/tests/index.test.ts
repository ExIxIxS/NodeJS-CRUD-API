import request from 'supertest';
import appServer from '../index';

afterAll((done) => {
  appServer.close(() => {
    done();
  });
})

describe('API Tests', () => {
  let createdUserId: string;

  it('should get all records with a GET api/users request', async () => {
    const response = await request(appServer).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should create a new object with a POST api/users request', async () => {
    const newUser = {
      username: 'John Doe',
      age: 25,
      hobbies: ['reading', 'gaming'],
    };

    const response = await request(appServer).post('/api/users').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    createdUserId = response.body.id;
  });

  it('should get the created record by its id with a GET api/users/{userId} request', async () => {
    const response = await request(appServer).get(`/api/users/${createdUserId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdUserId);
  });

  it('should update the created record with a PUT api/users/{userId} request', async () => {
    const updatedUser = {
      username: 'John Doe',
      age: 30,
      hobbies: ['reading', 'swimming'],
    };

    const response = await request(appServer).put(`/api/users/${createdUserId}`).send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdUserId);
    expect(response.body.age).toBe(30);
    expect(response.body.hobbies).toEqual(['reading', 'swimming']);
  });

  it('should delete the created object by id with a DELETE api/users/{userId} request', async () => {
    const response = await request(appServer).delete(`/api/users/${createdUserId}`);
    expect(response.status).toBe(204);
  });

  it('should not find the deleted object with a GET api/users/{userId} request', async () => {
    const response = await request(appServer).get(`/api/users/${createdUserId}`);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('User not found');
  });
});
