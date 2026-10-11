const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}

// ============================================================
// НАСТРОЙКИ КАРАУЛОВ
// ============================================================

const GUARDS = {
    1: { name: "Караул №1", color: "guard-1" },
    2: { name: "Караул №2", color: "guard-2" },
    3: { name: "Караул №3", color: "guard-3" },
    4: { name: "Караул №4", color: "guard-4" }
};

// ============================================================
// БАЗОВАЯ ДАТА
// 27.09.2026 = Караул №3
// ============================================================

const BASE_DATE = new Date(2026, 8, 27);
const BASE_GUARD = 3;

// ============================================================
// ЭЛЕМЕНТЫ
// ============================================================

const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const todayDate = document.getElementById("todayDate");
const todayGuard = document.getElementById("todayGuard");
const infoDate = document.getElementById("infoDate");
const infoGuard = document.getElementById("infoGuard");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

// ============================================================
// СОСТОЯНИЕ
// ============================================================

const now = new Date();

let currentMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
);

let selectedDate = null;

// ============================================================
// НАЗВАНИЯ
// ============================================================

const MONTHS = [
    "Январь", "Февраль", "Март", "Апрель",
    "Май", "Июнь", "Июль", "Август",
    "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const WEEKDAYS = [
    "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"
];

// ============================================================
// ПОЛУЧЕНИЕ КАРАУЛА ПО ДАТЕ
// ============================================================

function getGuardByDate(date) {
    // Считаем календарные дни, не учитывая время суток.
    const currentUtc = Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const baseUtc = Date.UTC(
        BASE_DATE.getFullYear(),
        BASE_DATE.getMonth(),
        BASE_DATE.getDate()
    );

    const days = Math.round(
        (currentUtc - baseUtc) / 86400000
    );

    const cycle = ((days % 4) + 4) % 4;

    return ((BASE_GUARD - 1 + cycle) % 4) + 1;
}

// ============================================================
// ФОРМАТ ДАТЫ
// ============================================================

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${day}.${month}.${date.getFullYear()}`;
}

// ============================================================
// ПРОВЕРКА СЕГОДНЯШНЕЙ ДАТЫ
// ============================================================

function isToday(date) {
    const current = new Date();

    return (
        date.getFullYear() === current.getFullYear() &&
        date.getMonth() === current.getMonth() &&
        date.getDate() === current.getDate()
    );
}

// ============================================================
// РЕНДЕР КАЛЕНДАРЯ
// ============================================================

function renderCalendar() {
    calendar.innerHTML = "";

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    monthTitle.textContent = `${MONTHS[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Понедельник = 0, воскресенье = 6.
    const startDay = (firstDay.getDay() + 6) % 7;

    // Пустые клетки перед первым числом.
    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement("div");
        empty.className = "day empty-day";
        calendar.appendChild(empty);
    }

    // Дни месяца.
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
        const date = new Date(year, month, dayNumber);
        const guardId = getGuardByDate(date);

        const day = document.createElement("div");

        day.className = `day ${GUARDS[guardId].color}`;
        day.textContent = dayNumber;

        if (isToday(date)) {
            day.classList.add("today");
        }

        if (
            selectedDate &&
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
        ) {
            day.classList.add("selected");
        }

        day.setAttribute(
            "aria-label",
            `${formatDate(date)}, ${GUARDS[guardId].name}`
        );

        day.addEventListener("click", () => {
            selectedDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );

            updateSelectedInfo();
            renderCalendar();

            if (tg) {
                tg.HapticFeedback?.selectionChanged();
            }
        });

        calendar.appendChild(day);
    }
}

// ============================================================
// ИНФОРМАЦИЯ О СЕГОДНЯШНЕЙ СМЕНЕ
// ============================================================

function updateToday() {
    const current = new Date();
    const guardId = getGuardByDate(current);

    todayDate.textContent = formatDate(current);
    todayGuard.textContent = GUARDS[guardId].name;
    todayGuard.className = `today-guard ${GUARDS[guardId].color}`;

    infoDate.textContent = formatDate(current);
    infoGuard.textContent = GUARDS[guardId].name;
}

// ============================================================
// ИНФОРМАЦИЯ О ВЫБРАННОМ ДНЕ
// ============================================================

function updateSelectedInfo() {
    if (!selectedDate) {
        updateToday();
        return;
    }

    const guardId = getGuardByDate(selectedDate);

    infoDate.textContent = formatDate(selectedDate);
    infoGuard.textContent = GUARDS[guardId].name;
}

// ============================================================
// ПРЕДЫДУЩИЙ МЕСЯЦ
// ============================================================

prevMonth.addEventListener("click", () => {
    currentMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
    );

    selectedDate = null;

    renderCalendar();
    updateToday();

    if (tg) {
        tg.HapticFeedback?.impactOccurred("light");
    }
});

// ============================================================
// СЛЕДУЮЩИЙ МЕСЯЦ
// ============================================================

nextMonth.addEventListener("click", () => {
    currentMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
    );

    selectedDate = null;

    renderCalendar();
    updateToday();

    if (tg) {
        tg.HapticFeedback?.impactOccurred("light");
    }
});

// ============================================================
// ЗАПУСК
// ============================================================

renderCalendar();
updateToday();
```
