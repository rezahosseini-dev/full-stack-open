const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await require("bcrypt").hash("secret", 10);
    const user = new User({
      username: "root",
      name: "Superuser",
      passwordHash,
    });
    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "password123",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await User.find({});
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert.ok(usernames.includes(newUser.username));
  });

  test("creation fails with status code 400 if username is taken", async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "password123",
    };

    const res = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert.ok(res.body.error.includes("unique"));

    const usersAtEnd = await User.find({});
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with status code 400 if username is shorter than 3 characters", async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: "ab",
      name: "Short User",
      password: "password123",
    };

    const res = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert.ok(res.body.error.includes("at least 3 characters"));

    const usersAtEnd = await User.find({});
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails with status code 400 if password is shorter than 3 characters", async () => {
    const usersAtStart = await User.find({});

    const newUser = {
      username: "validusername",
      name: "Short Password User",
      password: "12",
    };

    const res = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert.ok(res.body.error.includes("at least 3 characters"));

    const usersAtEnd = await User.find({});
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
