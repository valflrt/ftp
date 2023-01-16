const http = require("http"),
  fs = require("fs"),
  p = require("path"),
  mime = require("mime-types"),
  {
    getConfig,
    render,
    el,
    els,
    getPathType,
    ellipsis,
    prepend,
  } = require("./util");

const { serverRoot, port, sort } = getConfig();

function sortPaths(a, b) {
  if (sort === "dirsFirst") {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return 0;
  } else if (sort === "filesFirst") {
    if (a.isDir && !b.isDir) return 1;
    if (!a.isDir && b.isDir) return -1;
    return 0;
  } else if (sort === "alphabetical") return 0;
}

http
  .createServer((req, res) => {
    console.log(`${req.url}`);

    try {
      let url = decodeURI(req.url);
      let path = p.normalize(p.join(serverRoot, decodeURI(url)));

      let pathType = getPathType(path);
      if (pathType === 1) {
        let paths = prepend(
          fs
            .readdirSync(path, { withFileTypes: true })
            .filter((e) => e.isFile() || e.isDirectory())
            .map((e) => ({
              name: e.name,
              isDir: e.isDirectory(),
            }))
            .sort(sortPaths),
          url !== "/" && {
            name: "..",
            isDir: true,
          }
        )
          .filter((e) => !!e)
          .map((e) =>
            el(
              els(
                [
                  el(ellipsis(e.name, 50), "a", {
                    href: p.join(encodeURI(url), e.name),
                  }),
                  "td",
                ],
                [e.isDir ? "directory" : "file", "td"]
              ).join(""),
              "tr"
            )
          )
          .join("");

        res.writeHead(200, { "Content-Type": "text/html" }).end(
          render(
            {
              title: "Index of " + ellipsis(url),
              content: render(paths, "paths"),
            },
            "base"
          )
        );
      } else if (pathType === 0) {
        res
          .writeHead(200, {
            "Content-Type": mime.lookup(p.extname(path)) ?? "text/plain",
          })
          .end(fs.readFileSync(path, { withFileTypes: true }));
      } else
        return res.writeHead(404, { "Content-Type": "text/html" }).end(
          render(
            {
              title: `404 Not Found (${url})`,
              content: el("back to /", "a", { href: "/" }),
            },
            "base"
          )
        );
    } catch (e) {
      console.error(e);
      res.writeHead(500, { "Content-Type": "text/html" }).end(
        render(
          {
            title: "Error 500",
            content: `An unknown error occurred`,
          },
          "base"
        )
      );
    }
  })
  .listen(port, () => {
    console.clear();
    console.log(`listening at port ${port}`);
  });
