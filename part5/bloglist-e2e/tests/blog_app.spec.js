const { test, expect, beforeEach, describe } = require("@playwright/test");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("http://localhost:3001/api/testing/reset");
    await request.post("http://localhost:3001/api/users", {
      data: {
        name: "Reza Dev",
        username: "reza",
        password: "secretpassword",
      },
    });

    await page.goto("/");
  });

  test("Login succeeds with correct username and password", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "login" }).click();
    await page.getByTestId("username").fill("reza");
    await page.getByTestId("password").fill("secretpassword");
    await page.getByRole("button", { name: "login" }).click();

    await expect(page.getByText("Reza Dev logged in")).toBeVisible();
  });

  test("Login fails with incorrect username or password", async ({ page }) => {
    await page.getByRole("link", { name: "login" }).click();
    await page.getByTestId("username").fill("reza");
    await page.getByTestId("password").fill("wrongpassword");
    await page.getByRole("button", { name: "login" }).click();

    await expect(page.getByText("wrong username or password")).toBeVisible();
    await expect(page.getByText("Reza Dev logged in")).not.toBeVisible();
  });

  describe("When logged in", () => {
    beforeEach(async ({ page, request }) => {
      const response = await request.post("http://localhost:3001/api/login", {
        data: {
          username: "reza",
          password: "secretpassword",
        },
      });

      const user = await response.json();

      await page.addInitScript((loggedUser) => {
        window.localStorage.setItem(
          "loggedBlogappUser",
          JSON.stringify(loggedUser),
        );
      }, user);

      await page.goto("/");
      await expect(page.getByText("Reza Dev logged in")).toBeVisible();
    });

    test("a logged-in user can create a blog", async ({ page }) => {
      await page.getByRole("link", { name: "new blog" }).click();

      await page.getByTestId("title").fill("Testing E2E with Playwright");
      await page.getByTestId("author").fill("Reza");
      await page.getByTestId("url").fill("https://playwright.dev");

      await page.getByRole("button", { name: "create" }).click();

      await page.waitForURL("/");
      await expect(page.getByRole("heading", { name: "blogs" })).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Testing E2E with Playwright" }),
      ).toBeVisible();
    });

    test("a logged-in user can like a blog", async ({ page, request }) => {
      const loggedUser = await page.evaluate(() =>
        JSON.parse(window.localStorage.getItem("loggedBlogappUser")),
      );

      await request.post("http://localhost:3001/api/blogs", {
        data: {
          title: "Blog to be liked",
          author: "Reza",
          url: "https://example.com",
        },
        headers: {
          Authorization: `Bearer ${loggedUser.token}`,
        },
      });

      await page.goto("/");

      const blogLink = page.getByRole("link", { name: "Blog to be liked" });
      await expect(blogLink).toBeVisible();
      await blogLink.click();

      const likeButton = page.getByRole("button", { name: "like" });
      await expect(likeButton).toBeVisible();
      await likeButton.click();

      await expect(page.getByText(/^likes 1$/i)).toBeVisible();
    });

    test("a logged-in user can delete a blog", async ({ page, request }) => {
      const loggedUser = await page.evaluate(() =>
        JSON.parse(window.localStorage.getItem("loggedBlogappUser")),
      );

      await request.post("http://localhost:3001/api/blogs", {
        data: {
          title: "Blog to be deleted",
          author: "Reza",
          url: "https://example.com",
        },
        headers: {
          Authorization: `Bearer ${loggedUser.token}`,
        },
      });

      await page.goto("/");

      const blogLink = page.getByRole("link", { name: "Blog to be deleted" });
      await expect(blogLink).toBeVisible();
      await blogLink.click();

      page.once("dialog", async (dialog) => {
        await dialog.accept();
      });

      const removeButton = page.getByRole("button", { name: "remove" });
      await expect(removeButton).toBeVisible();
      await removeButton.click();

      await page.waitForURL("/");
      await expect(page.getByRole("heading", { name: "blogs" })).toBeVisible();
      await expect(blogLink).not.toBeVisible();
    });
  });
});
