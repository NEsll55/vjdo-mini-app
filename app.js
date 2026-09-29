/* ============================================================
   TELEGRAM MINI APP
   ============================================================ */

const tg = window.Telegram.WebApp;


tg.ready();

tg.expand();


/* ============================================================
   НАЗВАНИЯ МЕСЯЦЕВ
   ============================================================ */

const monthNames = [

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


/* ============================================================
   НАЗВАНИЯ КАРАУЛОВ
   ============================================================ */

const guardNames = {

    1: "Караул №1",

    2: "Караул №2",

    3: "Караул №3",

    4: "Караул №4"

};


/* ============================================================
   ГРАФИК
   ============================================================

   27.09.2026 = Караул №3

   Далее:

   28.09.2026 = №4
   29.09.2026 = №1
   30.09.2026 = №2

   01.10.2026 = №3

   и так далее.
   ============================================================ */

const scheduleStart =
    new Date(
        2026,
        8,
        27
    );


const scheduleStartGuard = 3;


/* ============================================================
   ТЕКУЩИЙ ОТКРЫТЫЙ МЕСЯЦ
   ============================================================

   Открываем сразу сентябрь 2026,
   чтобы проверить исходный график.

   Когда приложение будет готово,
   можно заменить на текущий месяц.
   ============================================================ */

let currentDate =
    new Date(
        2026,
        8,
        27
    );


/* ============================================================
   ВЫБРАННАЯ ДАТА
   ============================================================ */

let selectedDate = null;


/* ============================================================
   ПОЛУЧИТЬ КАРАУЛ ПО ДАТЕ
   ============================================================ */

function getGuardForDate(date) {

    const dateOnly =
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );


    const startOnly =
        new Date(
            scheduleStart.getFullYear(),
            scheduleStart.getMonth(),
            scheduleStart.getDate()
        );


    const difference =
        Math.round(
            (
                dateOnly -
                startOnly
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    let guard =
        (
            scheduleStartGuard +
            difference
        ) % 4;


    /*
        JavaScript может получить
        отрицательный остаток.

        Поэтому исправляем.
    */

    if (guard <= 0) {

        guard += 4;

    }


    return guard;

}


/* ============================================================
   ФОРМАТ ДАТЫ
   ============================================================ */

function formatDate(date) {

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const year =
        date.getFullYear();


    return (
        `${day}.${month}.${year}`
    );

}


/* ============================================================
   ПРОВЕРКА СЕГОДНЯШНЕЙ ДАТЫ
   ============================================================ */

function isToday(date) {

    const today =
        new Date();


    return (

        date.getFullYear()
        ===
        today.getFullYear()

        &&

        date.getMonth()
        ===
        today.getMonth()

        &&

        date.getDate()
        ===
        today.getDate()

    );

}


/* ============================================================
   ПОКАЗ ТЕКУЩЕГО КАРАУЛА
   ============================================================ */

function updateMyGuard() {

    /*
        Пока Mini App работает
        независимо от профиля сотрудника.

        В дальнейшем сюда можно
        передавать guard_id из Python.
    */

    const today =
        new Date();


    const guard =
        getGuardForDate(
            today
        );


    const element =
        document.getElementById(
            "myGuard"
        );


    element.textContent =
        guardNames[guard];

}


/* ============================================================
   РИСУЕМ КАЛЕНДАРЬ
   ============================================================ */

function renderCalendar() {

    const calendar =
        document.getElementById(
            "calendar"
        );


    const monthTitle =
        document.getElementById(
            "monthTitle"
        );


    calendar.innerHTML = "";


    const year =
        currentDate.getFullYear();


    const month =
        currentDate.getMonth();


    monthTitle.textContent =
        `${monthNames[month]} ${year}`;


    /* --------------------------------------------------------
       Первый день месяца
       -------------------------------------------------------- */

    const firstDay =
        new Date(
            year,
            month,
            1
        );


    /*
        JS:

        0 = воскресенье
        1 = понедельник
        2 = вторник
        ...

        Нам нужен:

        0 = понедельник
        1 = вторник
        ...
        6 = воскресенье
    */

    let startDay =
        firstDay.getDay() - 1;


    if (startDay < 0) {

        startDay = 6;

    }


    /* --------------------------------------------------------
       Количество дней
       -------------------------------------------------------- */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* --------------------------------------------------------
       Пустые клетки
       -------------------------------------------------------- */

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
            "day empty";


        calendar.appendChild(
            empty
        );

    }


    /* --------------------------------------------------------
       Дни
       -------------------------------------------------------- */

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


        const guard =
            getGuardForDate(
                date
            );


        const day =
            document.createElement(
                "div"
            );


        day.className =
            `day guard${guard}`;


        /* Сегодня */

        if (
            isToday(date)
        ) {

            day.classList.add(
                "today"
            );

        }


        /* Выбранная дата */

        if (
            selectedDate
            &&
            date.getFullYear()
            ===
            selectedDate.getFullYear()
            &&
            date.getMonth()
            ===
            selectedDate.getMonth()
            &&
            date.getDate()
            ===
            selectedDate.getDate()
        ) {

            day.classList.add(
                "selected"
            );

        }


        day.textContent =
            dayNumber;


        day.title =
            `${formatDate(date)} — ${guardNames[guard]}`;


        /* ----------------------------------------------------
           Нажатие на день
           ---------------------------------------------------- */

        day.addEventListener(
            "click",
            function () {

                selectedDate =
                    date;


                showSelectedDay(
                    date,
                    guard
                );


                renderCalendar();

            }
        );


        calendar.appendChild(
            day
        );

    }

}


/* ============================================================
   ПОКАЗ ВЫБРАННОГО ДНЯ
   ============================================================ */

function showSelectedDay(
    date,
    guard
) {

    const element =
        document.getElementById(
            "selectedDay"
        );


    element.classList.remove(
        "hidden"
    );


    element.innerHTML =
        `
        📅 ${formatDate(date)}
        <br>
        🛡 ${guardNames[guard]}
        `;

}


/* ============================================================
   ПРЕДЫДУЩИЙ МЕСЯЦ
   ============================================================ */

document
    .getElementById(
        "prevMonth"
    )
    .addEventListener(
        "click",
        function () {

            currentDate.setMonth(
                currentDate.getMonth() - 1
            );


            selectedDate =
                null;


            document
                .getElementById(
                    "selectedDay"
                )
                .classList.add(
                    "hidden"
                );


            renderCalendar();

        }
    );


/* ============================================================
   СЛЕДУЮЩИЙ МЕСЯЦ
   ============================================================ */

document
    .getElementById(
        "nextMonth"
    )
    .addEventListener(
        "click",
        function () {

            currentDate.setMonth(
                currentDate.getMonth() + 1
            );


            selectedDate =
                null;


            document
                .getElementById(
                    "selectedDay"
                )
                .classList.add(
                    "hidden"
                );


            renderCalendar();

        }
    );


/* ============================================================
   ЗАПУСК
   ============================================================ */

updateMyGuard();

renderCalendar();