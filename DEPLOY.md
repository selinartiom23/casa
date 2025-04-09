# Инструкция по развертыванию на VPS

## Системные требования

- Ubuntu 20.04 LTS или Ubuntu 22.04 LTS
- Минимум 1 ГБ RAM
- Минимум 10 ГБ дискового пространства
- Статический IP-адрес
- Доступ к root или sudo правам

## Подготовка VPS

1. Подключитесь к вашему VPS через SSH:
```bash
ssh username@your-server-ip
```

2. Проверьте версию Ubuntu:
```bash
lsb_release -a
```

3. Сделайте скрипт исполняемым:
```bash
chmod +x setup.sh
```

4. Запустите скрипт установки:
```bash
./setup.sh
```

## Настройка домена

1. Настройте DNS записи для вашего домена:
   - A запись: @ -> IP вашего VPS
   - CNAME запись: www -> ваш домен

2. Замените `your-domain.com` в конфигурации Nginx на ваш реальный домен:
```bash
sudo nano /etc/nginx/sites-available/ton-exchange
```

3. Перезапустите Nginx:
```bash
sudo systemctl restart nginx
```

## Настройка SSL (HTTPS)

1. Установите Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

2. Получите SSL сертификат:
```bash
sudo certbot --nginx -d your-domain.com
```

## Управление приложением

1. Просмотр статуса приложения:
```bash
pm2 status
```

2. Просмотр логов:
```bash
pm2 logs ton-exchange
```

3. Перезапуск приложения:
```bash
pm2 restart ton-exchange
```

4. Остановка приложения:
```bash
pm2 stop ton-exchange
```

## Обновление приложения

1. Перейдите в директорию проекта:
```bash
cd /var/www/ton-exchange
```

2. Получите последние изменения:
```bash
git pull
```

3. Установите новые зависимости:
```bash
npm install
cd client
npm install
npm run build
cd ..
```

4. Перезапустите приложение:
```bash
pm2 restart ton-exchange
```

## Мониторинг

1. Просмотр использования ресурсов:
```bash
pm2 monit
```

2. Просмотр логов в реальном времени:
```bash
pm2 logs ton-exchange --lines 100
```

## Безопасность

1. Настройте брандмауэр:
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. Регулярно обновляйте систему:
```bash
sudo apt update
sudo apt upgrade
``` 