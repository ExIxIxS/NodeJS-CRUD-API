import { User } from '../interfaces';

class FakeDB {
  #userList: User[] = [];

  getUsers(): User[] {
    return this.#userList.map((user) => {
      return { ...user };
    });
  }

  getUser(userId: unknown): User | undefined {
    if (typeof userId !== 'string') {
      return;
    }

    const user = this.#userList.find((user) => user.id === userId);

    if (user) {
      return { ...user };
    }
  }

  addUser(newUser: User): void {
    this.#userList.push(newUser);
  }

  updateUser(updatedUser: User): void {
    const userIndex = this.#userList.findIndex(
      (user) => user.id === updatedUser.id
    );

    if (userIndex >= 0) {
      this.#userList.splice(userIndex, 1, updatedUser);
    }
  }

  deleteUser(userId: unknown): User | undefined {
    if (typeof userId !== 'string') {
      return;
    }

    const userIndex = this.#userList.findIndex((user) => user.id === userId);

    if (userIndex >= 0) {
      const deletedUser = this.getUser(userId);
      this.#userList.splice(userIndex, 1);

      return deletedUser;
    }
  }
}

const fakeDB = new FakeDB();

export default fakeDB;
