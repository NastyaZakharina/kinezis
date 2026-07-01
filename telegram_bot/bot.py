#!/usr/bin/env python3
import os, json, csv, logging, threading
from datetime import datetime, timedelta
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer
from telegram import (Update, ReplyKeyboardMarkup, InlineKeyboardMarkup,
                      InlineKeyboardButton, KeyboardButton)
from telegram.ext import (Application, CommandHandler, CallbackQueryHandler,
                          MessageHandler, ConversationHandler, filters, ContextTypes)

logging.basicConfig(format='%(asctime)s %(levelname)s %(message)s', level=logging.INFO)

TOKEN = os.environ.get('BOT_TOKEN')
PASS  = os.environ.get('MGR_PASS', 'kinezis2024')
SITE  = 'https://kinezis.com.ua'
if not TOKEN:
    raise ValueError("BOT_TOKEN environment variable is not set")

DATA_DIR    = Path('data')
DATA_DIR.mkdir(exist_ok=True)
MGR_FILE      = DATA_DIR / 'managers.json'
ORDERS_FILE   = DATA_DIR / 'orders.csv'
MAP_FILE      = DATA_DIR / 'user_map.json'
CONTACTS_FILE = DATA_DIR / 'contacts.csv'

ASK_NAME, ASK_PHONE, ASK_COMMENT = range(3)

PRODUCTS = {
    'mtb1': 'Тренажер МТБ-1 зі шведською стінкою',
    'mtv1-40': 'Тренажер МТВ-1 (профіль 40×40)',
    'mtv1-reg': 'Тренажер МТВ-1 з регульованим блоком',
    'mtb1-prof': 'Тренажер МТБ-1 Проф з регульованим блоком',
    'mtb1-shvedska': 'Тренажер Бубновського зі шведською стінкою',
    'mtb2': 'Тренажер МТБ-2 (профіль 60×60)',
    'mtb2-40': 'Тренажер МТБ-2 (профіль 40×40)',
    'mtv2-reg': 'Тренажер МТВ-2 з регульованим блоком',
    'mtb4': 'Тренажер МТБ-4 (профіль 60×60)',
    'mtb4-reg': 'Тренажер МТБ-4 з регульованим блоком',
    'mtv070': 'Універсальна кабіна МТВ-070',
    'bench1': 'Лавка реабілітаційна складна MTB-31',
    'bench-mtb30': 'Лавка реабілітаційна пряма MTB-30',
    'bench-vitjag': 'Лавка для витягування хребта MTB-009',
    'hyperext1': 'Гіперекстензія домашня SW-301',
    'bench-sw300': 'Лавка для преса SW-300',
    'bench-sw303': 'Лавка атлетична SW-303',
    'bench-sw308': 'Лавка профі SW-308',
    'bench-roman': 'Римський стілець SVS-112',
    'bench-svs113': 'Римський стілець регульований SVS-113',
    'bench-svs119': 'Гіперекстензія горизонтальна SVS-119',
    'bench-svs127': 'Гіперекстензія зворотна SVS-127',
    'bench-svs108': 'Гіперекстензія регульована SVS-108',
    'bench-svs145': 'Лавка регульована SVS-145',
    'massage1': 'Масажний стіл складний MTB-051',
    'massage2': 'Масажний стіл стаціонарний MTB-050',
    'massage-chair': 'Масажний стілець MTB-052',
    'bars1': 'Паралельні бруси MTB-016',
    'bars-mtb018': 'Бруси з перешкодами MTB-018',
    'bars-mtb019': 'Бруси дитячі MTB-019',
    'bars-mtb020': 'Бруси з перешкодами MTB-020',
    'stairs1': 'Реабілітаційні сходи MTB-029',
    'stairs-mtb028': 'Сходи з рампою MTB-028',
    'stairs-mtb033': 'Сходи кутові MTB-033',
    'acc-handles': 'Ручка для тяги 46 см MTB-21',
    'acc-carabiner': 'Ланцюг-подовжувач MTB-16',
    'mtb10': "Манжети м'які MTB-10",
    'mtb11': 'Манжети дитячі MTB-11',
    'mtb12': 'Манжети жорсткі MTB-12',
    'mtb13': 'Сандал реабілітаційний MTB-13',
    'mtb14': 'Сандал дитячий MTB-14',
    'mtb15': "Петля м'яка MTB-15",
    'mtb17': 'Ручка закрита MTB-17',
    'mtb18': "Ручка закрита м'яка MTB-18",
    'mtb19': 'Ручка для тяги 120 см MTB-19',
    'mtb20': 'Ручка (внутрішній хват) MTB-20',
    'mtb26': 'Ручка на трицепс MTB-26',
    'mtb27': "Подовжувач м'який MTB-27",
}

PROGRAMS = {
    'mtb': (
        "🏋️ *Базова програма вправ на тренажері МТБ*\n\n"
        "Виконуйте вранці або вдень, 3–4 рази на тиждень.\n"
        "Починайте з мінімального опору — 5–10 кг.\n\n"
        "*1. Тяга верхнього блоку до грудей* (широчайші м'язи спини)\n"
        "Сядьте або стоячи, тягніть до грудей. 3 сети × 15 повторень\n\n"
        "*2. Тяга нижнього блоку лежачи на спині* (хребет, поперек)\n"
        "Ляжте на підлогу ногами до тренажера, тягніть до живота. 3 × 15\n\n"
        "*3. Жим ногами лежачи* (стегна, сідниці, коліна)\n"
        "Ляжте на спину, упирайтесь ногами у рукоятку. 3 × 20\n\n"
        "*4. Розведення рук стоячи* (плечі, грудь)\n"
        "Стоячи між блоками, розводьте руки в сторони. 3 × 12\n\n"
        "*5. Розтяжка* — після кожного заняття 5–10 хвилин\n\n"
        "❗ *Важливо:* рухи повільні, без ривків. Дихання не затримувати.\n\n"
        "Питання — пишіть сюди, підкажемо! 📞 +38 099 266-26-88"
    ),
    'bench': (
        "🛋️ *Базова програма вправ на реабілітаційній лавці*\n\n"
        "3–4 рази на тиждень, починайте з легкого навантаження.\n\n"
        "*1. Гіперекстензія* (зміцнення м'язів спини)\n"
        "Лягайте животом, піднімайте корпус до прямої лінії. 3 × 15\n\n"
        "*2. Підйом ніг лежачи на спині* (прес, поперек)\n"
        "Пряма спина, ноги піднімайте на 45°. 3 × 15\n\n"
        "*3. Планка* (кор, стабілізація хребта)\n"
        "30–60 секунд × 3 підходи\n\n"
        "*4. Скручування* (прес)\n"
        "На лавці, кут 30°. 3 × 20\n\n"
        "*5. Розтяжка хребта* — «кішка-корова» на підлозі після кожного заняття\n\n"
        "❗ *При болях у спині:* виключіть вправи 2 і 4 до консультації з лікарем.\n\n"
        "Питання — пишіть! 📞 +38 099 266-26-88"
    ),
    'massage': (
        "🛏️ *Рекомендації з використання масажного столу*\n\n"
        "Масажний стіл — це робочий інструмент терапевта. Але є вправи які можна виконувати самостійно:\n\n"
        "*1. Релаксація на животі* (розвантаження хребта)\n"
        "5–10 хвилин лежачи на животі без подушки — знімає навантаження з поперека.\n\n"
        "*2. Розтяжка грудного відділу*\n"
        "Ляжте на живіт, руки вперед, піднімайте плечі. 10–15 разів.\n\n"
        "*3. Масаж спини партнером або масажистом* — 2 рази на тиждень\n\n"
        "Рекомендуємо поєднувати зі статтями нашого блогу:\n"
        "kinezis.com.ua/blog.html\n\n"
        "Питання — пишіть! 📞 +38 099 266-26-88"
    ),
    'bars': (
        "🦯 *Базова програма вправ на паралельних брусах і сходах*\n\n"
        "Ідеально для відновлення після операцій, інсульту, травм ніг.\n"
        "Починайте під наглядом або притримуючись за опору.\n\n"
        "*1. Ходьба між брусами* (відновлення ходи)\n"
        "Починайте з 5 хвилин, 2 рази на день. Поступово збільшуйте.\n\n"
        "*2. Перенесення ваги з ноги на ногу* (рівновага)\n"
        "Стоячи між брусами, 3 × 20 разів\n\n"
        "*3. Підйом на носки* (литкові м'язи)\n"
        "Тримаючись за бруси. 3 × 20\n\n"
        "*4. Напівприсідання* (колінні, стегнові суглоби)\n"
        "До кута 90°. 3 × 10–15\n\n"
        "*5. Підйом по сходах* (якщо є сходи)\n"
        "Починайте з 1 сходинки туди-назад, поступово додавайте\n\n"
        "❗ Не поспішайте. Якість важливіша за кількість.\n\n"
        "Питання — пишіть! 📞 +38 099 266-26-88"
    ),
}

def get_program(product_id):
    """Return exercise program text for a given product_id."""
    pid = product_id.lower()
    if any(pid.startswith(k) for k in ('mtb', 'mtv')):
        return PROGRAMS['mtb']
    if pid.startswith('bench') or 'hyperext' in pid or 'roman' in pid or pid.startswith('svs'):
        return PROGRAMS['bench']
    if pid.startswith('massage'):
        return PROGRAMS['massage']
    if pid.startswith('bars') or pid.startswith('stairs'):
        return PROGRAMS['bars']
    return None

FAQ = {
    'Як зробити замовлення': 'Оберіть товар у каталозі на сайті та натисніть Замовити. Бот проведе через оформлення, менеджер зателефонує для підтвердження.',
    'Яка доставка': 'Доставка по всій Україні Новою Поштою або Укрпоштою. Термін: 2–5 робочих днів. Вартість за тарифами перевізника.',
    'Яка гарантія': 'Гарантія 12 місяців на все обладнання. Запасні частини доступні протягом 5 років.',
    'Чи можна повернути товар': 'Так, протягом 14 днів з моменту отримання, якщо товар не використовувався та збережена упаковка.',
    'Як вибрати тренажер МТБ': 'МТБ-1 — для дому (1 блок), МТБ-2 — розширений (2 блоки), МТБ-4 — для клінік (4 блоки). Не впевнені? Напишіть — підберемо разом!',
    'Де ви знаходитесь': 'м. Чернігів, але працюємо по всій Україні. Самовивіз — за домовленістю.',
    'Як оплатити': 'Накладений платіж (після отримання) або передоплата на картку ПриватБанку / Монобанку. Безготівкова оплата для юридичних осіб.',
    'Контакти': '📞 Андрій: +38 099 266-26-88\n📧 sport_ok@ukr.net\n🕐 Пн–Пт: 9:00–18:00, Сб: 10:00–15:00',
}

MAIN_KB = ReplyKeyboardMarkup([
    ['Каталог товарів', 'Часті питання'],
    ['Доставка та оплата', 'Гарантія'],
    ['Контакти', 'Зробити замовлення'],
], resize_keyboard=True)

FAQ_KB = ReplyKeyboardMarkup([
    ['Як зробити замовлення', 'Яка доставка'],
    ['Яка гарантія', 'Чи можна повернути товар'],
    ['Як вибрати тренажер МТБ', 'Як оплатити'],
    ['Де ви знаходитесь', 'Назад'],
], resize_keyboard=True)

# ── Helpers ───────────────────────────────────────────────────────────────────

def load_managers():
    ids = set()
    for mid in os.environ.get('MANAGER_IDS', '').split(','):
        try: ids.add(int(mid.strip()))
        except: pass
    if MGR_FILE.exists():
        try: ids.update(json.loads(MGR_FILE.read_text('utf-8')))
        except: pass
    return list(ids)

def save_managers(ids):
    MGR_FILE.write_text(json.dumps(list(set(ids))), encoding='utf-8')

def load_map():
    if MAP_FILE.exists():
        try: return json.loads(MAP_FILE.read_text('utf-8'))
        except: pass
    return {}

def save_map(m):
    MAP_FILE.write_text(json.dumps(m), encoding='utf-8')

def save_order(product, name, phone, comment, uid, uname):
    write_header = not ORDERS_FILE.exists()
    with open(ORDERS_FILE, 'a', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        if write_header:
            w.writerow(['Дата', 'Товар', "Ім'я", 'Телефон', 'Telegram_ID', 'Username', 'Коментар'])
        w.writerow([datetime.now().strftime('%d.%m.%Y %H:%M'),
                    product, name, phone, uid,
                    f'@{uname}' if uname else '', comment])

def save_contact(uid, uname, first_name):
    existing = set()
    if CONTACTS_FILE.exists():
        with open(CONTACTS_FILE, newline='', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                existing.add(row.get('Telegram_ID', ''))
    if str(uid) in existing:
        return
    write_header = not CONTACTS_FILE.exists()
    with open(CONTACTS_FILE, 'a', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        if write_header:
            w.writerow(['Дата першого контакту', "Ім'я", 'Username', 'Telegram_ID'])
        w.writerow([datetime.now().strftime('%d.%m.%Y %H:%M'),
                    first_name or '',
                    f'@{uname}' if uname else '',
                    uid])

def is_working_hours():
    now = datetime.now()
    h, wd = now.hour + now.minute / 60, now.weekday()
    if wd == 6: return False
    if wd <= 4: return 9 <= h < 18
    if wd == 5: return 10 <= h < 15
    return False

def make_greeting(first_name=''):
    name = f', {first_name}' if first_name else ''
    if is_working_hours():
        return f'Доброго дня{name}! Вас вітає магазин Кінезіс 👋 Ми онлайн і готові допомогти.'
    return (f'Доброго дня{name}! Вас вітає магазин Кінезіс.\n\n'
            'Зараз ми не в мережі — відповідаємо:\n'
            '🕐 Пн–Пт: 9:00–18:00  |  Сб: 10:00–15:00\n\n'
            'Залиште питання — менеджер відповість у найближчий робочий час.')

async def notify_order(app, order):
    now = datetime.now().strftime('%d.%m.%Y %H:%M')
    uid = order.get('uid', 'web')
    uinfo = f'@{order["uname"]}' if order.get('uname') else f'ID: {uid}'
    text = (f'🛒 НОВЕ ЗАМОВЛЕННЯ!\n\n'
            f'Товар: {order["product"]}\n'
            f"Ім'я: {order['name']}\n"
            f'Телефон: {order["phone"]}\n'
            f'Коментар: {order["comment"]}\n'
            f'Клієнт: {uinfo}\n'
            f'Час: {now}')

    product_id = order.get('product_id', '')
    buttons = []
    if str(uid) != 'web':
        buttons.append(InlineKeyboardButton('✍️ Написати клієнту', url=f'tg://user?id={uid}'))
    if str(uid) != 'web' and product_id and get_program(product_id):
        buttons.append(InlineKeyboardButton('✅ Продано — надіслати програму', callback_data=f'sold:{uid}:{product_id}'))
    btn = InlineKeyboardMarkup([buttons]) if buttons else None

    for mid in load_managers():
        try: await app.bot.send_message(mid, text, reply_markup=btn)
        except Exception as e: logging.warning(f'notify {mid}: {e}')

async def forward_question(app, uid, uname, text):
    mgrs = load_managers()
    if not mgrs:
        return
    uinfo = f'@{uname}' if uname else f'ID: {uid}'
    msg = (f'❓ ПИТАННЯ від клієнта ({uinfo}):\n\n{text}\n\n'
           '💬 Зробіть REPLY на це повідомлення щоб відповісти')
    mapping = load_map()
    for mid in mgrs:
        try:
            sent = await app.bot.send_message(mid, msg)
            mapping[f'{mid}_{sent.message_id}'] = uid
        except Exception as e: logging.warning(f'forward {mid}: {e}')
    save_map(mapping)

# ── Handlers ──────────────────────────────────────────────────────────────────

async def cmd_start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    u = update.effective_user
    save_contact(u.id, u.username, u.first_name)
    prod_id = ctx.args[0] if ctx.args else ''
    product = PRODUCTS.get(prod_id)
    if product:
        ctx.user_data['product'] = product
        ctx.user_data['product_id'] = prod_id
        hi = 'Доброго дня! Вас вітає магазин Кінезіс 👋' if is_working_hours() else 'Доброго дня! Вас вітає магазин Кінезіс.'
        await update.message.reply_text(
            f'{hi}\n\nВи обрали: {product}\n\nВведіть ваше ім\'я:',
            reply_markup=ReplyKeyboardMarkup([['Назад']], resize_keyboard=True, one_time_keyboard=True)
        )
        return ASK_NAME
    await update.message.reply_text(
        make_greeting(update.effective_user.first_name or ''),
        reply_markup=MAIN_KB
    )
    return ConversationHandler.END

async def ask_name(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if update.message.text == 'Назад':
        await update.message.reply_text('Головне меню:', reply_markup=MAIN_KB)
        return ConversationHandler.END
    ctx.user_data['name'] = update.message.text
    await update.message.reply_text(
        f"Дякую, {update.message.text}! Введіть номер телефону або натисніть кнопку:",
        reply_markup=ReplyKeyboardMarkup(
            [[KeyboardButton('Поділитися номером', request_contact=True)]],
            resize_keyboard=True, one_time_keyboard=True
        )
    )
    return ASK_PHONE

async def ask_phone(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    phone = update.message.contact.phone_number if update.message.contact else update.message.text.strip()
    ctx.user_data['phone'] = phone
    await update.message.reply_text(
        'Є питання або побажання? Напишіть або натисніть Пропустити:',
        reply_markup=ReplyKeyboardMarkup([['Пропустити']], resize_keyboard=True, one_time_keyboard=True)
    )
    return ASK_COMMENT

async def ask_comment(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    comment = '—' if update.message.text == 'Пропустити' else update.message.text
    uid, uname = update.effective_user.id, update.effective_user.username
    order = {**ctx.user_data, 'comment': comment, 'uid': uid, 'uname': uname,
             'product_id': ctx.user_data.get('product_id', '')}
    save_order(order['product'], order['name'], order['phone'], comment, uid, uname)
    await notify_order(ctx.application, order)
    await update.message.reply_text(
        "✅ Замовлення прийнято! Менеджер зв'яжеться найближчим часом.\n\n"
        "Андрій: +38 099 266-26-88\n\nДякуємо що обрали Кінезіс!",
        reply_markup=MAIN_KB
    )
    return ConversationHandler.END

async def cancel(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text('Головне меню:', reply_markup=MAIN_KB)
    return ConversationHandler.END

async def cmd_addmanager(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if ctx.args and ctx.args[0] == PASS:
        uid = update.effective_user.id
        mgrs = load_managers()
        if uid not in mgrs:
            mgrs.append(uid)
            save_managers(mgrs)
        await update.message.reply_text(
            f'✅ Вас додано як менеджера! ID: {uid}\n\n'
            'Тепер ви отримуватимете замовлення і питання клієнтів.\n'
            'Відповідайте через REPLY на повідомлення від бота.'
        )
    else:
        await update.message.reply_text('❌ Неправильний пароль.')

async def cmd_listorders(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in load_managers():
        return
    count = 0
    if ORDERS_FILE.exists():
        count = max(0, len(ORDERS_FILE.read_text('utf-8').strip().split('\n')) - 1)
    await update.message.reply_text(f'📊 Всього замовлень збережено: {count}')

async def cmd_clients(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in load_managers():
        return

    cutoff = datetime.now() - timedelta(days=30)

    # --- Замовлення ---
    orders_active, orders_inactive = [], []
    if ORDERS_FILE.exists():
        with open(ORDERS_FILE, newline='', encoding='utf-8') as f:
            seen = {}
            for row in csv.DictReader(f):
                try:
                    dt = datetime.strptime(row['Дата'], '%d.%m.%Y %H:%M')
                except:
                    continue
                key = row['Телефон'] or row['Telegram_ID']
                if key not in seen or dt > seen[key]['dt']:
                    seen[key] = {'dt': dt, 'row': row}
            for entry in seen.values():
                name_key = "Ім'я"
                rec = f"• {entry['row'][name_key]} | {entry['row']['Телефон']} | {entry['row']['Telegram_ID']} | {entry['dt'].strftime('%d.%m.%Y')}"
                if entry['dt'] >= cutoff:
                    orders_active.append(rec)
                else:
                    orders_inactive.append(rec)

    # --- Контакти (всі хто писав, але ще не замовляв) ---
    contacts = []
    if CONTACTS_FILE.exists():
        with open(CONTACTS_FILE, newline='', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                name_col = "Ім'я"
                date_col = 'Дата першого контакту'
                contacts.append(f"• {row.get(name_col, '')} {row.get('Username', '')} | {row.get('Telegram_ID', '')} | {row.get(date_col, '')}")

    text = f'👥 КЛІЄНТИ\n\n'
    text += f'🛒 Замовлення активні (30 днів) — {len(orders_active)}:\n'
    text += ('\n'.join(orders_active) if orders_active else 'немає') + '\n\n'
    text += f'⚪️ Замовлення старіші — {len(orders_inactive)}:\n'
    text += ('\n'.join(orders_inactive) if orders_inactive else 'немає') + '\n\n'
    text += f'💬 Всі хто писав боту — {len(contacts)}:\n'
    text += ('\n'.join(contacts) if contacts else 'немає')

    if len(text) > 4000:
        text = text[:4000] + '\n\n... (список обрізано, скористайтесь /export)'

    await update.message.reply_text(text)

async def callback_sold(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """Manager pressed 'Sold — send program' inline button."""
    query = update.callback_query
    await query.answer()
    if query.from_user.id not in load_managers():
        await query.answer('❌ Тільки для менеджерів', show_alert=True)
        return
    try:
        _, client_id, product_id = query.data.split(':', 2)
        client_id = int(client_id)
    except Exception:
        await query.edit_message_reply_markup(reply_markup=None)
        return
    program = get_program(product_id)
    if not program:
        await query.answer('Програма для цього товару не знайдена', show_alert=True)
        return
    product_name = PRODUCTS.get(product_id, product_id)
    intro = f'🎉 Вітаємо з покупкою *{product_name}*!\n\nОсь ваша базова програма вправ:\n\n'
    try:
        await ctx.bot.send_message(client_id, intro + program, parse_mode='Markdown')
        await query.edit_message_reply_markup(reply_markup=InlineKeyboardMarkup([[
            InlineKeyboardButton('✅ Програму надіслано клієнту', callback_data='noop')
        ]]))
        logging.info(f'Program sent to client {client_id} for product {product_id}')
    except Exception as e:
        await query.answer(f'Помилка: {e}', show_alert=True)
        logging.warning(f'send program to {client_id}: {e}')

async def callback_noop(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.callback_query.answer()

async def cmd_sold(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    """Manual: /sold [client_chat_id] [product_id]
    Use when client ordered via web form (no bot chat_id from order flow)."""
    if update.effective_user.id not in load_managers():
        return
    if not ctx.args or len(ctx.args) < 2:
        await update.message.reply_text(
            '📖 Використання:\n/sold [chat_id клієнта] [product_id]\n\n'
            'Наприклад: /sold 123456789 mtb1\n\n'
            'Chat ID клієнта видно в /clients або в деталях замовлення.')
        return
    try:
        client_id = int(ctx.args[0])
        product_id = ctx.args[1]
    except ValueError:
        await update.message.reply_text('❌ Невірний формат. Chat ID має бути числом.')
        return
    program = get_program(product_id)
    if not program:
        await update.message.reply_text(
            f'❌ Програму для "{product_id}" не знайдено.\n'
            'Доступні: mtb1, mtb2, mtb4, bench1, massage1, bars1, stairs1 тощо')
        return
    product_name = PRODUCTS.get(product_id, product_id)
    intro = f'🎉 Вітаємо з покупкою *{product_name}*!\n\nОсь ваша базова програма вправ:\n\n'
    try:
        await ctx.bot.send_message(client_id, intro + program, parse_mode='Markdown')
        await update.message.reply_text(f'✅ Програму надіслано клієнту (ID: {client_id})')
    except Exception as e:
        await update.message.reply_text(f'❌ Помилка: {e}\nМожливо клієнт не писав боту.')

async def cmd_export(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in load_managers():
        return
    today = datetime.now().strftime('%d.%m.%Y')
    if ORDERS_FILE.exists():
        await update.message.reply_document(
            document=open(ORDERS_FILE, 'rb'),
            filename='kinezis_orders.csv',
            caption=f'📊 Замовлення Кінезіс — {today}'
        )
    else:
        await update.message.reply_text('📭 Замовлень ще немає.')
    if CONTACTS_FILE.exists():
        await update.message.reply_document(
            document=open(CONTACTS_FILE, 'rb'),
            filename='kinezis_contacts.csv',
            caption=f'👥 Всі контакти (хто писав боту) — {today}'
        )
    else:
        await update.message.reply_text('📭 Контактів ще немає.')

async def handle_text(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    u = update.effective_user
    uid, txt = u.id, update.message.text
    save_contact(uid, u.username, u.first_name)

    # Менеджер відповідає через Reply
    if uid in load_managers() and update.message.reply_to_message:
        key = f'{uid}_{update.message.reply_to_message.message_id}'
        target = load_map().get(key)
        if target:
            mgr_name = update.effective_user.first_name or 'Менеджер'
            await ctx.bot.send_message(target, f'💬 {mgr_name} з Кінезіс відповідає:\n\n{txt}')
            await update.message.reply_text('✅ Відповідь надіслано клієнту')
            for mid in load_managers():
                if mid != uid:
                    try: await ctx.bot.send_message(mid, f'ℹ️ {mgr_name} вже відповів цьому клієнту.')
                    except: pass
            return

    if txt == 'Назад':
        await update.message.reply_text('Головне меню:', reply_markup=MAIN_KB); return
    if txt == 'Каталог товарів':
        await update.message.reply_text('Переглядайте асортимент на сайті:',
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton('Відкрити каталог', url=f'{SITE}/catalog.html')]])); return
    if txt == 'Часті питання':
        await update.message.reply_text('Оберіть питання:', reply_markup=FAQ_KB); return
    if txt == 'Зробити замовлення':
        await update.message.reply_text('Перейдіть до каталогу, оберіть товар і натисніть Замовити:',
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton('Відкрити каталог', url=f'{SITE}/catalog.html')]])); return
    if txt == 'Доставка та оплата':
        await update.message.reply_text(
            '🚚 Доставка Новою Поштою або Укрпоштою (2–5 днів).\n\n'
            '💳 Оплата:\n• Накладений платіж\n• Передоплата на картку ПриватБанк / Монобанк\n• Безготівкова для юросіб'); return
    if txt == 'Гарантія':
        await update.message.reply_text('🛡️ Гарантія 12 місяців. Повернення протягом 14 днів.'); return
    if txt == 'Контакти':
        await update.message.reply_text(
            '📞 Андрій: +38 099 266-26-88\n'
            '📧 sport_ok@ukr.net\n🕐 Пн–Пт: 9:00–18:00, Сб: 10:00–15:00'); return
    if txt in FAQ:
        await update.message.reply_text(FAQ[txt]); return

    # Невідоме — пересилаємо менеджерам
    await forward_question(ctx.application, uid, update.effective_user.username, txt)
    if is_working_hours():
        reply = 'Дякуємо за питання! Менеджер відповість найближчим часом.\n\n📞 +38 099 266-26-88'
    else:
        reply = ('Дякуємо за звернення! Зараз ми не в мережі.\n\n'
                 'Відповідаємо: Пн–Пт 9:00–18:00, Сб 10:00–15:00.\n\n'
                 'Хочете щоб передзвонили? Напишіть номер телефону 👇\n\n📞 +38 099 266-26-88')
    await update.message.reply_text(reply, reply_markup=MAIN_KB)

def tg_send(text):
    """Send message to all managers via Telegram API directly (sync, thread-safe)."""
    import urllib.request
    for mid in load_managers():
        try:
            payload = json.dumps({'chat_id': mid, 'text': text}).encode()
            req = urllib.request.Request(
                f'https://api.telegram.org/bot{TOKEN}/sendMessage',
                data=payload,
                headers={'Content-Type': 'application/json'}
            )
            urllib.request.urlopen(req, timeout=5)
        except Exception as e:
            logging.warning(f'tg_send {mid}: {e}')

def make_http_handler():
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *a): pass

        def _cors(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')

        def do_OPTIONS(self):
            self.send_response(200)
            self._cors()
            self.end_headers()

        def do_POST(self):
            if self.path != '/contact':
                self.send_response(404); self.end_headers(); return
            try:
                length = int(self.headers.get('Content-Length', 0))
                data = json.loads(self.rfile.read(length))
                name    = data.get('name', '—')
                phone   = data.get('phone', '—')
                product = data.get('product', '')
                message = data.get('message', '')
                text = (f'📋 НОВА ЗАЯВКА З САЙТУ\n\n'
                        f"Ім'я: {name}\nТелефон: {phone}"
                        + (f'\nТовар: {product}' if product else '')
                        + (f'\nПовідомлення: {message}' if message else ''))
                save_order(product or '—', name, phone, message or '—', 'web', None)
                tg_send(text)
                self.send_response(200)
                self._cors()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"ok":true}')
            except Exception as ex:
                logging.warning(f'contact endpoint: {ex}')
                self.send_response(500); self._cors(); self.end_headers()
    return Handler

def start_http():
    port = int(os.environ.get('PORT', 8080))
    server = HTTPServer(('0.0.0.0', port), make_http_handler())
    logging.info(f'HTTP server on port {port}')
    server.serve_forever()

def start_ping():
    import time, urllib.request
    port = int(os.environ.get('PORT', 8080))
    url = f'http://localhost:{port}/contact'
    time.sleep(30)  # wait for HTTP server to start
    while True:
        try:
            urllib.request.urlopen(url, timeout=5)
        except Exception:
            pass
        time.sleep(600)  # ping every 10 minutes

def main():
    app = Application.builder().token(TOKEN).build()
    conv = ConversationHandler(
        entry_points=[CommandHandler('start', cmd_start)],
        states={
            ASK_NAME:    [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_name)],
            ASK_PHONE:   [MessageHandler(filters.CONTACT | (filters.TEXT & ~filters.COMMAND), ask_phone)],
            ASK_COMMENT: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_comment)],
        },
        fallbacks=[CommandHandler('cancel', cancel)],
        allow_reentry=True,
    )
    app.add_handler(conv)
    app.add_handler(CommandHandler('addmanager', cmd_addmanager))
    app.add_handler(CommandHandler('listorders', cmd_listorders))
    app.add_handler(CommandHandler('clients', cmd_clients))
    app.add_handler(CommandHandler('export', cmd_export))
    app.add_handler(CommandHandler('sold', cmd_sold))
    app.add_handler(CallbackQueryHandler(callback_sold, pattern=r'^sold:'))
    app.add_handler(CallbackQueryHandler(callback_noop, pattern=r'^noop$'))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))
    # Start HTTP server and keep-alive ping in background threads
    threading.Thread(target=start_http, daemon=True).start()
    threading.Thread(target=start_ping, daemon=True).start()
    print('✅ Бот @Kineziss_bot запущений (Python)!')
    app.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    main()
