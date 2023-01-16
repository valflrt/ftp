# static http server

A very simple static http server server made with nodejs (http). It features index pages and correct mime types based on file extension.

> Be careful: It can hurt your eyes if you look at it for too long.

## Configuration

Edit [config.json](./config.json).

```ts
type Config = {
  serverRoot: string;
  port?: number = 8000;
  sort?: "dirsFirst" | "filesFirst" | "alphabetical" = "dirsFirst";
};
```

## Layouts

It is possible to edit the default layouts (and style). To do so, edit the html files in the [layouts](./layouts/) directory.
