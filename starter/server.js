const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  try {
    let filePath;
    if (req.url === "/") {
      filePath = path.join(PUBLIC_DIR, "index.html");
    } else if (req.url === "/about") {
      filePath = path.join(PUBLIC_DIR, "about.html");
    } else if (req.url === "/contact") {
      filePath = path.join(PUBLIC_DIR, "contact.html");
    } else if (req.url.startsWith("/styles/")) {
      filePath = path.join(PUBLIC_DIR, req.url);
      const normalizedPath = path.normalize(filePath);
      if (!normalizedPath.startsWith(PUBLIC_DIR)) {
        handle404(res);
        return;
      }

      fs.readFile(filePath, (err, data) => {
        if (err) {
          handle404(res);
          return;
        }
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(data);
      });

      return;
    } else {
      handle404(res);
      return;
    }
    const extname = path.extname(filePath);

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === "ENOENT") {
          handle404(res);
        } else {
          handleServerError(res, err);
        }
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content, "utf-8");
      }
    });
  } catch (error) {
    handleServerError(res, error);
  }
});

function handle404(res) {
  const notFoundPath = path.join(PUBLIC_DIR, "404.html");
  fs.readFile(notFoundPath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 - Page Not Found");
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(content, "utf-8");
    }
  });
}

function handleServerError(res, error) {
  console.error("Server error:", error);

  const serverErrorPath = path.join(PUBLIC_DIR, "500.html");

  fs.readFile(serverErrorPath, (err, content) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 - Internal Server Error");
    } else {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(content, "utf-8");
    }
  });
}

server.listen(PORT, host, () => {
  console.log(`Server is running on ${PORT}`);
  console.log("Avaible routes:");
  console.log(" GET /           -> index.html");
  console.log(" GET /about      -> about.html");
  console.log(" GET /contact    -> contact.html");
});
