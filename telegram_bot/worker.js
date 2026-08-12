// Kinezis Telegram Bot — Cloudflare Worker
// Замінює bot.py (Railway) — запускається як serverless webhook

const SITE = 'https://kinezis.com.ua';

// ── Дані товарів ──────────────────────────────────────────────────────────────

const PRODUCTS = {
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
};

const PROGRAMS = {
  mtb: `🏋️ *Базова програма вправ на тренажері МТБ*

Виконуйте вранці або вдень, 3–4 рази на тиждень.
Починайте з мінімального опору — 5–10 кг.

*1. Тяга верхнього блоку до грудей* (широчайші м'язи спини)
Сядьте або стоячи, тягніть до грудей. 3 сети × 15 повторень

*2. Тяга нижнього блоку лежачи на спині* (хребет, поперек)
Ляжте на підлогу ногами до тренажера, тягніть до живота. 3 × 15

*3. Жим ногами лежачи* (стегна, сідниці, коліна)
Ляжте на спину, упирайтесь ногами у рукоятку. 3 × 20

*4. Розведення рук стоячи* (плечі, грудь)
Стоячи між блоками, розводьте руки в сторони. 3 × 12

*5. Розтяжка* — після кожного заняття 5–10 хвилин

❗ *Важливо:* рухи повільні, без ривків. Дихання не затримувати.

Питання — пишіть сюди, підкажемо!`,

  bench: `🛋️ *Базова програма вправ на реабілітаційній лавці*

3–4 рази на тиждень, починайте з легкого навантаження.

*1. Гіперекстензія* (зміцнення м'язів спини)
Лягайте животом, піднімайте корпус до прямої лінії. 3 × 15

*2. Підйом ніг лежачи на спині* (прес, поперек)
Пряма спина, ноги піднімайте на 45°. 3 × 15

*3. Планка* (кор, стабілізація хребта)
30–60 секунд × 3 підходи

*4. Скручування* (прес)
На лавці, кут 30°. 3 × 20

*5. Розтяжка хребта* — «кішка-корова» на підлозі після кожного заняття

❗ *При болях у спині:* виключіть вправи 2 і 4 до консультації з лікарем.

Питання — пишіть!`,

  massage: `🛏️ *Рекомендації з використання масажного столу*

Масажний стіл — це робочий інструмент терапевта. Але є вправи які можна виконувати самостійно:

*1. Релаксація на животі* (розвантаження хребта)
5–10 хвилин лежачи на животі без подушки — знімає навантаження з поперека.

*2. Розтяжка грудного відділу*
Ляжте на живіт, руки вперед, піднімайте плечі. 10–15 разів.

*3. Масаж спини партнером або масажистом* — 2 рази на тиждень

Рекомендуємо поєднувати зі статтями нашого блогу:
kinezis.com.ua/blog

Питання — пишіть!`,

  bars: `🦯 *Базова програма вправ на паралельних брусах і сходах*

Ідеально для відновлення після операцій, інсульту, травм ніг.
Починайте під наглядом або притримуючись за опору.

*1. Ходьба між брусами* (відновлення ходи)
Починайте з 5 хвилин, 2 рази на день. Поступово збільшуйте.

*2. Перенесення ваги з ноги на ногу* (рівновага)
Стоячи між брусами, 3 × 20 разів

*3. Підйом на носки* (литкові м'язи)
Тримаючись за бруси. 3 × 20

*4. Напівприсідання* (колінні, стегнові суглоби)
До кута 90°. 3 × 10–15

*5. Підйом по сходах* (якщо є сходи)
Починайте з 1 сходинки туди-назад, поступово додавайте

❗ Не поспішайте. Якість важливіша за кількість.

Питання — пишіть!`,
};

const FAQ_DATA = {
  'Як зробити замовлення': 'Оберіть товар у каталозі на сайті та натисніть Замовити. Бот проведе через оформлення, менеджер зателефонує для підтвердження.',
  'Яка доставка': 'Доставка по всій Україні Новою Поштою або Укрпоштою. Термін: 2–5 робочих днів. Вартість за тарифами перевізника.',
  'Яка гарантія': 'Гарантія 12 місяців на все обладнання. Запасні частини доступні протягом 5 років.',
  'Чи можна повернути товар': 'Так, протягом 14 днів з моменту отримання, якщо товар не використовувався та збережена упаковка.',
  'Як вибрати тренажер МТБ': 'МТБ-1 — для дому (1 блок), МТБ-2 — розширений (2 блоки), МТБ-4 — для клінік (4 блоки). Не впевнені? Напишіть — підберемо разом!',
  'Де ви знаходитесь': 'м. Чернігів, але працюємо по всій Україні. Самовивіз — за домовленістю.',
  'Як оплатити': 'Накладений платіж (після отримання) або передоплата на картку ПриватБанку / Монобанку. Безготівкова оплата для юридичних осіб.',
  'Контакти': '📞 Андрій: +38 099 266-26-88\n📧 sport_ok@ukr.net\n🕐 Пн–Пт: 9:00–18:00, Сб: 10:00–15:00',
};

// ── Утиліти ───────────────────────────────────────────────────────────────────

function getProgram(productId) {
  const pid = productId.toLowerCase();
  if (pid.startsWith('mtb') || pid.startsWith('mtv')) return PROGRAMS.mtb;
  if (pid.startsWith('bench') || pid.includes('hyperext') || pid.includes('roman') || pid.startsWith('svs')) return PROGRAMS.bench;
  if (pid.startsWith('massage')) return PROGRAMS.massage;
  if (pid.startsWith('bars') || pid.startsWith('stairs')) return PROGRAMS.bars;
  return null;
}

function isWorkingHours() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Kiev' }));
  const h = now.getHours() + now.getMinutes() / 60;
  const wd = now.getDay(); // 0=Sun
  if (wd === 0) return false;
  if (wd >= 1 && wd <= 5) return h >= 9 && h < 18;
  if (wd === 6) return h >= 10 && h < 15;
  return false;
}

function makeGreeting(firstName) {
  const name = firstName ? `, ${firstName}` : '';
  if (isWorkingHours()) {
    return `Доброго дня${name}! Вас вітає магазин Кінезіс 👋 Ми онлайн і готові допомогти.`;
  }
  return `Доброго дня${name}! Вас вітає магазин Кінезіс.\n\nЗараз ми не в мережі — відповідаємо:\n🕐 Пн–Пт: 9:00–18:00  |  Сб: 10:00–15:00\n\nЗалиште питання — менеджер відповість у найближчий робочий час.`;
}

function nowUkraine() {
  return new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev', hour12: false })
    .replace(',', '');
}

// ── KV helpers ────────────────────────────────────────────────────────────────

async function getManagers(env) {
  const fromEnv = (env.MANAGER_IDS || '').split(',')
    .map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const raw = await env.KV.get('managers');
  const fromKV = raw ? JSON.parse(raw) : [];
  return [...new Set([...fromEnv, ...fromKV])];
}

async function saveManagers(env, ids) {
  await env.KV.put('managers', JSON.stringify([...new Set(ids)]));
}

async function getState(env, uid) {
  const raw = await env.KV.get(`state_${uid}`);
  return raw ? JSON.parse(raw) : null;
}

async function setState(env, uid, state) {
  if (state === null) {
    await env.KV.delete(`state_${uid}`);
  } else {
    await env.KV.put(`state_${uid}`, JSON.stringify(state), { expirationTtl: 3600 });
  }
}

async function saveOrder(env, order) {
  const raw = await env.KV.get('orders');
  const orders = raw ? JSON.parse(raw) : [];
  orders.push({ ...order, date: nowUkraine() });
  await env.KV.put('orders', JSON.stringify(orders));
}

async function getOrders(env) {
  const raw = await env.KV.get('orders');
  return raw ? JSON.parse(raw) : [];
}

async function saveContact(env, uid, username, firstName) {
  const raw = await env.KV.get('contacts');
  const contacts = raw ? JSON.parse(raw) : {};
  if (!contacts[uid]) {
    contacts[uid] = {
      date: nowUkraine(),
      name: firstName || '',
      username: username ? `@${username}` : '',
      uid,
    };
    await env.KV.put('contacts', JSON.stringify(contacts));
  }
}

async function getContacts(env) {
  const raw = await env.KV.get('contacts');
  return raw ? JSON.parse(raw) : {};
}

async function getMsgMap(env) {
  const raw = await env.KV.get('msg_map');
  return raw ? JSON.parse(raw) : {};
}

async function saveMsgMap(env, map) {
  await env.KV.put('msg_map', JSON.stringify(map), { expirationTtl: 86400 * 7 });
}

// ── Telegram API ──────────────────────────────────────────────────────────────

async function api(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMessage(token, chatId, text, extra = {}) {
  return api(token, 'sendMessage', { chat_id: chatId, text, ...extra });
}

async function answerCallback(token, queryId, text, showAlert = false) {
  return api(token, 'answerCallbackQuery', {
    callback_query_id: queryId,
    text,
    show_alert: showAlert,
  });
}

async function editMarkup(token, chatId, messageId, replyMarkup) {
  return api(token, 'editMessageReplyMarkup', {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup,
  });
}

async function notifyManagers(token, env, text, replyMarkup) {
  const mgrs = await getManagers(env);
  for (const mid of mgrs) {
    try {
      await sendMessage(token, mid, text, replyMarkup ? { reply_markup: replyMarkup } : {});
    } catch (e) { /* ignore */ }
  }
}

// ── Клавіатури ────────────────────────────────────────────────────────────────

const MAIN_KB = {
  keyboard: [
    ['Каталог товарів', 'Часті питання'],
    ['Доставка та оплата', 'Гарантія'],
    ['Контакти', 'Зробити замовлення'],
  ],
  resize_keyboard: true,
};

const FAQ_KB = {
  keyboard: [
    ['Як зробити замовлення', 'Яка доставка'],
    ['Яка гарантія', 'Чи можна повернути товар'],
    ['Як вибрати тренажер МТБ', 'Як оплатити'],
    ['Де ви знаходитесь', 'Назад'],
  ],
  resize_keyboard: true,
};

// ── Обробники команд ──────────────────────────────────────────────────────────

async function handleStart(token, env, msg, args) {
  const u = msg.from;
  await saveContact(env, u.id, u.username, u.first_name);

  const prodId = args[0] || '';
  const product = PRODUCTS[prodId];

  if (product) {
    await setState(env, u.id, { step: 'ASK_NAME', product, product_id: prodId });
    const hi = isWorkingHours()
      ? 'Доброго дня! Вас вітає магазин Кінезіс 👋'
      : 'Доброго дня! Вас вітає магазин Кінезіс.';
    await sendMessage(token, msg.chat.id,
      `${hi}\n\nВи обрали: ${product}\n\nВведіть ваше ім'я:`,
      { reply_markup: { keyboard: [['Назад']], resize_keyboard: true, one_time_keyboard: true } });
    return;
  }

  await setState(env, u.id, null);
  await sendMessage(token, msg.chat.id, makeGreeting(u.first_name), { reply_markup: MAIN_KB });
}

async function handleAddManager(token, env, msg, args) {
  const pass = env.MGR_PASS || 'kinezis2024';
  if (args[0] === pass) {
    const uid = msg.from.id;
    const mgrs = await getManagers(env);
    if (!mgrs.includes(uid)) {
      mgrs.push(uid);
      await saveManagers(env, mgrs);
    }
    await sendMessage(token, msg.chat.id,
      `✅ Вас додано як менеджера! ID: ${uid}\n\nТепер ви отримуватимете замовлення і питання клієнтів.\nВідповідайте через REPLY на повідомлення від бота.`);
  } else {
    await sendMessage(token, msg.chat.id, '❌ Неправильний пароль.');
  }
}

async function handleListOrders(token, env, msg) {
  const mgrs = await getManagers(env);
  if (!mgrs.includes(msg.from.id)) return;
  const orders = await getOrders(env);
  await sendMessage(token, msg.chat.id, `📊 Всього замовлень збережено: ${orders.length}`);
}

async function handleClients(token, env, msg) {
  const mgrs = await getManagers(env);
  if (!mgrs.includes(msg.from.id)) return;

  const orders = await getOrders(env);
  const contacts = await getContacts(env);

  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;

  // Дедуплікація замовлень по телефону
  const seen = {};
  for (const o of orders) {
    const key = o.phone || o.uid || '';
    if (!seen[key] || new Date(o.date) > new Date(seen[key].date)) {
      seen[key] = o;
    }
  }

  const active = [], inactive = [];
  for (const o of Object.values(seen)) {
    const dt = new Date(o.date);
    const rec = `• ${o.name} | ${o.phone} | ${o.uid} | ${o.date}`;
    if (dt.getTime() >= cutoff) active.push(rec);
    else inactive.push(rec);
  }

  const contactList = Object.values(contacts)
    .map(c => `• ${c.name} ${c.username} | ${c.uid} | ${c.date}`);

  let text = '👥 КЛІЄНТИ\n\n';
  text += `🛒 Замовлення активні (30 днів) — ${active.length}:\n`;
  text += (active.length ? active.join('\n') : 'немає') + '\n\n';
  text += `⚪️ Замовлення старіші — ${inactive.length}:\n`;
  text += (inactive.length ? inactive.join('\n') : 'немає') + '\n\n';
  text += `💬 Всі хто писав боту — ${contactList.length}:\n`;
  text += contactList.length ? contactList.join('\n') : 'немає';

  if (text.length > 4000) text = text.slice(0, 4000) + '\n\n... (список обрізано)';
  await sendMessage(token, msg.chat.id, text);
}

async function handleExport(token, env, msg) {
  const mgrs = await getManagers(env);
  if (!mgrs.includes(msg.from.id)) return;

  const orders = await getOrders(env);
  const contacts = await getContacts(env);

  // Замовлення як CSV текст
  if (orders.length) {
    let csv = 'Дата,Товар,Імя,Телефон,Telegram_ID,Username,Коментар\n';
    for (const o of orders) {
      csv += `"${o.date}","${o.product || ''}","${o.name || ''}","${o.phone || ''}","${o.uid || ''}","${o.username || ''}","${o.comment || ''}"\n`;
    }
    const fd = new FormData();
    fd.append('chat_id', String(msg.chat.id));
    fd.append('caption', `📊 Замовлення Кінезіс — ${nowUkraine()}`);
    fd.append('document', new Blob([csv], { type: 'text/csv' }), 'kinezis_orders.csv');
    await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: 'POST', body: fd });
  } else {
    await sendMessage(token, msg.chat.id, '📭 Замовлень ще немає.');
  }

  // Контакти як CSV
  const contactArr = Object.values(contacts);
  if (contactArr.length) {
    let csv = 'Дата першого контакту,Імя,Username,Telegram_ID\n';
    for (const c of contactArr) {
      csv += `"${c.date}","${c.name}","${c.username}","${c.uid}"\n`;
    }
    const fd = new FormData();
    fd.append('chat_id', String(msg.chat.id));
    fd.append('caption', `👥 Всі контакти (хто писав боту) — ${nowUkraine()}`);
    fd.append('document', new Blob([csv], { type: 'text/csv' }), 'kinezis_contacts.csv');
    await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: 'POST', body: fd });
  } else {
    await sendMessage(token, msg.chat.id, '📭 Контактів ще немає.');
  }
}

async function handleSold(token, env, msg, args) {
  const mgrs = await getManagers(env);
  if (!mgrs.includes(msg.from.id)) return;

  if (!args || args.length < 2) {
    await sendMessage(token, msg.chat.id,
      '📖 Використання:\n/sold [chat_id клієнта] [product_id]\n\nНаприклад: /sold 123456789 mtb1\n\nChat ID клієнта видно в /clients.');
    return;
  }

  const clientId = parseInt(args[0]);
  const productId = args[1];
  if (isNaN(clientId)) {
    await sendMessage(token, msg.chat.id, '❌ Невірний формат. Chat ID має бути числом.');
    return;
  }

  const program = getProgram(productId);
  if (!program) {
    await sendMessage(token, msg.chat.id,
      `❌ Програму для "${productId}" не знайдено.\nДоступні: mtb1, mtb2, bench1, massage1, bars1 тощо`);
    return;
  }

  const productName = PRODUCTS[productId] || productId;
  const intro = `🎉 Вітаємо з покупкою *${productName}*!\n\nОсь ваша базова програма вправ:\n\n`;
  try {
    await sendMessage(token, clientId, intro + program, { parse_mode: 'Markdown' });
    await sendMessage(token, msg.chat.id, `✅ Програму надіслано клієнту (ID: ${clientId})`);
  } catch (e) {
    await sendMessage(token, msg.chat.id, `❌ Помилка: ${e}\nМожливо клієнт не писав боту.`);
  }
}

// ── Inline кнопка "Продано" ───────────────────────────────────────────────────

async function handleCallbackSold(token, env, query) {
  const mgrs = await getManagers(env);
  if (!mgrs.includes(query.from.id)) {
    await answerCallback(token, query.id, '❌ Спочатку виконайте /addmanager', true);
    return;
  }

  let clientId, productId;
  try {
    const parts = query.data.split(':');
    clientId = parseInt(parts[1]);
    productId = parts.slice(2).join(':');
    if (isNaN(clientId)) throw new Error('bad id');
  } catch {
    await answerCallback(token, query.id, '❌ Помилка даних кнопки', true);
    return;
  }

  const program = getProgram(productId);
  if (!program) {
    await answerCallback(token, query.id, '❌ Програму для цього товару не знайдено', true);
    return;
  }

  const productName = PRODUCTS[productId] || productId;
  const intro = `🎉 Вітаємо з покупкою *${productName}*!\n\nОсь ваша базова програма вправ:\n\n`;

  try {
    await sendMessage(token, clientId, intro + program, { parse_mode: 'Markdown' });
    await answerCallback(token, query.id, '✅ Програму надіслано!');
    await editMarkup(token, query.message.chat.id, query.message.message_id, {
      inline_keyboard: [[{ text: '✅ Програму надіслано клієнту', callback_data: 'noop' }]],
    });
  } catch (e) {
    const err = String(e);
    if (err.includes('bot was blocked') || err.includes('chat not found') || err.includes('user is deactivated')) {
      await answerCallback(token, query.id, '❌ Клієнт не відкривав бота — надіслати програму неможливо. Поділіться вручну.', true);
    } else {
      await answerCallback(token, query.id, `❌ Помилка: ${err}`, true);
    }
  }
}

// ── Текстові повідомлення ─────────────────────────────────────────────────────

async function handleText(token, env, msg) {
  const u = msg.from;
  const txt = msg.text || '';
  await saveContact(env, u.id, u.username, u.first_name);

  const mgrs = await getManagers(env);
  const isManager = mgrs.includes(u.id);

  // Менеджер — пересилання відповіді клієнту через Reply
  if (isManager) {
    if (msg.reply_to_message) {
      const key = `${u.id}_${msg.reply_to_message.message_id}`;
      const map = await getMsgMap(env);
      const targetId = map[key];
      if (targetId) {
        const mgrName = u.first_name || 'Менеджер';
        await sendMessage(token, targetId, `💬 ${mgrName} з Кінезіс відповідає:\n\n${txt}`);
        await sendMessage(token, msg.chat.id, '✅ Відповідь надіслано клієнту');
        for (const mid of mgrs) {
          if (mid !== u.id) {
            try { await sendMessage(token, mid, `ℹ️ ${mgrName} вже відповів цьому клієнту.`); } catch { /* ok */ }
          }
        }
      } else {
        await sendMessage(token, msg.chat.id,
          '⚠️ Клієнта для цього Reply не знайдено — можливо сесія застаріла.\nНапишіть клієнту напряму через кнопку «Написати клієнту».');
      }
    }
    return;
  }

  // Перевіряємо стан розмови (оформлення замовлення)
  const state = await getState(env, u.id);

  if (state?.step === 'ASK_NAME') {
    if (txt === 'Назад') {
      await setState(env, u.id, null);
      await sendMessage(token, msg.chat.id, 'Головне меню:', { reply_markup: MAIN_KB });
      return;
    }
    await setState(env, u.id, { ...state, step: 'ASK_PHONE', name: txt });
    await sendMessage(token, msg.chat.id,
      `Дякую, ${txt}! Введіть номер телефону або натисніть кнопку:`,
      { reply_markup: { keyboard: [[{ text: 'Поділитися номером', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true } });
    return;
  }

  if (state?.step === 'ASK_PHONE') {
    const phone = msg.contact?.phone_number || txt.trim();
    await setState(env, u.id, { ...state, step: 'ASK_COMMENT', phone });
    await sendMessage(token, msg.chat.id,
      'Є питання або побажання? Напишіть або натисніть Пропустити:',
      { reply_markup: { keyboard: [['Пропустити']], resize_keyboard: true, one_time_keyboard: true } });
    return;
  }

  if (state?.step === 'ASK_COMMENT') {
    const comment = txt === 'Пропустити' ? '—' : txt;
    const order = { ...state, comment, uid: u.id, username: u.username ? `@${u.username}` : '' };
    await saveOrder(env, order);

    const uinfo = u.username ? `@${u.username}` : `ID: ${u.id}`;
    const notifyText = `🛒 НОВЕ ЗАМОВЛЕННЯ!\n\nТовар: ${order.product}\nІм'я: ${order.name}\nТелефон: ${order.phone}\nКоментар: ${comment}\nКлієнт: ${uinfo}\nЧас: ${nowUkraine()}`;

    const buttons = [];
    buttons.push({ text: '✍️ Написати клієнту', url: `tg://user?id=${u.id}` });
    if (order.product_id && getProgram(order.product_id)) {
      buttons.push({ text: '✅ Продано — надіслати програму', callback_data: `sold:${u.id}:${order.product_id}` });
    }
    const replyMarkup = { inline_keyboard: [buttons] };

    for (const mid of mgrs) {
      try { await sendMessage(token, mid, notifyText, { reply_markup: replyMarkup }); } catch { /* ok */ }
    }

    await setState(env, u.id, null);
    await sendMessage(token, msg.chat.id,
      "✅ Замовлення прийнято! Менеджер зв'яжеться найближчим часом.\n\nАндрій: +38 099 266-26-88\n\nДякуємо що обрали Кінезіс!",
      { reply_markup: MAIN_KB });
    return;
  }

  // Головне меню
  if (txt === 'Назад') {
    await sendMessage(token, msg.chat.id, 'Головне меню:', { reply_markup: MAIN_KB });
    return;
  }
  if (txt === 'Каталог товарів') {
    await sendMessage(token, msg.chat.id, 'Переглядайте асортимент на сайті:', {
      reply_markup: { inline_keyboard: [[{ text: 'Відкрити каталог', url: `${SITE}/catalog` }]] },
    });
    return;
  }
  if (txt === 'Зробити замовлення') {
    const mgrs = await getManagers(env);
    const uinfo = u.username ? `@${u.username}` : `ID: ${u.id}`;
    const link = u.username ? `https://t.me/${u.username}` : `(немає username, ID: ${u.id})`;
    for (const mid of mgrs) {
      try { await sendMessage(token, mid, `🛒 Клієнт ${uinfo} хоче зробити замовлення.\n\nНапишіть йому: ${link}`); } catch { /* ok */ }
    }
    await sendMessage(token, msg.chat.id,
      "З'єдною вас з нашим менеджером! Він напише вам найближчим часом 🙏",
      { reply_markup: MAIN_KB });
    return;
  }
  if (txt === 'Часті питання') {
    await sendMessage(token, msg.chat.id, 'Оберіть питання:', { reply_markup: FAQ_KB });
    return;
  }
  if (txt === 'Доставка та оплата') {
    await sendMessage(token, msg.chat.id,
      '🚚 Доставка Новою Поштою або Укрпоштою (2–5 днів).\n\n💳 Оплата:\n• Накладений платіж\n• Передоплата на картку ПриватБанк / Монобанк\n• Безготівкова для юросіб');
    return;
  }
  if (txt === 'Гарантія') {
    await sendMessage(token, msg.chat.id, '🛡️ Гарантія 12 місяців. Повернення протягом 14 днів.');
    return;
  }
  if (txt === 'Контакти') {
    await sendMessage(token, msg.chat.id,
      '📞 Андрій: +38 099 266-26-88\n📧 sport_ok@ukr.net\n🕐 Пн–Пт: 9:00–18:00, Сб: 10:00–15:00');
    return;
  }
  if (FAQ_DATA[txt]) {
    await sendMessage(token, msg.chat.id, FAQ_DATA[txt]);
    return;
  }

  // Якщо схоже на номер телефону — підтверджуємо і пересилаємо менеджеру
  const isPhone = /^[\d\s\+\-\(\)]{7,20}$/.test(txt.trim());
  if (isPhone) {
    const uinfo = u.username ? `@${u.username}` : `ID: ${u.id}`;
    const fwdText = `📞 ЗАПИТ НА ПЕРЕДЗВОН від клієнта (${uinfo}):\n\nТелефон: ${txt}`;
    for (const mid of mgrs) {
      try { await sendMessage(token, mid, fwdText); } catch { /* ok */ }
    }
    await sendMessage(token, msg.chat.id,
      'Дякуємо! Менеджер зателефонує вам найближчим часом 🙏',
      { reply_markup: MAIN_KB });
    return;
  }

  // Невідоме — пересилаємо менеджерам
  const uinfo = u.username ? `@${u.username}` : `ID: ${u.id}`;
  const fwdText = `❓ ПИТАННЯ від клієнта (${uinfo}):\n\n${txt}\n\n💬 Зробіть REPLY на це повідомлення щоб відповісти`;
  const map = await getMsgMap(env);
  for (const mid of mgrs) {
    try {
      const sent = await sendMessage(token, mid, fwdText);
      if (sent?.result?.message_id) {
        map[`${mid}_${sent.result.message_id}`] = u.id;
      }
    } catch { /* ok */ }
  }
  await saveMsgMap(env, map);

  if (isWorkingHours()) {
    await sendMessage(token, msg.chat.id,
      'Дякуємо за питання! Менеджер відповість найближчим часом.',
      { reply_markup: MAIN_KB });
  } else {
    await sendMessage(token, msg.chat.id,
      'Дякуємо за звернення! Зараз ми не в мережі.\n\nВідповідаємо: Пн–Пт 9:00–18:00, Сб 10:00–15:00.\n\nХочете щоб передзвонили? Натисніть кнопку 👇',
      { reply_markup: { keyboard: [[{ text: '📞 Надіслати мій номер', request_contact: true }], ['Головне меню']], resize_keyboard: true, one_time_keyboard: true } });
  }
}

// ── Обробник контактної форми з сайту ────────────────────────────────────────

async function handleContactForm(token, env, request) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const data = await request.json();
    const name    = data.name    || '—';
    const phone   = data.phone   || '—';
    const product = data.product || '';
    const message = data.message || '';

    const text = `📋 НОВА ЗАЯВКА З САЙТУ\n\nІм'я: ${name}\nТелефон: ${phone}` +
      (product ? `\nТовар: ${product}` : '') +
      (message ? `\nПовідомлення: ${message}` : '');

    await saveOrder(env, { product: product || '—', name, phone, comment: message || '—', uid: 'web', username: '' });

    const mgrs = await getManagers(env);
    for (const mid of mgrs) {
      try { await sendMessage(token, mid, text); } catch { /* ok */ }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors },
    });
  }
}

// ── Головний обробник Worker ──────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const token = env.BOT_TOKEN;

    // Контактна форма з сайту
    if (url.pathname === '/contact') {
      return handleContactForm(token, env, request);
    }

    // Сповіщення про нову реєстрацію
    if (url.pathname === '/register-notify' && request.method === 'POST') {
      const cors = { 'Access-Control-Allow-Origin': '*' };
      try {
        const data = await request.json();
        const name  = data.name  || '—';
        const email = data.email || '—';
        const mgrs = await getManagers(env);
        for (const mid of mgrs) {
          try { await sendMessage(token, mid, `🆕 НОВА РЕЄСТРАЦІЯ\n\nІм'я: ${name}\nEmail: ${email}\nЧас: ${nowUkraine()}`); } catch { /* ok */ }
        }
        return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json', ...cors } });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false }), { status: 500, headers: cors });
      }
    }

    if (url.pathname === '/register-notify' && request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }

    // Telegram webhook
    if (url.pathname === '/webhook' && request.method === 'POST') {
      try {
        const update = await request.json();

        // Callback query (inline кнопки)
        if (update.callback_query) {
          const q = update.callback_query;
          if (q.data === 'noop') {
            await answerCallback(token, q.id, '');
          } else if (q.data?.startsWith('sold:')) {
            await handleCallbackSold(token, env, q);
          }
          return new Response('OK');
        }

        // Звичайне повідомлення
        const msg = update.message;
        if (!msg?.text && !msg?.contact) return new Response('OK');

        // Клієнт поділився контактом через кнопку
        if (msg.contact && !msg.text) {
          const u = msg.from;
          await saveContact(env, u.id, u.username, u.first_name);
          const phone = msg.contact.phone_number;
          const uinfo = u.username ? `@${u.username}` : `ID: ${u.id}`;
          const mgrs = await getManagers(env);
          for (const mid of mgrs) {
            try { await sendMessage(token, mid, `📞 ЗАПИТ НА ПЕРЕДЗВОН від клієнта (${uinfo}):\n\nТелефон: ${phone}`); } catch { /* ok */ }
          }
          await sendMessage(token, msg.chat.id,
            'Дякуємо! Менеджер зателефонує вам найближчим часом 🙏',
            { reply_markup: MAIN_KB });
          return new Response('OK');
        }

        const txt = msg.text || '';

        // Команди
        if (txt.startsWith('/start')) {
          const args = txt.split(' ').slice(1);
          await handleStart(token, env, msg, args);
        } else if (txt.startsWith('/addmanager')) {
          await handleAddManager(token, env, msg, txt.split(' ').slice(1));
        } else if (txt === '/listorders') {
          await handleListOrders(token, env, msg);
        } else if (txt === '/clients') {
          await handleClients(token, env, msg);
        } else if (txt === '/export') {
          await handleExport(token, env, msg);
        } else if (txt.startsWith('/sold')) {
          await handleSold(token, env, msg, txt.split(' ').slice(1));
        } else {
          await handleText(token, env, msg);
        }
      } catch (e) {
        console.error('Worker error:', e);
      }
      return new Response('OK');
    }

    return new Response('Kinezis Bot Worker', { status: 200 });
  },
};
