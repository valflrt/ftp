# ftp

A very simple ftp server made with nodejs (http).

> Be careful: It can hurt for your eyes if you look at it for too long.

## Configuration

Edit [config.json](./config.json).

```ts
type Config = {
  serverRoot: string;
  sort?: "dirsFirst" | "filesFirst" | "alphabetical" = "dirsFirst";
};
```

## Layouts

It is possible to edit the default layouts. To do so, edit the html files in the [layouts](./layouts/) directory.
