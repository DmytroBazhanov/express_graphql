import express from "express";
import http from "http";

const app = express();
const port = 8000;

app.get("/", (req, res) => {
    res.status(403).json({ error: "URL is not accessible" });
});

app.get("/test", (req, res, next) => {
    res.status(200).json({ value: "Test" });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

app.use((err, req, res, next) => {
    if (err) res.status(500).json({ value: "Internal server error" });
});
