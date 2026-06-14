# ============================================================
#  Telegram-бот Кінезіс (@Kineziss_bot)
#  Запуск: клік правою кнопкою → "Запустити за допомогою PowerShell"
# ============================================================

$TOKEN    = "8873990753:AAHmzAkTR64xftJytnWqaMf-H7PqVEKC6tc"
$API      = "https://api.telegram.org/bot$TOKEN"
$StateFile   = "$PSScriptRoot\managers.json"
$ADMIN_PASS  = "kinezis2024"   # пароль для реєстрації менеджерів

$Products = @{
    'mtb1'         = 'Тренажер МТБ-1 (домашній) — 8 500 грн'
    'mtb2'         = 'Тренажер МТБ-2 (розширений) — 12 900 грн'
    'mtb4'         = 'Тренажер МТБ-4 (професійний) — 28 500 грн'
    'mtb601'       = 'Тренажер МТБ-601 — 18 700 грн'
    'mtb801'       = 'Тренажер МТБ-801 (посилений) — 34 900 грн'
    'mtb-child'    = 'Тренажер МТБ дитячий — 9 800 грн'
    'bench1'       = 'Лавка реабілітаційна складна — 5 400 грн'
    'hyperext1'    = 'Гіперекстензія домашня SW-301 — 4 200 грн'
    'bench-roman'  = 'Римський стілець реабілітаційний — 3 800 грн'
    'massage1'     = 'Масажний стіл складний (алюміній) — 7 200 грн'
    'massage2'     = 'Масажний стіл стаціонарний — 11 500 грн'
    'massage-chair'= 'Масажне крісло терапевтичне — 4 900 грн'
    'bars1'        = 'Паралельні бруси реабілітаційні — 15 800 грн'
    'stairs1'      = 'Реабілітаційні сходи (3 сходинки) — 9 200 грн'
    'acc-handles'  = 'Набір ручок для МТБ (6 шт.) — 1 200 грн'
    'acc-carabiner'= 'Карабін для МТБ (4 шт.) — 480 грн'
    'acc-blocks'   = 'Набір обтяжувачів для МТБ — 890 грн'
    'acc-mat'      = 'Килимок реабілітаційний — 650 грн'
    'balance'      = 'Балансувальна дошка — 1 800 грн'
    'stepper'      = 'Степ-платформа реабілітаційна — 2 200 грн'
    'walker'       = 'Ходунки реабілітаційні — 1 450 грн'
    'contact'      = 'Консультація (заявка з форми)'
}

# Зберігаємо стани розмов і менеджерів
$UserStates = @{}

function Get-Managers {
    if (Test-Path $StateFile) {
        return (Get-Content $StateFile -Raw | ConvertFrom-Json)
    }
    return @()
}

function Save-Managers($ids) {
    $ids | ConvertTo-Json | Set-Content $StateFile -Encoding utf8
}

function Send-Message($chatId, $text, $replyMarkup = $null, $parseMode = "HTML") {
    $body = @{ chat_id = $chatId; text = $text; parse_mode = $parseMode }
    if ($replyMarkup) { $body.reply_markup = $replyMarkup | ConvertTo-Json -Depth 10 }
    try {
        Invoke-RestMethod -Uri "$API/sendMessage" -Method POST -Body $body -ErrorAction Stop | Out-Null
    } catch {
        Write-Host "Помилка sendMessage: $_" -ForegroundColor Red
    }
}

function Notify-Managers($order) {
    $managers = Get-Managers
    if ($managers.Count -eq 0) {
        Write-Host "⚠️  Немає менеджерів! Надішліть /addmanager $ADMIN_PASS у бот." -ForegroundColor Yellow
        return
    }
    $now = Get-Date -Format "dd.MM.yyyy HH:mm"
    $tgLink = if ($order.username) { "`n🔗 @$($order.username)" } else { "" }
    $text = @"
🛒 <b>НОВЕ ЗАМОВЛЕННЯ!</b>

📦 $($order.product)
👤 $($order.name)
📞 $($order.phone)
💬 $($order.comment)
🕐 $now$tgLink
"@
    foreach ($mid in $managers) {
        $inlineBtn = @{
            inline_keyboard = @(@(@{text="💬 Написати покупцю"; url="tg://user?id=$($order.user_id)"}))
        }
        $body = @{
            chat_id      = $mid
            text         = $text
            parse_mode   = "HTML"
            reply_markup = ($inlineBtn | ConvertTo-Json -Depth 10)
        }
        try {
            Invoke-RestMethod -Uri "$API/sendMessage" -Method POST -Body $body | Out-Null
        } catch {
            Write-Host "Помилка сповіщення менеджера $mid: $_" -ForegroundColor Red
        }
    }
}

function Handle-Update($update) {
    $msg = $update.message
    if (-not $msg) { return }

    $chatId = $msg.chat.id
    $userId = $msg.from.id
    $text   = $msg.text
    $fname  = $msg.from.first_name
    $uname  = $msg.from.username

    if (-not $UserStates.ContainsKey($userId)) {
        $UserStates[$userId] = @{ step = 'main' }
    }
    $state = $UserStates[$userId]

    # ── /addmanager ──
    if ($text -match '^/addmanager (.+)$') {
        $pass = $Matches[1].Trim()
        if ($pass -eq $ADMIN_PASS) {
            $managers = [System.Collections.ArrayList](Get-Managers)
            if ($managers -notcontains $userId) {
                $managers.Add($userId) | Out-Null
                Save-Managers $managers
                Send-Message $chatId "✅ <b>$fname</b>, вас додано як менеджера!`nВаш ID: <code>$userId</code>`nТепер ви отримуватимете сповіщення про замовлення."
            } else {
                Send-Message $chatId "Ви вже зареєстровані як менеджер (ID: $userId)."
            }
        } else {
            Send-Message $chatId "Неправильний пароль."
        }
        return
    }

    # ── /start ──
    if ($text -match '^/start') {
        $parts = $text -split ' '
        $pid = if ($parts.Count -gt 1) { $parts[1] } else { $null }
        $product = if ($pid -and $Products.ContainsKey($pid)) { $Products[$pid] } else { $null }

        if ($product -and $pid -ne 'contact') {
            $UserStates[$userId] = @{ step='ask_name'; product=$product; pid=$pid }
            Send-Message $chatId "👋 Вітаємо в <b>Кінезіс</b>!`n`nВи хочете замовити:`n📦 <b>$product</b>`n`nВведіть ваше <b>ім'я</b>:"
        } else {
            $UserStates[$userId] = @{ step='main' }
            $kb = '{"inline_keyboard":[[{"text":"🛒 Відкрити каталог","url":"https://nastyazakharina.github.io/kinezis/catalog.html"}],[{"text":"📞 Вікторія","url":"tel:+380936246000"},{"text":"📞 Андрій","url":"tel:+380992662688"}]]}'
            $body = @{ chat_id=$chatId; text="👋 Вітаємо в боті <b>Кінезіс</b>!`n`n🏥 Реабілітаційне обладнання українського виробництва:`n• Тренажери МТБ (система Бубновського)`n• Масажні столи та стільці`n• Реабілітаційні лавки та гіперекстензії`n• Паралельні бруси та сходи`n`nОберіть дію:"; parse_mode="HTML"; reply_markup=$kb }
            Invoke-RestMethod -Uri "$API/sendMessage" -Method POST -Body $body | Out-Null
        }
        return
    }

    # ── Кроки замовлення ──
    switch ($state.step) {
        'ask_name' {
            $state.name = $text.Trim()
            $state.step = 'ask_phone'
            $kb = '{"keyboard":[[{"text":"📱 Поділитися номером","request_contact":true}]],"resize_keyboard":true,"one_time_keyboard":true}'
            $body = @{ chat_id=$chatId; text="Дякуємо, <b>$($state.name)</b>! 👍`n`nВведіть ваш <b>номер телефону</b> або натисніть кнопку:"; parse_mode="HTML"; reply_markup=$kb }
            Invoke-RestMethod -Uri "$API/sendMessage" -Method POST -Body $body | Out-Null
        }
        'ask_phone' {
            $phone = if ($msg.contact) { $msg.contact.phone_number } else { $text.Trim() }
            $state.phone = $phone
            $state.step = 'ask_comment'
            $kb = '{"keyboard":[[{"text":"Пропустити"}]],"resize_keyboard":true,"one_time_keyboard":true}'
            $body = @{ chat_id=$chatId; text="Є питання або побажання? Або натисніть <b>Пропустити</b>:"; parse_mode="HTML"; reply_markup=$kb }
            Invoke-RestMethod -Uri "$API/sendMessage" -Method POST -Body $body | Out-Null
        }
        'ask_comment' {
            $state.comment = if ($text -eq 'Пропустити') { 'немає' } else { $text.Trim() }
            $state.username = $uname
            $state.user_id  = $userId
            Notify-Managers $state
            $kb = '{"keyboard":[[{"text":"🛒 Каталог товарів"}],[{"text":"📞 Контакти"},{"text":"❓ Допомога"}]],"resize_keyboard":true}'
            $body = @{ chat_id=$chatId; text="✅ <b>Замовлення прийнято!</b>`n`n📦 $($state.product)`n`nМенеджер зв`'яжеться з вами найближчим часом.`n`n📞 Вікторія: +38 (093) 624-60-00`n📞 Андрій: +38 (099) 266-26-88`n`nДякуємо, що обрали <b>Кінезіс</b>! 💚"; parse_mode="HTML"; reply_markup=$kb }
            Invoke-RestMethod -Uri "$API/sendMessage" -Method POST -Body $body | Out-Null
            $UserStates[$userId] = @{ step='main' }
        }
        default {
            $tl = $text.ToLower()
            if ($tl -match 'каталог') {
                $kb = '{"inline_keyboard":[[{"text":"🌐 Відкрити каталог","url":"https://nastyazakharina.github.io/kinezis/catalog.html"}]]}'
                $body = @{ chat_id=$chatId; text="Переглядайте наш каталог:"; reply_markup=$kb }
                Invoke-RestMethod -Uri "$API/sendMessage" -Method POST -Body $body | Out-Null
            } elseif ($tl -match 'контакт|телефон') {
                Send-Message $chatId "📞 <b>Контакти Кінезіс:</b>`n`n👩 Вікторія: +38 (093) 624-60-00`n👨 Андрій: +38 (099) 266-26-88`n📧 sport_ok@ukr.net"
            } elseif ($tl -match 'допомог') {
                Send-Message $chatId "ℹ️ <b>Як замовити:</b>`n`n1️⃣ Зайдіть на kinezis.com.ua`n2️⃣ Оберіть товар → «Замовити»`n3️⃣ Введіть ім`'я та телефон тут`n4️⃣ Менеджер підтвердить замовлення`n`n📦 Доставка: Нова Пошта або Укрпошта"
            } else {
                $kb = '{"inline_keyboard":[[{"text":"🛒 Переглянути каталог","url":"https://nastyazakharina.github.io/kinezis/catalog.html"}]]}'
                $body = @{ chat_id=$chatId; text="Вітаємо! Я бот Кінезіс 🤖 Переглядайте каталог і замовляйте прямо тут."; reply_markup=$kb }
                Invoke-RestMethod -Uri "$API/sendMessage" -Method POST -Body $body | Out-Null
            }
        }
    }
}

# ── ГОЛОВНИЙ ЦИКЛ ──
Write-Host "✅ Бот @Kineziss_bot запущено!" -ForegroundColor Green
$managers = Get-Managers
if ($managers.Count -eq 0) {
    Write-Host "⚠️  Менеджерів ще немає." -ForegroundColor Yellow
    Write-Host "   Вікторія та Андрій мають написати боту: /addmanager $ADMIN_PASS" -ForegroundColor Yellow
} else {
    Write-Host "👥 Менеджери: $($managers -join ', ')" -ForegroundColor Cyan
}
Write-Host "Очікую замовлення... (Ctrl+C для зупинки)" -ForegroundColor Gray

$offset = 0
while ($true) {
    try {
        $resp = Invoke-RestMethod -Uri "$API/getUpdates" -Method GET `
            -Body @{ offset=$offset; timeout=25; allowed_updates='["message"]' } `
            -TimeoutSec 30 -ErrorAction Stop
        if ($resp.ok -and $resp.result) {
            foreach ($upd in $resp.result) {
                Handle-Update $upd
                $offset = $upd.update_id + 1
            }
        }
    } catch {
        Write-Host "Помилка з'єднання: $_ — повтор через 5 сек..." -ForegroundColor Yellow
        Start-Sleep 5
    }
}

