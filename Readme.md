## Node.js CRUD API
Simple CRUD API using in-memory database underneath.

### How to use:
+ use cli script 'npm install',
+ use cli script 'npm run start:dev' for working in development mode,
+ use cli script 'npm run start:prod' for working in production mode,
+ use cli script 'npm run start:multi' for working in load balancer mode,
+ use cli script 'npm run test', for testing,
+ use cli script 'npm run lint', to enable linters,

### How to check that load balancer work properly using browser:
+ enable load balancer mode and open in a browser page: http://localhost:4000/api/users,
+ refresh the page a few times, each time in server console appears message with server port number.

### How to specify port:
+ you can change ports in .\.env file

### Emplemented features:
#### Basic Scope
- GET api/users
- GET api/users/{userId}
- POST api/users
- PUT api/users/{userId}
- DELETE api/users/{userId}
- Value of port on which application is running is stored in .env file
#### Advanced Scope
- Task implemented on Typescript
- Processing of requests to non-existing endpoints implemented properly
- Errors on the server side that occur during the processing of a request handled and processed properly
- Development mode: npm script start:dev
- Production mode: npm script start:prod
#### Hacker Scope
- There are tests for API (not less than 3 scenarios)
- There is horizontal scaling for application with a load balancer

________________

#### Task: [Node.js CRUD API](https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments/crud-api/assignment.md)
