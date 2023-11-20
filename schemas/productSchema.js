import { buildSchema } from "graphql";
import { makeQuery } from "../database.js";
import dateToString from "../utils/dateToString.js";

// type Mutation {
//     createUser(id: String!, name: String!): Human
// }

export const productSchema = buildSchema(`
    type Query {
        book(id: String!): Book
        books: [Book]
        reader(id: String!): Reader
        reservedBook(bookID: String!): [ReservedBooks]
        readerReservations(readerID: String!): [Reservation]
    }

    type Mutation {
        readerMutation(id: String!, input: ReaderInput!): Reader
        addBookReservation(readerID: String!, bookID: String!, date: String!): ReservedBooks
    }

    type Book {
        id: String
        name: String
        author: String
        tags: String
        text: String
    }

    type Reader {
        id: String
        name: String
        lastname: String
    }

    input ReaderInput {
        name: String
        lastname: String
    }

    type Reservation {
        bookID: String
        readerID: String
        reservationEndDate: String
    }

    type ReservedBooks {
        book: Book
        reader: Reader
        reservationEndDate: String
    }
`);

export const root = {
    book: async (args) => {
        const { id, fields } = args;

        const requestedBookFields = fields ? fields.join(", ") : `*`;

        if (id) {
            return makeQuery(
                `SELECT ${requestedBookFields} FROM test.book WHERE id='${id}'`,
                (error, rows, resolve, reject) => {
                    if (error) reject(error);
                    resolve(rows[0]);
                }
            ).then((book) => book);
        }
    },

    books: async (args) => {
        return makeQuery(`SELECT * FROM test.book`, (error, rows, resolve, reject) => {
            if (error) reject(error);
            resolve(rows);
        }).then((books) => books);
    },

    reader: async (args) => {
        const { id } = args;

        if (id) {
            return makeQuery(
                `SELECT * FROM test.reader WHERE id='${id}'`,
                (error, rows, resolve, reject) => {
                    if (error) reject(error);
                    resolve(rows[0]);
                }
            ).then((user) => user);
        }
    },

    readerReservations: async (args) => {
        const { readerID } = args;

        return makeQuery(
            `SELECT * FROM test.reservedBooks WHERE readerID='${readerID}'`,
            (error, rows, resolve, reject) => {
                if (error) reject(error);

                const result = rows.map((record) => {
                    return {
                        ...record,
                        reservationEndDate: dateToString(new Date(record.reservationEndDate)),
                    };
                });

                resolve(result);
            }
        ).then((records) => records);
    },

    reservedBook: async (args) => {
        const { bookID, bookFields } = args;

        return makeQuery(
            `SELECT * FROM test.reservedBooks WHERE bookID='${bookID}'`,
            async (error, rows, resolve, reject) => {
                if (error) reject(error);

                const result = rows.map((record) => {
                    return {
                        ...record,
                        reader: null,
                        book: null,
                        reservationEndDate: dateToString(new Date(record.reservationEndDate)),
                    };
                });

                for (let record of result) {
                    const reader = await root.reader({ id: record.readerID });
                    const book = await root.book({ id: record.bookID, fields: bookFields });

                    record.reader = reader;
                    record.book = book;
                }

                resolve(result);
            }
        ).then((records) => {
            return records;
        });
    },

    addBookReservation: async (args) => {
        const { readerID, bookID, date } = args;

        const presentReservations = await root.reservedBook({
            bookID: bookID,
            bookFields: ["id"],
        });

        let maxDate = Date.now();
        presentReservations.forEach((reservation) => {
            if (reservation.reservationEndDate > maxDate || maxDate === null)
                maxDate = reservation.reservationEndDate;
        });

        if (
            date > Number(new Date(maxDate).getTime()) + 604800000 ||
            date <= Number(new Date(maxDate).getTime())
        ) {
            throw new Error("Innapropriate date");
        }
            

        const returnDate = dateToString(new Date(Number(date)));

        return makeQuery(
            `INSERT INTO test.reservedBooks (readerID, bookID, reservationEndDate)
             VALUES ('${readerID}', '${bookID}', '${returnDate}')`,
            async (error, rows, resolve, reject) => {
                if (error) reject(error);

                const reader = await root.reader({ id: readerID });
                const book = await root.book({ id: bookID });

                resolve({ reader, book, reservationEndDate: returnDate });
            }
        ).then((reservationRecord) => reservationRecord);
    },

    readerMutation: async (args) => {
        const { id, input } = args;

        if (id) {
            const updatedValues = Object.keys(input)
                .map((key) => `${key} = '${input[key]}'`)
                .join(",");

            return makeQuery(
                `UPDATE test.reader SET ${updatedValues} WHERE id='${id}'`,
                (error, rows, resolve, reject) => {
                    if (error) reject(error);
                    resolve(rows[0]);
                }
            ).then(() => root.reader({ id: id }));
        }
    },
};
