import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
} from "@mui/material";

const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [url, setUrl] = useState("");

  const addBlog = (event) => {
    event.preventDefault();
    createBlog({
      title,
      author,
      url,
    });

    setTitle("");
    setAuthor("");
    setUrl("");
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: 4, maxWidth: 500, mx: "auto", border: "1px solid #e0e0e0" }}
    >
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 700 }}>
        create new
      </Typography>

      <Box component="form" onSubmit={addBlog}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            size="small"
            label="Title"
            id="title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
            slotProps={{
              htmlInput: { "data-testid": "title" },
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="Author"
            id="author"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
            slotProps={{
              htmlInput: { "data-testid": "author" },
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="URL"
            id="url"
            value={url}
            onChange={({ target }) => setUrl(target.value)}
            slotProps={{
              htmlInput: { "data-testid": "url" },
            }}
          />

          <Box sx={{ pt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#1976d2",
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: 1,
              }}
            >
              CREATE
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default BlogForm;
