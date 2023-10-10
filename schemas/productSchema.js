import { buildSchema } from "graphql";
import { openConnection, makeQuery } from "../database.js";

export const productSchema = buildSchema(`
    type Query {
        human(id: String!): Human
    }

    type Mutation {
        createUser(id: String!, name: String!): Human
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

        return makeQuery(
            `SELECT * FROM test.myTest WHERE id='${id}'`,
            (err, rows, resolve, reject) => {
                if (err) reject(err);
                resolve(rows[0]);
            }
        ).then((human) => {
            return { id: root.id(human.id), name: root.name(human.name) };
        });
    },
    createUser: async (argunments) => {
        const { id, name } = argunments;

        return makeQuery(
            `INSERT INTO test.myTest (id, name) VALUES ('${id}', '${name}')`,
            (err, rows, resolve, reject) => {
                if (err) reject(err);
                resolve(rows);
            }
        ).then(() => {
            return { id, name };
        });
    },
};
