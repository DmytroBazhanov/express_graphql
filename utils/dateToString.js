export default function dateToString(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const reservationDate = date.getDate();

    const monthStr = Number(month) >= 10 ? month : `0${month}`;
    const dateStr = Number(reservationDate) >= 10 ? reservationDate : `0${reservationDate}`;

    return `${year}-${monthStr}-${dateStr}`;
}
