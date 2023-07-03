interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

type RequestUrl = string | undefined;

export {
  User,
  RequestUrl,
};
