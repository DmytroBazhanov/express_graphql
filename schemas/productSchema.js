import { buildSchema } from "graphql";
import { openConnection } from "../database.js";

export const productSchema = buildSchema(`
    type Query {
        human(id: String!): Human
    }

    type Human {
        id: String
        name: String
    }

`);

export const root = {
    id: (id) => id,
    name: (name) => name,
    human: async (argunments) => {
        const { id } = argunments;
        const connection = openConnection();

        connection.connect();

        return new Promise((resolve, reject) => {
            connection.query("SELECT * FROM test.myTest", (err, rows) => {
                if (err) reject(err);

                const human = rows.find((human) => human.id === id);
                if (rows) resolve(human);
            });
        })
            .then((human) => {
                connection.end();
                return { id: root.id(human.id), name: root.name(human.name) };
            })
            .catch((error) => console.log(error));
    },
};
