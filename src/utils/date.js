class DateFormatter {
    static getFormattedDateWIB() {
        const date = new Date();

        const timeZoneOffset = 7 * 60; // Offset for GMT+7 in minutes
        const localDate = new Date(date.getTime() + timeZoneOffset * 60 * 1000);

        const year = localDate.getUTCFullYear();
        const month = String(localDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(localDate.getUTCDate()).padStart(2, '0');
        const hours = String(localDate.getUTCHours()).padStart(2, '0');
        const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
        const seconds = String(localDate.getUTCSeconds()).padStart(2, '0');

        const timeZoneOffsetString = "+0700";

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${timeZoneOffsetString}`;
    }

    static getThirtyDaysBeforeToday() {
        const now = new Date();
        const thirtyDaysBeforeNow = new Date();
        thirtyDaysBeforeNow.setDate(now.getDate() - 30);
        return thirtyDaysBeforeNow;
    }

}

module.exports = DateFormatter