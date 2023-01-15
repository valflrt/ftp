const http = require("http");
const fs = require("fs");
const pp = require("path");
const mime = require("mime-types");
const config = require("./config.json");

const port = 8000;

const serverRoot = config.serverRoot;
const layoutsPath = pp.join(__dirname, "layouts");

function html(data, layoutName) {
  let doc = fs
    .readFileSync(pp.join(layoutsPath, `${layoutName}.html`))
    .toString();
  if (typeof data === "string") doc = doc.replaceAll("{{}}", data);
  else if (typeof data === "object")
    Object.entries(data).forEach(([k, v]) => {
      doc = doc.replaceAll(`{{${k}}}`, v);
    });
  doc = doc.replace(/(?<!\\){{\w+}}/gm, "");
  return doc;
}

function el(content, name, attributes) {
  return (
    `<${name}${
      attributes
        ? " " +
          Object.entries(attributes)
            .map(([k, v]) => `${k}="${v}"`)
            .join(" ")
        : ""
    }>` +
    content +
    `</${name}>`
  );
}
function els(...elements) {
  return elements.map((v) => el(...v));
}

function getPathType(path) {
  let exists = fs.existsSync(path);
  if (exists) {
    let stat = fs.statSync(path);
    if (stat.isFile()) return 0;
    else if (stat.isDirectory()) return 1;
  }
  return -1;
}

function ellipsis(str, outputLength = 30) {
  let strLength = str.length;
  let midOutputLength = Math.floor(outputLength - 3 / 2);
  return strLength > outputLength
    ? str
        .substring(0, midOutputLength)
        .concat("...")
        .concat(str.substring(strLength - midOutputLength, strLength))
    : str;
}

function sortPaths(a, b) {
  if (!config.sort || config.sort === "dirsFirst") {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return 0;
  } else if (config.sort === "filesFirst") {
    if (a.isDir && !b.isDir) return 1;
    if (!a.isDir && b.isDir) return -1;
    return 0;
  } else if (config.sort === "alphabetical") return 0;
}

http
  .createServer((req, res) => {
    console.log(`${req.url}`);

    try {
      let url = decodeURI(req.url);
      let path = pp.normalize(pp.join(serverRoot, decodeURI(url)));

      let pathType = getPathType(path);
      if (pathType === 1) {
        res.writeHead(200, { "Content-Type": "text/html" }).end(
          html(
            {
              title: "Index of " + ellipsis(url),
              content: html(
                [
                  {
                    name: "..",
                    isDir: true,
                  },
                  ...fs
                    .readdirSync(path, { withFileTypes: true })
                    .filter((e) => e.isFile() || e.isDirectory())
                    .map((e) => ({
                      name: e.name,
                      isDir: e.isDirectory(),
                    }))
                    .sort(sortPaths),
                ]

                  .map((e) =>
                    el(
                      els(
                        [
                          el(ellipsis(e.name, 50), "a", {
                            href: pp.join(encodeURI(url), e.name),
                          }),
                          "td",
                        ],
                        [e.isDir ? "directory" : "file", "td"]
                      ).join(""),
                      "tr"
                    )
                  )
                  .join(""),
                "dir"
              ),
            },
            "base"
          )
        );
      } else if (pathType === 0) {
        res
          .writeHead(200, {
            "Content-Type": mime.lookup(pp.extname(path)) ?? "text/html",
          })
          .end(fs.readFileSync(path, { withFileTypes: true }));
      } else
        return res.writeHead(404, { "Content-Type": "text/html" }).end(
          html(
            {
              title: "404: Not Found",
              content: html(el("back to /", "a", { href: "/" }), "simple"),
            },
            "base"
          )
        );
    } catch (e) {
      console.error(e);
      res.writeHead(500, { "Content-Type": "text/plain" }).end(`500: ${e}`);
    }
  })
  .listen(port, () => {
    console.clear();
    console.log(`listening at port ${port}`);
  });
