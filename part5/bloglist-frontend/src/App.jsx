import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link as RouterLink,
  useNavigate,
  Navigate,
  useMatch,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

import Blog from "./components/Blog";
import Notification from "./components/Notification";
import BlogForm from "./components/BlogForm";
import blogService from "./services/blogs";
import loginService from "./services/login";

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  const match = useMatch("/blogs/:id");
  const matchedBlog = match
    ? blogs.find((b) => b.id === match.params.id)
    : null;

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogappUser");
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({ username, password });
      window.localStorage.setItem("loggedBlogappUser", JSON.stringify(user));
      blogService.setToken(user.token);
      setUser(user);
      setUsername("");
      setPassword("");
      navigate("/");
    } catch {
      showNotification("wrong username or password", "error");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("loggedBlogappUser");
    setUser(null);
    blogService.setToken(null);
    navigate("/");
  };

  const addBlog = async (blogObject) => {
    try {
      const currentUser =
        user || JSON.parse(window.localStorage.getItem("loggedBlogappUser"));
      if (currentUser?.token) {
        blogService.setToken(currentUser.token);
      }

      const returnedBlog = await blogService.create(blogObject);

      const blogToState = {
        ...returnedBlog,
        user: {
          id:
            typeof returnedBlog.user === "object"
              ? returnedBlog.user.id
              : returnedBlog.user,
          username: currentUser?.username,
          name: currentUser?.name,
        },
      };

      setBlogs((prevBlogs) => prevBlogs.concat(blogToState));
      showNotification(
        `a new blog ${returnedBlog.title} by ${returnedBlog.author} added`,
      );

      navigate("/");
    } catch (error) {
      console.error("Error adding blog:", error);
      showNotification("failed to add blog", "error");
    }
  };

  const handleLike = async (id) => {
    const blogToLike = blogs.find((b) => b.id === id);

    const updatedBlog = {
      user: blogToLike.user?.id || blogToLike.user,
      likes: blogToLike.likes + 1,
      author: blogToLike.author,
      title: blogToLike.title,
      url: blogToLike.url,
    };

    try {
      const returnedBlog = await blogService.update(id, updatedBlog);

      const blogToState = {
        ...returnedBlog,
        likes:
          returnedBlog.likes !== undefined
            ? returnedBlog.likes
            : blogToLike.likes + 1,
        user: blogToLike.user,
      };

      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) => (blog.id === id ? blogToState : blog)),
      );
    } catch (error) {
      console.error("Error liking blog:", error);
      showNotification("failed to like blog", "error");
    }
  };

  const handleRemove = async (blog) => {
    if (window.confirm(`Removing blog ${blog.title} by ${blog.author}`)) {
      try {
        const currentUser =
          user || JSON.parse(window.localStorage.getItem("loggedBlogappUser"));
        if (currentUser?.token) {
          blogService.setToken(currentUser.token);
        }
        await blogService.remove(blog.id);
        setBlogs(blogs.filter((b) => b.id !== blog.id));
        showNotification(`Blog '${blog.title}' was successfully deleted`);
        navigate("/");
      } catch {
        showNotification("failed to remove blog", "error");
      }
    }
  };

  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes);

  return (
    <Container maxWidth="md" sx={{ pt: 3, pb: 5 }}>
      {/* Navigation Bar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#0288d1",
          borderRadius: 0,
          mb: 3,
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              color: "white",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1.25rem",
            }}
          >
            Blog App
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/"
              sx={{
                textTransform: "uppercase",
                fontWeight: 600,
                color: "white",
              }}
            >
              BLOGS
            </Button>

            {user && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/create"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                NEW BLOG
              </Button>
            )}

            {user ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ color: "white", fontStyle: "italic", mx: 1 }}
                >
                  {user.name || user.username} logged in
                </Typography>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  LOGOUT
                </Button>
              </>
            ) : (
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                LOGIN
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Notification notification={notification} />

      <Routes>
        <Route
          path="/"
          element={
            <Box>
              <Typography
                variant="h4"
                component="h2"
                sx={{ mb: 3, fontWeight: 600 }}
              >
                blogs
              </Typography>
              <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <List disablePadding>
                  {sortedBlogs.map((blog, index) => (
                    <Box key={blog.id}>
                      <ListItem
                        component={RouterLink}
                        to={`/blogs/${blog.id}`}
                        sx={{
                          textDecoration: "none",
                          color: "inherit",
                          "&:hover": { backgroundColor: "action.hover" },
                          py: 2,
                        }}
                      >
                        <ListItemText
                          primary={blog.title}
                          primaryTypographyProps={{
                            fontSize: "1.1rem",
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                      {index < sortedBlogs.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Paper>
            </Box>
          }
        />

        <Route
          path="/create"
          element={
            user ? (
              <Box>
                <BlogForm createBlog={addBlog} />
              </Box>
            ) : (
              <Navigate replace to="/login" />
            )
          }
        />

        <Route
          path="/blogs/:id"
          element={
            <Blog
              blog={matchedBlog}
              handleLike={handleLike}
              handleRemove={handleRemove}
              currentUser={user}
            />
          }
        />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate replace to="/" />
            ) : (
              <Container maxWidth="xs">
                <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ mb: 3, fontWeight: 600, textAlign: "center" }}
                  >
                    Log in to application
                  </Typography>
                  <Box component="form" onSubmit={handleLogin} noValidate>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      value={username}
                      onChange={({ target }) => setUsername(target.value)}
                      slotProps={{
                        htmlInput: { "data-testid": "username" },
                      }}
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      type="password"
                      id="password"
                      label="Password"
                      value={password}
                      onChange={({ target }) => setPassword(target.value)}
                      slotProps={{
                        htmlInput: { "data-testid": "password" },
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{
                        mt: 3,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Login
                    </Button>
                  </Box>
                </Paper>
              </Container>
            )
          }
        />
      </Routes>
    </Container>
  );
};

export default App;
