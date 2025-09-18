const bcrypt = require("bcryptjs");
const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: bcrypt.hashSync("123456", 10),
  },
  {
    name: "Jane Deniel",
    email: "jane@example.com",
    password: bcrypt.hashSync("123456", 10),
  },
];

module.exports = users;
