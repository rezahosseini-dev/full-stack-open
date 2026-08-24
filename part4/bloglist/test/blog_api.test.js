const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const initialBlogs = [
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    url: "https://cleancoder.com",
    likes: 15,
  },
  {
    title: "Refactoring: Improving the Design of Existing Code",
    author: "Martin Fowler",
    url: "https://refactoring.com",
    likes: 20,
  },
];

let token = null;

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("secret", 10);
  const user = new User({ username: "root", name: "Superuser", passwordHash });
  await user.save();

  const loginResponse = await api
    .post("/api/login")
    .send({ username: "root", password: "secret" });

  token = loginResponse.body.token;

  const blogsWithUser = initialBlogs.map((blog) => ({
    ...blog,
    user: user._id,
  }));

  await Blog.insertMany(blogsWithUser);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const res = await api.get("/api/blogs");
  assert.strictEqual(res.body.length, initialBlogs.length);
});

test("unique identifier property of the blog posts is named id", async () => {
  const res = await api.get("/api/blogs");

  const blogToTest = res.body[0];

  assert.ok(blogToTest.id);
  assert.strictEqual(blogToTest._id, undefined);
});

test("a valid blog can be added", async () => {
  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/EWD808.html",
    likes: 12,
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const res = await api.get("/api/blogs");
  const titles = res.body.map((r) => r.title);

  assert.strictEqual(res.body.length, initialBlogs.length + 1);
  assert.ok(titles.includes("Canonical string reduction"));
});

test("adding a blog fails with 401 Unauthorized if token is missing", async () => {
  const newBlog = {
    title: "Blog without token",
    author: "Anonymous",
    url: "https://example.com",
    likes: 1,
  };

  const res = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(401)
    .expect("Content-Type", /application\/json/);

  assert.ok(res.body.error.includes("token missing or invalid"));

  const blogsAtEnd = await api.get("/api/blogs");
  assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length);
});

test("if the likes property is missing, it defaults to 0", async () => {
  const newBlogWithoutLikes = {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
  };

  const res = await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlogWithoutLikes)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  assert.strictEqual(res.body.likes, 0);
});

test("blog without title is not added", async () => {
  const newBlog = {
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com",
    likes: 5,
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(400);

  const res = await api.get("/api/blogs");
  assert.strictEqual(res.body.length, initialBlogs.length);
});

test("blog without url is not added", async () => {
  const newBlog = {
    title: "Type systems and architecture",
    author: "Robert C. Martin",
    likes: 5,
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(400);

  const res = await api.get("/api/blogs");
  assert.strictEqual(res.body.length, initialBlogs.length);
});

test("succeeds with status code 204 if id is valid and authorized", async () => {
  const resAtStart = await api.get("/api/blogs");
  const blogToDelete = resAtStart.body[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(204);

  const resAtEnd = await api.get("/api/blogs");

  assert.strictEqual(resAtEnd.body.length, initialBlogs.length - 1);

  const titles = resAtEnd.body.map((r) => r.title);
  assert.strictEqual(titles.includes(blogToDelete.title), false);
});

test("succeeds in updating the likes of a blog post", async () => {
  const resAtStart = await api.get("/api/blogs");
  const blogToUpdate = resAtStart.body[0];

  const updatedBlogData = {
    ...blogToUpdate,
    likes: blogToUpdate.likes + 1,
  };

  const res = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedBlogData)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.strictEqual(res.body.likes, blogToUpdate.likes + 1);
});

after(async () => {
  await mongoose.connection.close();
});
