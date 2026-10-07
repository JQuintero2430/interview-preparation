interface User {
  name: string;
}

const greet = (user: User): string => `hello ${user.name}`;
console.log(greet({ name: 'Ada' }));
