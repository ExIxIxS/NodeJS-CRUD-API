import dotenv from 'dotenv';
import createApiServer from './apiServer/createApiServer';

dotenv.config();

const server = createApiServer();

const port = process.env.PORT || 3000; // - default if PORT is not set in the .env file

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default server;
