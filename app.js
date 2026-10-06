// ============================================================
// TELEGRAM MINI APP
// ============================================================

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}


// ============================================================
// НАСТРОЙКИ КАРАУЛОВ
// ============================================================

const GUARDS = {
    1: {
        name: "Караул №1",
        color: "guard-1"
    },

    2: {
        name: "Караул №2",
        color: "guard-2"
    },

    3: {
        name: "Караул №3",
        color: "guard-3"
    },

    4: {
        name: "Караул №4",
        color: "guard-4"
    }
};


// ============================================================
// БАЗОВАЯ ДАТА
// ============================================================
//
// 1 сентября 2026 = Караул №1
//
// Дальше:
//
// 2 = №2
// 3 = №3
// 4 = №4
// 5 = №1
//
// И так далее.
//
// Поэтому любой месяц рассчитывается автоматически.
// ============================================================

const BASE_DATE = new Date(
    2026,
    8,
    1
);


// ============================================================
// ЭЛЕМЕНТЫ
// ============================================================

const calendar =
    document.getElementById("calendar");

const monthTitle =
    document.getElementById("monthTitle");

const todayDate =
    document.getElementById("todayDate");

const todayGuard =
    document.getElementById("todayGuard");

const infoDate =
    document.getElementById("infoDate");

const infoGuard =
    document.getElementById("infoGuard");

const prevMonth =
    document.getElementById("prevMonth");

const nextMonth =
    document.getElementById("nextMonth");


// ============================================================
// СОСТОЯНИЕ
// ============================================================

const now = new Date();

let currentMonth =
    new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

let selectedDate = null;


// ============================================================
// НАЗВАНИЯ МЕСЯЦЕВ
// ============================================================

const MONTHS = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь"
];


// ============================================================
// НАЗВАНИЯ ДНЕЙ
// ============================================================

const WEEKDAYS = [
    "Пн",
    "Вт",
    "Ср",
    "Чт",
    "Пт",
    "Сб",
    "Вс"
];


// ============================================================
// ПОЛУЧЕНИЕ КАРАУЛА ПО ДАТЕ
// ============================================================

function getGuardByDate(date) {

    // Убираем время
    const current =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

    const base =
        new Date(
            BASE_DATE.getFullYear(),
            BASE_DATE.getMonth(),
            BASE_DATE.getDate()
        );


    // Разница в миллисекундах

    const difference =
        current.getTime()
        - base.getTime();


    // Переводим в дни

    const days =
        Math.floor(
            difference
            / (
                1000
                * 60
                * 60
                * 24
            )
        );


    // Остаток от деления на 4

    const cycle =
        ((days % 4) + 4) % 4;


    return cycle + 1;
}


// ============================================================
// ФОРМАТ ДАТЫ
// ============================================================

function formatDate(date) {

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}.${month}.${year}`;
}


// ============================================================
// ПРОВЕРКА СЕГОДНЯ
// ============================================================

function isToday(date) {

    const now =
        new Date();

    return (
        date.getFullYear()
        === now.getFullYear()

        &&

        date.getMonth()
        === now.getMonth()

        &&

        date.getDate()
        === now.getDate()
    );
}


// ============================================================
// РЕНДЕР КАЛЕНДАРЯ
// ============================================================

function renderCalendar() {

    calendar.innerHTML = "";


    const year =
        currentMonth.getFullYear();

    const month =
        currentMonth.getMonth();


    // Название месяца

    monthTitle.textContent =
        `${MONTHS[month]} ${year}`;


    // Первый день месяца

    const firstDay =
        new Date(
            year,
            month,
            1
        );


    // Количество дней

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // День недели первого числа
    //
    // JS:
    // 0 = воскресенье
    //
    // Нам нужно:
    // 0 = понедельник

    let startDay =
        firstDay.getDay();

    if (startDay === 0) {
        startDay = 7;
    }

    startDay -= 1;


    // Пустые клетки

    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "day empty-day";

        calendar.appendChild(
            empty
        );
    }


    // Дни

    for (
        let dayNumber = 1;
        dayNumber <= daysInMonth;
        dayNumber++
    ) {

        const date =
            new Date(
                year,
                month,
                dayNumber
            );


        const guardId =
            getGuardByDate(date);


        const day =
            document.createElement(
                "div"
            );


        day.className =
            `day ${GUARDS[guardId].color}`;


        day.textContent =
            dayNumber;


        // Сегодня

        if (isToday(date)) {

            day.classList.add(
                "today"
            );

        }


        // Выбранный день

        if (
            selectedDate
            &&

            date.getFullYear()
            === selectedDate.getFullYear()

            &&

            date.getMonth()
            === selectedDate.getMonth()

            &&

            date.getDate()
            === selectedDate.getDate()
        ) {

            day.classList.add(
                "selected"
            );

        }


        // Нажатие

        day.addEventListener(
            "click",
            () => {

                selectedDate =
                    date;

                updateSelectedInfo();

                renderCalendar();


                if (tg) {

                    tg.HapticFeedback?.selectionChanged();

                }

            }
        );


        calendar.appendChild(
            day
        );
    }
}


// ============================================================
// ИНФОРМАЦИЯ О СЕГОДНЯШНЕЙ СМЕНЕ
// ============================================================

function updateToday() {

    const now =
        new Date();

    const guardId =
        getGuardByDate(now);


    todayDate.textContent =
        formatDate(now);


    todayGuard.textContent =
        GUARDS[guardId].name;


    todayGuard.className =
        `today-guard ${GUARDS[guardId].color}`;


    infoDate.textContent =
        formatDate(now);


    infoGuard.textContent =
        GUARDS[guardId].name;
}


// ============================================================
// ИНФОРМАЦИЯ О ВЫБРАННОМ ДНЕ
// ============================================================

function updateSelectedInfo() {

    if (!selectedDate) {

        updateToday();

        return;
    }


    const guardId =
        getGuardByDate(
            selectedDate
        );


    infoDate.textContent =
        formatDate(
            selectedDate
        );


    infoGuard.textContent =
        GUARDS[guardId].name;
}


// ============================================================
// ПРЕДЫДУЩИЙ МЕСЯЦ
// ============================================================

prevMonth.addEventListener(
    "click",
    () => {

        currentMonth =
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1,
                1
            );


        selectedDate = null;

        renderCalendar();

        updateToday();


        if (tg) {

            tg.HapticFeedback?.impactOccurred(
                "light"
            );

        }

    }
);


// ============================================================
// СЛЕДУЮЩИЙ МЕСЯЦ
// ============================================================

nextMonth.addEventListener(
    "click",
    () => {

        currentMonth =
            new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1,
                1
            );


        selectedDate = null;

        renderCalendar();

        updateToday();


        if (tg) {

            tg.HapticFeedback?.impactOccurred(
                "light"
            );

        }

    }
);


// ============================================================
// ЗАПУСК
// ============================================================

renderCalendar();

updateToday();