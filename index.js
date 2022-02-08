const express = require("express");
const mal = require("mal-scraper");
const fetch = require("cross-fetch");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/test", function (req, res) {
  res.json("API is working");
});

app.get("/scrape/:function/*", async function (req, res) {
  const args = req.url.replace(/^\/scrape\/.*\//, "").split(/(&|%26)/).filter(arg => arg !== "&" && arg !== "%26").map(arg => decodeURIComponent(arg));
  const func = req.params.function;

  const response = await mal[func].apply(mal, args);

  res.json(response);
});

app.post("/api/:method/*", async (req, res) => {
  const url = req.url.replace(/^\/api\/.{3,7}\//, "");

  const allowedHeaders = ["authorization", "x-mal-client-id", "content-type"];

  const headers = allowedHeaders.reduce((headers, allowedHeader) => {
    const header = req.headers[allowedHeader];
    if (header) {
      return Object.assign(headers, { [allowedHeader]: header });
    }

    return headers;
  }, {});

  const body =
    headers["content-type"] === "application/x-www-form-urlencoded"
      ? Object.entries(req.body).reduce((body, param) => `${body}&${param[0]}=${param[1]}`, "")
      : req.body;

  const method = req.params.method.toUpperCase();

  const response = await (
    await fetch(url, {
      method,
      headers,
      ...(method !== "GET" && method !== "HEAD" && { body }),
    })
  ).json();

  res.json(response);
});

app.listen(process.env.PORT || 3000);
