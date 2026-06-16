# Telegram-bot Kinezis (@Kineziss_bot)
$TOKEN   = "8873990753:AAHmzAkTR64xftJytnWqaMf-H7PqVEKC6tc"
$API     = "https://api.telegram.org/bot$TOKEN"
$MgrFile = "C:\Users\user\Kinezis\telegram_bot\managers.json"
$PASS    = "kinezis2024"
$SITE    = "https://nastyazakharina.github.io/kinezis"

$Products = @{
    mtb1              = "Тренажер МТБ-1 (домашній)"
    "mtv1-40"         = "Тренажер МТВ-1 (профіль 40×40)"
    "mtv1-reg"        = "Тренажер МТВ-1 з регульованим блоком"
    "mtb1-prof"       = "Тренажер МТБ-1 Проф (профіль 60×60)"
    "mtb1-shvedska"   = "Тренажер МТБ зі шведською стінкою"
    mtb2              = "Тренажер МТБ-2 (профіль 60×60)"
    "mtb2-40"         = "Тренажер МТБ-2 (профіль 40×40)"
    "mtv2-reg"        = "Тренажер МТВ-2 з регульованим блоком"
    mtb4              = "Тренажер МТБ-4 (профіль 60×60)"
    "mtb4-reg"        = "Тренажер МТБ-4 з регульованим блоком"
    mtv070            = "Універсальна кабіна МТВ-070"
    mtb601            = "Тренажер МТБ-601"
    mtb801            = "Тренажер МТБ-801 (посилений)"
    "mtb-child"       = "Тренажер МТБ дитячий"
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
    "Як зробити замовлення" = "Оберіть товар у каталозі на сайті та натисніть Замовити. Бот проведе вас через оформлення, менеджер зателефонує для підтвердження."
    "Яка доставка" = "Доставка по всій Україні Новою Поштою або Укрпоштою. Термін: 1-3 дні після відправки. Вартість доставки за тарифами перевізника."
    "Яка гарантія" = "На все обладнання надається гарантія 12 місяців. Гарантія покриває виробничі дефекти. Ми українські виробники і несемо повну відповідальність за якість."
    "Чи можна повернути товар" = "Так, протягом 14 днів з моменту отримання, якщо товар не використовувався та збережена упаковка. Зворотна доставка за рахунок покупця."
    "Як вибрати тренажер МТБ" = "МТБ-1 - для дому (1 блок), МТБ-2 - розширений (2 блоки), МТБ-4 - для клінік (4 блоки), МТБ-601/801 - посилені версії. Не впевнені? Напишіть нам, підберемо разом!"
    "Де ви знаходитесь" = "Ми знаходимось у м. Чернігів, але працюємо по всій Україні через Нову Пошту та Укрпошту. Самовивіз можливий за домовленістю."
    "Як оплатити" = "Оплата після отримання товару (накладений платіж) або передоплата на картку ПриватБанку/Монобанку. Безготівкова оплата для юридичних осіб."
    "Контакти" = "Вікторія: +38 093 624-60-00`nАндрій: +38 099 266-26-88`nEmail: sport_ok@ukr.net`nРежим роботи: Пн-Сб 9:00-21:00"
}

function loadMgr { if (Test-Path $MgrFile) { return @(Get-Content $MgrFile -Raw | ConvertFrom-Json) }; return @() }
function saveMgr($ids) { $ids | ConvertTo-Json | Set-Content $MgrFile -Encoding utf8 }

function tg($chatId, $text) {
    $b = @{ chat_id = $chatId; text = $text }
    try { Invoke-RestMethod "$API/sendMessage" -Method POST -Body $b -TimeoutSec 10 | Out-Null }
    catch { Write-Host "sendMessage error: $($_.Exception.Message)" }
}

function tgBtn($chatId, $text, $markup) {
    $b = @{ chat_id = $chatId; text = $text; reply_markup = $markup }
    try { Invoke-RestMethod "$API/sendMessage" -Method POST -Body $b -TimeoutSec 10 | Out-Null }
    catch { Write-Host "tgBtn error: $($_.Exception.Message)" }
}

function mainMenu($cid) {
    $kb = "{`"keyboard`":[[{`"text`":`"Каталог товарів`"},{`"text`":`"Часті питання`"}],[{`"text`":`"Доставка та оплата`"},{`"text`":`"Гарантія`"}],[{`"text`":`"Контакти`"},{`"text`":`"Зробити замовлення`"}]],`"resize_keyboard`":true}"
    tgBtn $cid "Вітаємо у боті Кінезіс! Оберіть що вас цікавить:" $kb
}

function faqMenu($cid) {
    $kb = "{`"keyboard`":[[{`"text`":`"Як зробити замовлення`"},{`"text`":`"Яка доставка`"}],[{`"text`":`"Яка гарантія`"},{`"text`":`"Чи можна повернути товар`"}],[{`"text`":`"Як вибрати тренажер МТБ`"},{`"text`":`"Як оплатити`"}],[{`"text`":`"Де ви знаходитесь`"},{`"text`":`"Назад`"}]],`"resize_keyboard`":true}"
    tgBtn $cid "Оберіть питання:" $kb
}

function notify($o) {
    $mgrs = loadMgr
    if ($mgrs.Count -eq 0) { Write-Host "Немає менеджерів!" -ForegroundColor Yellow; return }
    $now = Get-Date -Format "dd.MM.yyyy HH:mm"
    $ulink = if ($o.uname) { " | @$($o.uname)" } else { "" }
    $txt = "НОВЕ ЗАМОВЛЕННЯ з kinezis.com.ua!" + "`n`n"
    $txt += "Товар: $($o.product)" + "`n"
    $txt += "Імя: $($o.name)" + "`n"
    $txt += "Телефон: $($o.phone)" + "`n"
    $txt += "Коментар: $($o.comment)" + "`n"
    $txt += "Час: $now$ulink"
    $btn = "{`"inline_keyboard`":[[{`"text`":`"Написати покупцю`",`"url`":`"tg://user?id=$($o.uid)`"}]]}"
    foreach ($mid in $mgrs) {
        $b = @{ chat_id = $mid; text = $txt; reply_markup = $btn }
        try { Invoke-RestMethod "$API/sendMessage" -Method POST -Body $b -TimeoutSec 10 | Out-Null }
        catch { Write-Host "Помилка сповіщення $mid" }
    }
}

function handle($upd) {
    $msg = $upd.message
    if (-not $msg) { return }
    $cid   = $msg.chat.id
    $uid   = $msg.from.id
    $txt   = if ($msg.text) { $msg.text } else { "" }
    $uname = $msg.from.username
    if (-not $States.ContainsKey($uid)) { $States[$uid] = "main" }

    # /addmanager
    if ($txt -match "^/addmanager\s+(.+)$") {
        if ($Matches[1].Trim() -eq $PASS) {
            $mgrs = [System.Collections.ArrayList]@(loadMgr)
            if ($mgrs -notcontains $uid) { $mgrs.Add($uid) | Out-Null; saveMgr $mgrs }
            tg $cid "Вас додано як менеджера! ID: $uid. Тепер ви отримуватимете замовлення."
        } else { tg $cid "Неправильний пароль." }
        return
    }

    # /start
    if ($txt -match "^/start") {
        $parts = $txt -split " "
        $prodId = if ($parts.Count -gt 1) { $parts[1] } else { "" }
        $prod = if ($Products.ContainsKey($prodId)) { $Products[$prodId] } else { $null }
        if ($prod -and $prodId -ne "contact") {
            $States[$uid] = "ask_name|$prod"
            tg $cid "Вітаємо в Кінезіс! Ви обрали: $prod`n`nВведіть ваше імя:"
        } else {
            $States[$uid] = "main"
            mainMenu $cid
        }
        return
    }

    $state = $States[$uid]

    # Order flow
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
        $comment = if ($txt -eq "Пропустити") { "немає" } else { $txt }
        notify @{ product=$prod; name=$name; phone=$phone; comment=$comment; uid=$uid; uname=$uname }
        $States[$uid] = "main"
        tg $cid "Замовлення прийнято! Менеджер звяжеться найближчим часом.`nВікторія: +38 093 624-60-00`nАндрій: +38 099 266-26-88`nДякуємо що обрали Кінезіс!"
        mainMenu $cid
        return
    }

    # Menu buttons
    if ($txt -eq "Назад") { $States[$uid] = "main"; mainMenu $cid; return }

    if ($txt -eq "Каталог товарів") {
        $kb = "{`"inline_keyboard`":[[{`"text`":`"Відкрити каталог`",`"url`":`"$SITE/catalog.html`"}]]}"
        tgBtn $cid "Переглядайте весь асортимент на сайті:" $kb
        return
    }

    if ($txt -eq "Часті питання") { faqMenu $cid; return }

    if ($txt -eq "Зробити замовлення") {
        $kb = "{`"inline_keyboard`":[[{`"text`":`"Відкрити каталог`",`"url`":`"$SITE/catalog.html`"}]]}"
        tgBtn $cid "Перейдіть до каталогу, оберіть товар і натисніть Замовити - бот оформить все автоматично:" $kb
        return
    }

    if ($txt -eq "Доставка та оплата") {
        tg $cid "Доставка по всій Украіні Новою Поштою або Укрпоштою (1-3 дні).`n`nОплата:`n- Накладений платіж (після отримання)`n- Передоплата на картку ПриватБанк / Монобанк`n- Безготівкова оплата для юросіб"
        return
    }

    if ($txt -eq "Гарантія") {
        tg $cid "Гарантія 12 місяців на все обладнання.`nПовернення протягом 14 днів (якщо товар не використовувався).`nМи украінські виробники і несемо повну відповідальність за якість."
        return
    }

    if ($txt -eq "Контакти") {
        tg $cid "Вікторія: +38 093 624-60-00`nАндрій: +38 099 266-26-88`nEmail: sport_ok@ukr.net`nРежим роботи: Пн-Сб 9:00-21:00`nm.Chernihiv, Украіна"
        return
    }

    # FAQ answers
    foreach ($key in $FAQ.Keys) {
        if ($txt -eq $key) {
            tg $cid $FAQ[$key]
            return
        }
    }

    # Default
    $States[$uid] = "main"
    mainMenu $cid
}

Write-Host "Бот @Kineziss_bot запущений!" -ForegroundColor Green
Write-Host "Менеджери: $(loadMgr)" -ForegroundColor Cyan
Write-Host "Очікування повідомлень... (Ctrl+C для зупинки)" -ForegroundColor Gray

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
                Write-Host "$(Get-Date -Format 'HH:mm:ss') update $($upd.update_id)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "Помилка: $($_.Exception.Message) - повтор через 5с" -ForegroundColor Yellow
        Start-Sleep 5
    }
}