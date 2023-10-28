import mySql from "mysql2";

export const openConnection = () => {
    return mySql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "kriegsmarine",
        port: 3306,
        database: "test",
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
            return error;
        })
        .finally(() => connection.end());
};
