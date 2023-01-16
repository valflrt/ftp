const fs = require("fs"),
  p = require("path");

function getConfig() {
  let config = require("../config.json");

  return {
    serverRoot: p.isAbsolute(config.serverRoot)
      ? config.serverRoot
      : p.normalize(p.join(p.dirname(__dirname), config.serverRoot)),
    port: config.port ?? 8000,
    sort: config.sort ?? "dirsFirst",
  };
}

function render(data, layoutName) {
  let doc = fs
    .readFileSync(p.join(p.join(__dirname, "../layouts"), `${layoutName}.html`))
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

module.exports = { getConfig, render, el, els, getPathType, ellipsis };
