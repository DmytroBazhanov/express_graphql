import mySql from "mysql2";

// export const connection = "";

export const openConnection = () => {
    return mySql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "kriegsmarine",
        port: 3306,
        database: "test",
    });
};
