import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, vi } from "vitest";
import Blog from "./Blog";

describe("<Blog />", () => {
  const blog = {
    id: "12345",
    title: "Testing React components by reza",
    author: "reza dev",
    url: "https://fullstackopen.com/",
    likes: 12,
    user: {
      username: "reza",
      name: "rezahs",
    },
  };

  const handleLike = vi.fn();
  const handleRemove = vi.fn();

  test("displays blog info and likes to unauthenticated users, but no buttons", () => {
    render(
      <MemoryRouter>
        <Blog
          blog={blog}
          handleLike={handleLike}
          handleRemove={handleRemove}
          currentUser={null}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Testing React components by reza/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/reza dev/i)).toBeInTheDocument();
    expect(screen.getByText("https://fullstackopen.com/")).toBeInTheDocument();

    expect(
      screen.getByText(
        (content) => content.includes("likes") && content.includes("12"),
      ),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /like/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove/i }),
    ).not.toBeInTheDocument();
  });

  test("shows only the like button to authenticated users who are not the creator", () => {
    const regularUser = {
      username: "other_user",
      name: "Other User",
    };

    render(
      <MemoryRouter>
        <Blog
          blog={blog}
          handleLike={handleLike}
          handleRemove={handleRemove}
          currentUser={regularUser}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /like/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove/i }),
    ).not.toBeInTheDocument();
  });

  test("shows both like and remove buttons to the blog creator", () => {
    const creatorUser = {
      username: "reza",
      name: "rezahs",
    };

    render(
      <MemoryRouter>
        <Blog
          blog={blog}
          handleLike={handleLike}
          handleRemove={handleRemove}
          currentUser={creatorUser}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /like/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
  });

  test("calls handleLike twice when like button is clicked twice", async () => {
    const creatorUser = {
      username: "reza",
      name: "rezahs",
    };

    render(
      <MemoryRouter>
        <Blog
          blog={blog}
          handleLike={handleLike}
          handleRemove={handleRemove}
          currentUser={creatorUser}
        />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    const likeButton = screen.getByRole("button", { name: /like/i });

    await user.click(likeButton);
    await user.click(likeButton);

    expect(handleLike.mock.calls).toHaveLength(2);
  });
});
