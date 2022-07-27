function getWeekDay() {
    const days = [
        'Воскресенье',
        'Понедельник',
        'Вторник',
        'Среда',
        'Четверг',
        'Пятница',
        'Суббота'
    ];
    const d = new Date();
    const n = d.getDay();
    return days[n]
}

module.exports = getWeekDay;
