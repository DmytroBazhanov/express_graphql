import "dotenv/config";
import mySql from "mysql2";

export const openConnection = () => {
    return mySql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
    });
};

export const makeQuery = async (SQLRequest, callback) => {
    const connection = openConnection();

    connection.connect();

    return new Promise((resolve, reject) => {
        connection.query(SQLRequest, (err, rows) => callback(err, rows, resolve, reject));
    })
        .catch((error) => {
            console.log(error);
            if (error.message.includes("Duplicate entry")) {
                error.message = "Such entry already exist";
            }
            return error;
        })
        .finally(() => connection.end());
};
