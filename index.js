import { graphqlHTTP } from "express-graphql";
import { productSchema, root } from "./schemas/productSchema.js";
import { openConnection } from "./database.js";

import express from "express";

const app = express();
const port = 8000;

app.get("/", (req, res) => {
    res.status(403).json({ error: "URL is not accessible" });
});

app.get("/test", (req, res, next) => {
    const connection = openConnection();
    connection.query("SELECT * FROM test.myTest", (err, rows, fields) => {
        if (err) {
            console.log(err);
            return err;
        }
        res.status(200).json(rows);
        connection.end();
    });
});

app.use(
    "/graphql",
    graphqlHTTP({
        schema: productSchema,
        rootValue: root,
        graphiql: true,
    })
);

app.use((err, req, res, next) => {
    if (err) {
        res.status(500).json({ value: "internal server error" });
        console.log(err);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
