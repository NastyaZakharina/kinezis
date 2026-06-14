"""
Telegram-бот для Кінезіс (@Kineziss_bot)
"""

import telebot
from telebot import types
import datetime
import json
import os

BOT_TOKEN = "8873990753:AAHmzAkTR64xftJytnWqaMf-H7PqVEKC6tc"

# Файл для збереження ID менеджерів
MANAGERS_FILE = os.path.join(os.path.dirname(__file__), 'managers.json')

def load_managers():
    if os.path.exists(MANAGERS_FILE):
        with open(MANAGERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_managers(ids):
    with open(MANAGERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(ids, f)

# Команда для реєстрації менеджера: /addmanager
ADMIN_PASSWORD = "kinezis2024"  # змініть на свій пароль

bot = telebot.TeleBot(BOT_TOKEN)
user_states = {}

PRODUCTS = {
    'mtb1': 'Тренажер МТБ-1 (домашній) — 8 500 грн',
    'mtb2': 'Тренажер МТБ-2 (розширений) — 12 900 грн',
    'mtb4': 'Тренажер МТБ-4 (професійний) — 28 500 грн',
    'mtb601': 'Тренажер МТБ-601 — 18 700 грн',
    'mtb801': 'Тренажер МТБ-801 (посилений) — 34 900 грн',
    'mtb-child': 'Тренажер МТБ дитячий — 9 800 грн',
    'bench1': 'Лавка реабілітаційна складна — 5 400 грн',
    'hyperext1': 'Гіперекстензія домашня SW-301 — 4 200 грн',
    'bench-roman': 'Римський стілець реабілітаційний — 3 800 грн',
    'massage1': 'Масажний стіл складний (алюміній) — 7 200 грн',
    'massage2': 'Масажний стіл стаціонарний — 11 500 грн',
    'massage-chair': 'Масажне крісло терапевтичне — 4 900 грн',
    'bars1': 'Паралельні бруси реабілітаційні — 15 800 грн',
    'stairs1': 'Реабілітаційні сходи (3 сходинки) — 9 200 грн',
    'acc-handles': 'Набір ручок для МТБ (6 шт.) — 1 200 грн',
    'acc-carabiner': 'Карабін для МТБ (4 шт.) — 480 грн',
    'acc-blocks': 'Набір обтяжувачів для МТБ — 890 грн',
    'acc-mat': 'Килимок реабілітаційний — 650 грн',
    'balance': 'Балансувальна дошка — 1 800 грн',
    'stepper': 'Степ-платформа реабілітаційна — 2 200 грн',
    'walker': 'Ходунки реабілітаційні — 1 450 грн',
    'contact': 'Консультація (заявка з форми)',
}


def get_main_keyboard():
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True)
    kb.add(types.KeyboardButton('🛒 Каталог товарів'))
    kb.add(types.KeyboardButton('📞 Контакти'), types.KeyboardButton('❓ Допомога'))
    return kb


def notify_managers(order: dict):
    managers = load_managers()
    if not managers:
        print("⚠️  Немає зареєстрованих менеджерів! Виконайте /addmanager у боті.")
        return
    now = datetime.datetime.now().strftime('%d.%m.%Y %H:%M')
    text = (
        f"🛒 <b>НОВЕ ЗАМОВЛЕННЯ!</b>\n\n"
        f"📦 {order.get('product', '—')}\n"
        f"👤 {order.get('name', '—')}\n"
        f"📞 {order.get('phone', '—')}\n"
        f"💬 {order.get('comment') or 'немає коментаря'}\n"
        f"🕐 {now}"
    )
    if order.get('username'):
        text += f"\n🔗 @{order['username']}"
    for cid in managers:
        try:
            markup = types.InlineKeyboardMarkup()
            if order.get('user_id'):
                markup.add(types.InlineKeyboardButton(
                    '💬 Написати покупцю', url=f"tg://user?id={order['user_id']}"
                ))
            bot.send_message(cid, text, parse_mode='HTML', reply_markup=markup)
        except Exception as e:
            print(f"Помилка надсилання менеджеру {cid}: {e}")


# ─── /addmanager — реєстрація менеджера ───
@bot.message_handler(commands=['addmanager'])
def cmd_addmanager(message):
    parts = message.text.split()
    if len(parts) == 2 and parts[1] == ADMIN_PASSWORD:
        managers = load_managers()
        uid = message.from_user.id
        name = message.from_user.first_name or ''
        if uid not in managers:
            managers.append(uid)
            save_managers(managers)
            bot.reply_to(message,
                f"✅ {name}, вас додано як менеджера!\n"
                f"Ваш ID: <code>{uid}</code>\n"
                "Тепер ви отримуватимете сповіщення про замовлення.",
                parse_mode='HTML')
        else:
            bot.reply_to(message, f"Ви вже зареєстровані як менеджер (ID: {uid}).")
    else:
        bot.reply_to(message, "Неправильний пароль. Використання: /addmanager ПАРОЛЬ")


@bot.message_handler(commands=['managers'])
def cmd_managers(message):
    managers = load_managers()
    if managers:
        bot.reply_to(message, f"Зареєстровані менеджери: {managers}")
    else:
        bot.reply_to(message, "Менеджерів ще немає. Використайте /addmanager ПАРОЛЬ")


# ─── /start ───
@bot.message_handler(commands=['start'])
def cmd_start(message):
    uid = message.from_user.id
    args = message.text.split()
    pid = args[1] if len(args) > 1 else None
    product = PRODUCTS.get(pid)

    if product and pid != 'contact':
        user_states[uid] = {'step': 'ask_name', 'product': product, 'pid': pid}
        bot.send_message(
            message.chat.id,
            f"👋 Вітаємо в <b>Кінезіс</b>!\n\n"
            f"Ви хочете замовити:\n📦 <b>{product}</b>\n\n"
            "Введіть ваше <b>ім'я</b>:",
            parse_mode='HTML'
        )
    else:
        user_states[uid] = {'step': 'main'}
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton('🛒 Відкрити каталог', url='https://nastyazakharina.github.io/kinezis/catalog.html'))
        markup.add(
            types.InlineKeyboardButton('📞 Вікторія', url='tel:+380936246000'),
            types.InlineKeyboardButton('📞 Андрій', url='tel:+380992662688')
        )
        bot.send_message(
            message.chat.id,
            "👋 Вітаємо в офіційному боті <b>Кінезіс</b>!\n\n"
            "🏥 Ми виробляємо реабілітаційне обладнання в Україні:\n"
            "• Тренажери МТБ (система Бубновського)\n"
            "• Масажні столи та стільці\n"
            "• Реабілітаційні лавки та гіперекстензії\n"
            "• Паралельні бруси та сходи\n\n"
            "Оберіть дію:",
            parse_mode='HTML',
            reply_markup=markup
        )


# ─── Кроки замовлення ───
@bot.message_handler(func=lambda m: user_states.get(m.from_user.id, {}).get('step') == 'ask_name')
def step_name(message):
    uid = message.from_user.id
    user_states[uid]['name'] = message.text.strip()
    user_states[uid]['step'] = 'ask_phone'
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    kb.add(types.KeyboardButton('📱 Поділитися номером', request_contact=True))
    bot.send_message(
        message.chat.id,
        f"Дякуємо, <b>{message.text.strip()}</b>! 👍\n\n"
        "Введіть ваш <b>номер телефону</b> або натисніть кнопку:",
        parse_mode='HTML', reply_markup=kb
    )


@bot.message_handler(content_types=['contact'],
                     func=lambda m: user_states.get(m.from_user.id, {}).get('step') == 'ask_phone')
def step_contact(message):
    uid = message.from_user.id
    user_states[uid]['phone'] = message.contact.phone_number
    user_states[uid]['step'] = 'ask_comment'
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    kb.add(types.KeyboardButton('Пропустити'))
    bot.send_message(message.chat.id,
        "Є питання або побажання? Напишіть або натисніть <b>Пропустити</b>:",
        parse_mode='HTML', reply_markup=kb)


@bot.message_handler(func=lambda m: user_states.get(m.from_user.id, {}).get('step') == 'ask_phone')
def step_phone(message):
    uid = message.from_user.id
    user_states[uid]['phone'] = message.text.strip()
    user_states[uid]['step'] = 'ask_comment'
    kb = types.ReplyKeyboardMarkup(resize_keyboard=True, one_time_keyboard=True)
    kb.add(types.KeyboardButton('Пропустити'))
    bot.send_message(message.chat.id,
        "Є питання або побажання? Напишіть або натисніть <b>Пропустити</b>:",
        parse_mode='HTML', reply_markup=kb)


@bot.message_handler(func=lambda m: user_states.get(m.from_user.id, {}).get('step') == 'ask_comment')
def step_comment(message):
    uid = message.from_user.id
    state = user_states[uid]
    state['comment'] = '' if message.text == 'Пропустити' else message.text.strip()
    state['username'] = message.from_user.username or ''
    state['user_id'] = uid
    state['step'] = 'done'

    notify_managers(state)

    bot.send_message(
        message.chat.id,
        "✅ <b>Замовлення прийнято!</b>\n\n"
        f"📦 {state.get('product', '—')}\n\n"
        "Наш менеджер зв'яжеться з вами найближчим часом.\n\n"
        "📞 Вікторія: +38 (093) 624-60-00\n"
        "📞 Андрій: +38 (099) 266-26-88\n\n"
        "Дякуємо, що обрали <b>Кінезіс</b>! 💚",
        parse_mode='HTML', reply_markup=get_main_keyboard()
    )
    user_states[uid] = {'step': 'main'}


# ─── Загальні повідомлення ───
@bot.message_handler(func=lambda m: True)
def handle_text(message):
    t = message.text.lower() if message.text else ''
    if 'каталог' in t:
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton('🌐 Відкрити каталог', url='https://nastyazakharina.github.io/kinezis/catalog.html'))
        bot.send_message(message.chat.id, "Переглядайте наш каталог:", reply_markup=markup)
    elif 'контакт' in t or 'телефон' in t:
        bot.send_message(message.chat.id,
            "📞 <b>Контакти Кінезіс:</b>\n\n"
            "👩 Вікторія: +38 (093) 624-60-00\n"
            "👨 Андрій: +38 (099) 266-26-88\n"
            "📧 sport_ok@ukr.net",
            parse_mode='HTML')
    elif 'допомог' in t or '❓' in t:
        bot.send_message(message.chat.id,
            "ℹ️ <b>Як замовити:</b>\n\n"
            "1️⃣ Зайдіть на kinezis.com.ua\n"
            "2️⃣ Оберіть товар → «Замовити»\n"
            "3️⃣ Введіть ім'я та телефон тут\n"
            "4️⃣ Менеджер підтвердить замовлення\n\n"
            "📦 Доставка: Нова Пошта або Укрпошта",
            parse_mode='HTML', reply_markup=get_main_keyboard())
    else:
        markup = types.InlineKeyboardMarkup()
        markup.add(types.InlineKeyboardButton('🛒 Переглянути каталог', url='https://nastyazakharina.github.io/kinezis/catalog.html'))
        bot.send_message(message.chat.id,
            "Вітаємо! Я бот Кінезіс 🤖\nПереглядайте каталог і замовляйте прямо тут.",
            reply_markup=markup)


if __name__ == '__main__':
    print("✅ Бот @Kineziss_bot запущено!")
    print(f"📋 Менеджери: {load_managers() or 'ще немає — виконайте /addmanager kinezis2024'}")
    bot.infinity_polling(timeout=10, long_polling_timeout=5)

