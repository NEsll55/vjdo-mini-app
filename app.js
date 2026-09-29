// ============================================================
// TELEGRAM MINI APP
// ============================================================

const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}


// ============================================================
// ЭЛЕМЕНТЫ
// ============================================================

const hasSeals = document.getElementById("has_seals");
const sealsBlock = document.getElementById("seals_block");
const sealsCount = document.getElementById("seals_count");
const sealsContainer = document.getElementById("seals_container");

const hasDamage = document.getElementById("has_damage");
const damageBlock = document.getElementById("damage_block");

const photosInput = document.getElementById("photos");
const photoPreview = document.getElementById("photo_preview");

const saveButton = document.getElementById("save_button");
const statusBlock = document.getElementById("status");


// ============================================================
// ПЛОМБЫ
// ============================================================

hasSeals.addEventListener("change", () => {

    if (hasSeals.checked) {

        sealsBlock.classList.remove("hidden");

        createSealInputs();

    } else {

        sealsBlock.classList.add("hidden");

        sealsContainer.innerHTML = "";

    }

});


sealsCount.addEventListener("input", () => {

    createSealInputs();

});


function createSealInputs() {

    if (!hasSeals.checked) {
        return;
    }

    let count = parseInt(
        sealsCount.value
    );

    if (isNaN(count)) {
        count = 0;
    }

    count = Math.max(
        0,
        Math.min(count, 100)
    );

    sealsContainer.innerHTML = "";

    for (let i = 1; i <= count; i++) {

        const wrapper =
            document.createElement("div");

        wrapper.className = "seal-row";

        wrapper.innerHTML = `
            <label>
                🔒 Номер пломбы №${i}
                <input
                    type="text"
                    class="seal-number"
                    placeholder="Введите номер пломбы"
                >
            </label>
        `;

        sealsContainer.appendChild(
            wrapper
        );
    }
}


// ============================================================
// ПОВРЕЖДЕНИЯ
// ============================================================

hasDamage.addEventListener("change", () => {

    if (hasDamage.checked) {

        damageBlock.classList.remove(
            "hidden"
        );

    } else {

        damageBlock.classList.add(
            "hidden"
        );

        document.getElementById(
            "damage_description"
        ).value = "";

    }

});


// ============================================================
// ПРЕДПРОСМОТР ФОТО
// ============================================================

photosInput.addEventListener(
    "change",
    () => {

        photoPreview.innerHTML = "";

        const files =
            Array.from(
                photosInput.files
            );

        files.forEach(file => {

            const reader =
                new FileReader();

            reader.onload = event => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "photo-item";

                item.innerHTML = `
                    <img
                        src="${event.target.result}"
                        alt="Фото"
                    >
                `;

                photoPreview.appendChild(
                    item
                );

            };

            reader.readAsDataURL(file);

        });

    }
);


// ============================================================
// ПОЛУЧЕНИЕ ДАННЫХ
// ============================================================

function getFormData() {

    const sealNumbers = [];

    document
        .querySelectorAll(".seal-number")
        .forEach(input => {

            const value =
                input.value.trim();

            if (value) {

                sealNumbers.push(value);

            }

        });


    return {

        arrival_time:
            document.getElementById(
                "arrival_time"
            ).value,

        track_number:
            document.getElementById(
                "track_number"
            ).value.trim(),

        train_number:
            document.getElementById(
                "train_number"
            ).value.trim(),

        wagon_number:
            document.getElementById(
                "wagon_number"
            ).value.trim(),

        cargo:
            document.getElementById(
                "cargo"
            ).value.trim(),

        has_seals:
            hasSeals.checked,

        seals_count:
            hasSeals.checked
                ? parseInt(
                    sealsCount.value
                ) || 0
                : 0,

        seal_numbers:
            sealNumbers,

        twists_count:
            parseInt(
                document.getElementById(
                    "twists_count"
                ).value
            ) || 0,

        has_damage:
            hasDamage.checked,

        damage_description:
            hasDamage.checked
                ? document.getElementById(
                    "damage_description"
                ).value.trim()
                : "",

        departure_time:
            document.getElementById(
                "departure_time"
            ).value
    };
}


// ============================================================
// ПРОВЕРКА
// ============================================================

function validateForm(data) {

    if (!data.arrival_time) {

        return "Укажите время прибытия.";

    }

    if (!data.track_number) {

        return "Укажите номер пути.";

    }

    if (!data.train_number) {

        return "Укажите номер поезда.";

    }

    if (!data.wagon_number) {

        return "Укажите номер вагона.";

    }

    if (data.has_seals) {

        if (data.seals_count <= 0) {

            return "Укажите количество пломб.";

        }

        if (
            data.seal_numbers.length
            !== data.seals_count
        ) {

            return (
                "Введите номер каждой пломбы."
            );

        }

    }

    if (data.has_damage) {

        if (!data.damage_description) {

            return (
                "Опишите повреждение вагона."
            );

        }

    }

    if (!data.departure_time) {

        return (
            "Укажите время отправления."
        );

    }

    return null;
}


// ============================================================
// СОХРАНЕНИЕ
// ============================================================

saveButton.addEventListener(
    "click",
    async () => {

        statusBlock.textContent = "";
        statusBlock.className = "status";

        const data = getFormData();

        const error =
            validateForm(data);

        if (error) {

            statusBlock.textContent =
                "❌ " + error;

            statusBlock.classList.add(
                "error"
            );

            return;
        }


        saveButton.disabled = true;

        saveButton.textContent =
            "⏳ Сохраняем...";


        try {

            const response =
                await fetch(
                    "/api/wagon-check",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(data)
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.detail
                    || "Ошибка сервера"
                );

            }


            statusBlock.textContent =
                "✅ Проверка сохранена!";

            statusBlock.classList.add(
                "success"
            );


            if (tg) {

                tg.HapticFeedback?.notificationOccurred(
                    "success"
                );

            }


            // Очищаем форму
            resetForm();


        } catch (error) {

            console.error(error);

            statusBlock.textContent =
                "❌ " + error.message;

            statusBlock.classList.add(
                "error"
            );


            if (tg) {

                tg.HapticFeedback?.notificationOccurred(
                    "error"
                );

            }

        } finally {

            saveButton.disabled = false;

            saveButton.textContent =
                "✅ Сохранить проверку";

        }

    }
);


// ============================================================
// ОЧИСТКА ФОРМЫ
// ============================================================

function resetForm() {

    document
        .getElementById(
            "arrival_time"
        ).value = "";

    document
        .getElementById(
            "track_number"
        ).value = "";

    document
        .getElementById(
            "train_number"
        ).value = "";

    document
        .getElementById(
            "wagon_number"
        ).value = "";

    document
        .getElementById(
            "cargo"
        ).value = "";

    hasSeals.checked = false;

    sealsBlock.classList.add(
        "hidden"
    );

    sealsCount.value = 0;

    sealsContainer.innerHTML = "";

    document
        .getElementById(
            "twists_count"
        ).value = 0;

    hasDamage.checked = false;

    damageBlock.classList.add(
        "hidden"
    );

    document
        .getElementById(
            "damage_description"
        ).value = "";

    document
        .getElementById(
            "departure_time"
        ).value = "";

    photosInput.value = "";

    photoPreview.innerHTML = "";

}