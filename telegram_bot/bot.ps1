# Telegram-bot Kinezis (@Kineziss_bot)
$TOKEN      = "8873990753:AAHmzAkTR64xftJytnWqaMf-H7PqVEKC6tc"
$API        = "https://api.telegram.org/bot$TOKEN"
$DIR        = "C:\Users\user\Kinezis\telegram_bot"
$MgrFile    = "$DIR\managers.json"
$OrdersFile = "$DIR\orders.csv"   # всі замовлення для ремаркетингу
$MapFile    = "$DIR\user_map.json" # forwarded_msg_id -> user_id (для відповідей)
$PASS       = "kinezis2024"
$SITE       = "https://nastyazakharina.github.io/kinezis"

$Products = @{
    mtb1              = "Тренажер МТБ-1 зі шведською стінкою"
    "mtv1-40"         = "Тренажер МТВ-1 (профіль 40×40)"
    "mtv1-reg"        = "Тренажер МТВ-1 з регульованим блоком"
    "mtb1-prof"       = "Тренажер МТБ-1 Проф з регульованим блоком"
    "mtb1-shvedska"   = "Тренажер Бубновського зі шведською стінкою"
    mtb2              = "Тренажер МТБ-2 (профіль 60×60)"
    "mtb2-40"         = "Тренажер МТБ-2 (профіль 40×40)"
    "mtv2-reg"        = "Тренажер МТВ-2 з регульованим блоком"
    mtb4              = "Тренажер МТБ-4 (профіль 60×60)"
    "mtb4-reg"        = "Тренажер МТБ-4 з регульованим блоком"
    mtv070            = "Універсальна кабіна МТВ-070"
    bench1            = "Лавка реабілітаційна складна MTB-31"
    "bench-mtb30"     = "Лавка реабілітаційна пряма MTB-30"
    "bench-vitjag"    = "Лавка для витягування хребта MTB-009"
    hyperext1         = "Гіперекстензія домашня SW-301"
    "bench-sw300"     = "Лавка для преса SW-300"
    "bench-sw303"     = "Лавка атлетична SW-303"
    "bench-sw308"     = "Лавка профі SW-308"
    "bench-roman"     = "Римський стілець SVS-112"
    "bench-svs113"    = "Римський стілець регульований SVS-113"
    "bench-svs119"    = "Гіперекстензія горизонтальна SVS-119"
    "bench-svs127"    = "Гіперекстензія зворотна SVS-127"
    "bench-svs108"    = "Гіперекстензія регульована SVS-108"
    "bench-svs145"    = "Лавка регульована SVS-145"
    massage1          = "Масажний стіл складний MTB-051"
    massage2          = "Масажний стіл стаціонарний MTB-050"
    "massage-chair"   = "Масажний стілець MTB-052"
    bars1             = "Паралельні бруси MTB-016"
    "bars-mtb018"     = "Бруси з перешкодами MTB-018"
    "bars-mtb019"     = "Бруси дитячі MTB-019"
    "bars-mtb020"     = "Бруси з перешкодами MTB-020"
    stairs1           = "Реабілітаційні сходи MTB-029"
    "stairs-mtb028"   = "Сходи з рампою MTB-028"
    "stairs-mtb033"   = "Сходи кутові MTB-033"
    "acc-handles"     = "Ручка для тяги 46 см MTB-21"
    "acc-carabiner"   = "Ланцюг-подовжувач MTB-16"
    mtb10             = "Манжети м'які MTB-10"
    mtb11             = "Манжети дитячі MTB-11"
    mtb12             = "Манжети жорсткі MTB-12"
    mtb13             = "Сандал реабілітаційний MTB-13"
    mtb14             = "Сандал дитячий MTB-14"
    mtb15             = "Петля м'яка MTB-15"
    mtb17             = "Ручка закрита MTB-17"
    mtb18             = "Ручка закрита м'яка MTB-18"
    mtb19             = "Ручка для тяги 120 см MTB-19"
    mtb20             = "Ручка (внутрішній хват) MTB-20"
    mtb26             = "Ручка на трицепс MTB-26"
    mtb27             = "Подовжувач м'який MTB-27"
    balance           = "Балансувальна дошка"
    contact           = "Консультація"
}

$States = @{}

$FAQ = @{
    "Як зробити замовлення"    = "Оберіть товар у каталозі на сайті та натисніть Замовити. Бот проведе через оформлення, менеджер зателефонує для підтвердження."
    "Яка доставка"             = "Доставка по всій Україні Новою Поштою або Укрпоштою. Термін: 2–5 робочих днів після відправки. Вартість за тарифами перевізника."
    "Яка гарантія"             = "На все обладнання надається гарантія 12 місяців. Запасні частини доступні протягом 5 років."
    "Чи можна повернути товар" = "Так, протягом 14 днів з моменту отримання, якщо товар не використовувався та збережена упаковка."
    "Як вибрати тренажер МТБ" = "МТБ-1 — для дому (1 блок), МТБ-2 — розширений (2 блоки), МТБ-4 — для клінік (4 блоки). Не впевнені? Напишіть — підберемо разом!"
    "Де ви знаходитесь"       = "м. Чернігів, але працюємо по всій Україні через Нову Пошту та Укрпошту. Самовивіз — за домовленістю."
    "Як оплатити"              = "Накладений платіж (після отримання) або передоплата на картку ПриватБанку / Монобанку. Безготівкова оплата для юридичних осіб."
    "Контакти"                 = "📞 Вікторія: +38 093 624-60-00`n📞 Андрій: +38 099 266-26-88`n📧 sport_ok@ukr.net`n🕐 Пн–Пт: 9:00–18:00, Сб: 10:00–15:00, Нд: вихідний"
}

# ── Helpers ──────────────────────────────────────────────────────────────────

function loadMgr { if (Test-Path $MgrFile) { return @(Get-Content $MgrFile -Raw | ConvertFrom-Json) }; return @() }
function saveMgr($ids) { $ids | ConvertTo-Json | Set-Content $MgrFile -Encoding utf8 }

function isWorkingHours {
    $now    = Get-Date
    $hour   = $now.Hour
    $minute = $now.Minute
    $day    = $now.DayOfWeek   # 0=Sunday, 1=Monday ... 6=Saturday
    $time   = $hour + $minute / 60.0
    if ($day -eq 0) { return $false }                        # неділя — вихідний
    if ($day -ge 1 -and $day -le 5) { return $time -ge 9 -and $time -lt 18 }  # Пн–Пт 9–18
    if ($day -eq 6) { return $time -ge 10 -and $time -lt 15 }                 # Сб 10–15
    return $false
}

function greetingText($firstName) {
    $name = if ($firstName) { ", $firstName" } else { "" }
    if (isWorkingHours) {
        return "Доброго дня$name! Вас вітає магазин Кінезіс 👋 Ми онлайн і готові допомогти. Оберіть що вас цікавить:"
    } else {
        return ("Доброго дня$name! Вас вітає магазин Кінезіс.`n`n" +
                "Зараз ми не в мережі — відповідаємо:`n" +
                "🕐 Пн–Пт: 9:00–18:00`n🕐 Сб: 10:00–15:00`n`n" +
                "Залиште питання — менеджер відповість у найближчий робочий час. Оберіть що вас цікавить:")
    }
}

function loadMap {
    if (Test-Path $MapFile) { return (Get-Content $MapFile -Raw | ConvertFrom-Json) }
    return [PSCustomObject]@{}
}
function saveMap($map) { $map | ConvertTo-Json | Set-Content $MapFile -Encoding utf8 }

function saveOrder($o) {
    # Зберігаємо кожне замовлення в CSV для ремаркетингу
    if (-not (Test-Path $OrdersFile)) {
        "Дата,Товар,Ім'я,Телефон,Telegram_ID,Telegram_Username,Коментар" | Set-Content $OrdersFile -Encoding utf8
    }
    $now  = Get-Date -Format "dd.MM.yyyy HH:mm"
    $uname = if ($o.uname) { "@$($o.uname)" } else { "" }
    $line = "`"$now`",`"$($o.product)`",`"$($o.name)`",`"$($o.phone)`",`"$($o.uid)`",`"$uname`",`"$($o.comment)`""
    $line | Add-Content $OrdersFile -Encoding utf8
    Write-Host "Замовлення збережено: $($o.name) - $($o.product)" -ForegroundColor Cyan
}

function tg($chatId, $text) {
    $b = @{ chat_id = $chatId; text = $text }
    try { return Invoke-RestMethod "$API/sendMessage" -Method POST -Body $b -TimeoutSec 10 }
    catch { Write-Host "sendMessage error: $($_.Exception.Message)"; return $null }
}

function tgBtn($chatId, $text, $markup) {
    $b = @{ chat_id = $chatId; text = $text; reply_markup = $markup }
    try { return Invoke-RestMethod "$API/sendMessage" -Method POST -Body $b -TimeoutSec 10 }
    catch { Write-Host "tgBtn error: $($_.Exception.Message)"; return $null }
}

function mainMenu($cid) { mainMenuWithText $cid "Оберіть що вас цікавить:" }
function mainMenuWithText($cid, $text) {
    $kb = "{`"keyboard`":[[{`"text`":`"Каталог товарів`"},{`"text`":`"Часті питання`"}],[{`"text`":`"Доставка та оплата`"},{`"text`":`"Гарантія`"}],[{`"text`":`"Контакти`"},{`"text`":`"Зробити замовлення`"}]],`"resize_keyboard`":true}"
    tgBtn $cid $text $kb
}

function faqMenu($cid) {
    $kb = "{`"keyboard`":[[{`"text`":`"Як зробити замовлення`"},{`"text`":`"Яка доставка`"}],[{`"text`":`"Яка гарантія`"},{`"text`":`"Чи можна повернути товар`"}],[{`"text`":`"Як вибрати тренажер МТБ`"},{`"text`":`"Як оплатити`"}],[{`"text`":`"Де ви знаходитесь`"},{`"text`":`"Назад`"}]],`"resize_keyboard`":true}"
    tgBtn $cid "Оберіть питання:" $kb
}

function notifyOrder($o) {
    # Повідомлення менеджерам про нове замовлення
    $mgrs = loadMgr
    if ($mgrs.Count -eq 0) { Write-Host "Немає менеджерів!" -ForegroundColor Yellow; return }
    $now   = Get-Date -Format "dd.MM.yyyy HH:mm"
    $uinfo = if ($o.uname) { "@$($o.uname)" } else { "ID: $($o.uid)" }
    $txt   = "НОВЕ ЗАМОВЛЕННЯ!`n`nТовар: $($o.product)`nІм'я: $($o.name)`nТелефон: $($o.phone)`nКоментар: $($o.comment)`nКлієнт: $uinfo`nЧас: $now"
    $btn   = "{`"inline_keyboard`":[[{`"text`":`"✍️ Написати клієнту`",`"url`":`"tg://user?id=$($o.uid)`"}]]}"
    foreach ($mid in $mgrs) {
        $b = @{ chat_id = $mid; text = $txt; reply_markup = $btn }
        try { Invoke-RestMethod "$API/sendMessage" -Method POST -Body $b -TimeoutSec 10 | Out-Null }
        catch { Write-Host "Помилка сповіщення $mid" }
    }
}

function forwardToManagers($fromUid, $fromUname, $text) {
    # Пересилаємо незрозуміле повідомлення менеджерам з інструкцією як відповісти
    $mgrs = loadMgr
    if ($mgrs.Count -eq 0) { return }
    $uinfo = if ($fromUname) { "@$fromUname" } else { "ID: $fromUid" }
    $txt   = "❓ ПИТАННЯ від клієнта ($uinfo):`n`n$text`n`n💬 Щоб відповісти — зробіть REPLY на це повідомлення"
    $map   = loadMap
    foreach ($mid in $mgrs) {
        $b = @{ chat_id = $mid; text = $txt }
        try {
            $res = Invoke-RestMethod "$API/sendMessage" -Method POST -Body $b -TimeoutSec 10
            if ($res.ok) {
                # Зберігаємо: forwarded_msg_id -> original_user_id
                $key = "$mid`_$($res.result.message_id)"
                $map | Add-Member -NotePropertyName $key -NotePropertyValue $fromUid -Force
            }
        } catch { Write-Host "Помилка пересилання $mid" }
    }
    saveMap $map
}

# ── Main handler ─────────────────────────────────────────────────────────────

function handle($upd) {
    $msg = $upd.message
    if (-not $msg) { return }
    $cid   = $msg.chat.id
    $uid   = $msg.from.id
    $txt   = if ($msg.text) { $msg.text } else { "" }
    $uname = $msg.from.username
    if (-not $States.ContainsKey($uid)) { $States[$uid] = "main" }

    # ── Менеджер відповідає клієнту через reply ───────────────────────────────
    $mgrs = loadMgr
    if ($mgrs -contains $uid -and $msg.reply_to_message) {
        $replyToId = $msg.reply_to_message.message_id
        $map = loadMap
        $key = "$uid`_$replyToId"
        $targetUserId = $map.$key
        if ($targetUserId) {
            $mgrName = if ($msg.from.first_name) { $msg.from.first_name } else { "Менеджер" }
            # Відправляємо відповідь клієнту з ім'ям менеджера
            tg $targetUserId "💬 $mgrName з Кінезіс відповідає:`n`n$txt"
            tg $cid "✅ Відповідь надіслано клієнту"
            # Сповіщаємо решту менеджерів що вже відповіли
            foreach ($mid in $mgrs) {
                if ($mid -ne $uid) {
                    tg $mid "ℹ️ $mgrName вже відповів цьому клієнту."
                }
            }
            return
        }
    }

    # /addmanager <password>
    if ($txt -match "^/addmanager\s+(.+)$") {
        if ($Matches[1].Trim() -eq $PASS) {
            $mgrList = [System.Collections.ArrayList]@(loadMgr)
            if ($mgrList -notcontains $uid) { $mgrList.Add($uid) | Out-Null; saveMgr $mgrList }
            tg $cid "✅ Вас додано як менеджера! ID: $uid`nТепер ви отримуватимете:`n• Замовлення з сайту`n• Питання від клієнтів (відповідайте через Reply)"
        } else { tg $cid "❌ Неправильний пароль." }
        return
    }

    # /listorders — показати кількість замовлень
    if ($txt -eq "/listorders" -and $mgrs -contains $uid) {
        if (Test-Path $OrdersFile) {
            $count = (Get-Content $OrdersFile).Count - 1  # мінус заголовок
            tg $cid "📊 Всього замовлень збережено: $count`nФайл: $OrdersFile"
        } else { tg $cid "Замовлень ще немає." }
        return
    }

    # /start [product_id]
    if ($txt -match "^/start") {
        $parts     = $txt -split " "
        $prodId    = if ($parts.Count -gt 1) { $parts[1] } else { "" }
        $prod      = if ($Products.ContainsKey($prodId)) { $Products[$prodId] } else { $null }
        $firstName = $msg.from.first_name
        if ($prod -and $prodId -ne "contact") {
            $States[$uid] = "ask_name|$prod"
            $greeting = if (isWorkingHours) { "Доброго дня! Вас вітає магазин Кінезіс 👋" } else { "Доброго дня! Вас вітає магазин Кінезіс." }
            tg $cid "$greeting`n`nВи обрали: $prod`n`nВведіть ваше ім'я:"
        } else {
            $States[$uid] = "main"
            mainMenuWithText $cid (greetingText $firstName)
        }
        return
    }

    $state = $States[$uid]

    # ── Флоу замовлення ───────────────────────────────────────────────────────

    if ($state -match "^ask_name\|(.+)$") {
        $prod = $Matches[1]
        $States[$uid] = "ask_phone|$prod|$($txt.Trim())"
        $kb = "{`"keyboard`":[[{`"text`":`"Поділитися номером`",`"request_contact`":true}]],`"resize_keyboard`":true,`"one_time_keyboard`":true}"
        tgBtn $cid "Дякую, $($txt.Trim())! Введіть номер телефону або натисніть кнопку:" $kb
        return
    }

    if ($state -match "^ask_phone\|(.+)\|(.+)$") {
        $prod = $Matches[1]; $name = $Matches[2]
        $phone = if ($msg.contact) { $msg.contact.phone_number } else { $txt.Trim() }
        $States[$uid] = "ask_comment|$prod|$name|$phone"
        $kb = "{`"keyboard`":[[{`"text`":`"Пропустити`"}]],`"resize_keyboard`":true,`"one_time_keyboard`":true}"
        tgBtn $cid "Є питання або побажання? Напишіть або натисніть Пропустити:" $kb
        return
    }

    if ($state -match "^ask_comment\|(.+)\|(.+)\|(.+)$") {
        $prod = $Matches[1]; $name = $Matches[2]; $phone = $Matches[3]
        $comment = if ($txt -eq "Пропустити") { "—" } else { $txt }
        $order = @{ product=$prod; name=$name; phone=$phone; comment=$comment; uid=$uid; uname=$uname }
        saveOrder $order       # зберегти у файл
        notifyOrder $order     # сповістити менеджерів
        $States[$uid] = "main"
        tg $cid "✅ Замовлення прийнято! Менеджер зв'яжеться найближчим часом.`n`nВікторія: +38 093 624-60-00`nАндрій: +38 099 266-26-88`n`nДякуємо що обрали Кінезіс!"
        mainMenu $cid
        return
    }

    # ── Кнопки меню ───────────────────────────────────────────────────────────

    if ($txt -eq "Назад") { $States[$uid] = "main"; mainMenu $cid; return }

    if ($txt -eq "Каталог товарів") {
        $kb = "{`"inline_keyboard`":[[{`"text`":`"Відкрити каталог`",`"url`":`"$SITE/catalog.html`"}]]}"
        tgBtn $cid "Переглядайте весь асортимент на сайті:" $kb
        return
    }

    if ($txt -eq "Часті питання") { faqMenu $cid; return }

    if ($txt -eq "Зробити замовлення") {
        $kb = "{`"inline_keyboard`":[[{`"text`":`"Відкрити каталог`",`"url`":`"$SITE/catalog.html`"}]]}"
        tgBtn $cid "Перейдіть до каталогу, оберіть товар і натисніть Замовити — бот оформить все автоматично:" $kb
        return
    }

    if ($txt -eq "Доставка та оплата") {
        tg $cid "🚚 Доставка по всій Україні Новою Поштою або Укрпоштою (1–3 дні).`n`n💳 Оплата:`n• Накладений платіж (після отримання)`n• Передоплата на картку ПриватБанк / Монобанк`n• Безготівкова оплата для юридичних осіб"
        return
    }

    if ($txt -eq "Гарантія") {
        tg $cid "🛡️ Гарантія 12 місяців на все обладнання.`nПовернення протягом 14 днів (якщо товар не використовувався).`nМи несемо повну відповідальність за якість."
        return
    }

    if ($txt -eq "Контакти") {
        tg $cid "📞 Вікторія: +38 093 624-60-00`n📞 Андрій: +38 099 266-26-88`n📧 sport_ok@ukr.net`n🕐 Пн–Сб 9:00–21:00`n📍 м. Чернігів"
        return
    }

    # ── FAQ відповіді ──────────────────────────────────────────────────────────

    foreach ($key in $FAQ.Keys) {
        if ($txt -eq $key) { tg $cid $FAQ[$key]; return }
    }

    # ── Невідоме повідомлення: пересилаємо менеджерам + відповідаємо клієнту ─

    $States[$uid] = "main"
    if ($txt -and $txt.Length -gt 0) {
        forwardToManagers $uid $uname $txt
        if (isWorkingHours) {
            tg $cid ("Дякуємо за питання! Менеджер побачить його і відповість найближчим часом.`n`n" +
                     "Або телефонуйте прямо зараз:`n📞 +38 093 624-60-00 — Вікторія`n📞 +38 099 266-26-88 — Андрій")
        } else {
            tg $cid ("Дякуємо за звернення! Зараз ми не в мережі.`n`n" +
                     "Відповідаємо: Пн–Пт 9:00–18:00, Сб 10:00–15:00.`n" +
                     "Менеджер відповість як тільки розпочне роботу.`n`n" +
                     "Хочете щоб ми передзвонили? Залиште номер телефону наступним повідомленням 👇`n`n" +
                     "Або телефонуйте: 📞 +38 093 624-60-00")
        }
    }
    mainMenu $cid
}

# ── Запуск ────────────────────────────────────────────────────────────────────

Write-Host "Бот @Kineziss_bot запущений!" -ForegroundColor Green
Write-Host "Менеджери: $(loadMgr | ConvertTo-Json -Compress)" -ForegroundColor Cyan
Write-Host "Файл замовлень: $OrdersFile" -ForegroundColor Cyan
Write-Host "Очікування повідомлень... (Ctrl+C для зупинки)" -ForegroundColor Gray
Write-Host ""
Write-Host "Щоб зареєструватись менеджером — надішліть боту:" -ForegroundColor Yellow
Write-Host "  /addmanager $PASS" -ForegroundColor Yellow

$offset = 0
while ($true) {
    try {
        $r = Invoke-RestMethod "$API/getUpdates" -Method GET `
            -Body @{ offset=$offset; timeout=20; allowed_updates='["message"]' } `
            -TimeoutSec 30
        if ($r.ok -and $r.result.Count -gt 0) {
            foreach ($upd in $r.result) {
                handle $upd
                $offset = $upd.update_id + 1
                Write-Host "$(Get-Date -Format 'HH:mm:ss') msg від $($upd.message.from.first_name): $($upd.message.text)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "Помилка: $($_.Exception.Message) — повтор через 5с" -ForegroundColor Yellow
        Start-Sleep 5
    }
}
