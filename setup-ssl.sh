#!/bin/bash

# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d app.casafond.org

# Настройка автоматического обновления сертификата
sudo certbot renew --dry-run

# Перезапуск Nginx
sudo systemctl restart nginx 