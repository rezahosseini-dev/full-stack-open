import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Link,
  Stack,
} from "@mui/material";

const Blog = ({ blog, handleLike, handleRemove, currentUser }) => {
  if (!blog) {
    return null;
  }

  const showRemoveButton =
    currentUser &&
    blog.user &&
    (blog.user.username === currentUser.username ||
      blog.user === currentUser.username);

  return (
    <Box sx={{ mt: 3 }}>
      <Card
        elevation={1}
        sx={{
          borderRadius: 2,
          p: 2,
          border: "1px solid #e0e0e0",
        }}
      >
        <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
          {/* Title */}
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, mb: 1, color: "#1a1a1a" }}
          >
            {blog.title}
          </Typography>

          {/* Author */}
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", mb: 1.5, fontSize: "1.05rem" }}
          >
            by {blog.author}
          </Typography>

          {/* URL */}
          <Box sx={{ mb: 1.5 }}>
            <Link
              href={blog.url}
              target="_blank"
              rel="noreferrer"
              underline="hover"
              sx={{
                color: "#0288d1",
                fontSize: "1rem",
                wordBreak: "break-all",
              }}
            >
              {blog.url}
            </Link>
          </Box>

          {/* Added by */}
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            Added by {blog.user?.name || blog.user?.username || "anonymous"}
          </Typography>

          {/* Likes & Action Buttons Row */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="body1" sx={{ fontWeight: 600, mr: 0.5 }}>
              <span data-testid="likes-count">{blog.likes} likes</span>
            </Typography>

            {currentUser && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleLike(blog.id)}
                sx={{
                  borderColor: "#0288d1",
                  color: "#0288d1",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  px: 2,
                }}
              >
                LIKE
              </Button>
            )}

            {showRemoveButton && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => handleRemove(blog)}
                sx={{
                  textTransform: "uppercase",
                  fontWeight: 600,
                  px: 2,
                }}
              >
                REMOVE
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Blog;
