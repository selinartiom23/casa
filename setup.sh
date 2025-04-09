#!/bin/bash

# Проверка версии Ubuntu
UBUNTU_VERSION=$(lsb_release -r | awk '{print $2}')
if [[ "$UBUNTU_VERSION" != "20.04" && "$UBUNTU_VERSION" != "22.04" ]]; then
    echo "Error: This script is designed for Ubuntu 20.04 LTS or 22.04 LTS"
    echo "Your Ubuntu version: $UBUNTU_VERSION"
    exit 1
fi

# Обновление системы
sudo apt update
sudo apt upgrade -y

# Установка необходимых инструментов
sudo apt install -y git curl wget

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Установка MongoDB
# Добавляем ключ MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Добавляем репозиторий MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Обновляем список пакетов
sudo apt update

# Устанавливаем MongoDB
sudo apt install -y mongodb-org

# Запускаем и включаем автозапуск MongoDB
sudo systemctl enable mongod
sudo systemctl start mongod

# Установка Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Установка PM2
sudo npm install -g pm2

# Создание директории для проекта
if [ -d "/var/www/ton-exchange" ]; then
    echo "Directory /var/www/ton-exchange exists. Cleaning..."
    sudo rm -rf /var/www/ton-exchange/*
else
    sudo mkdir -p /var/www/ton-exchange
fi

sudo chown -R $USER:$USER /var/www/ton-exchange

# Клонирование репозитория
cd /var/www/ton-exchange
git clone https://github.com/selinartiom23/casa.git .

# Создание .env файла
cat > .env << EOL
MONGODB_URI=mongodb://localhost:27017/ton-exchange
JWT_SECRET=your-secret-key
PORT=5000
EOL

# Установка зависимостей
npm install
cd client
npm install
npm run build
cd ..

# Настройка Nginx
sudo tee /etc/nginx/sites-available/ton-exchange << EOL
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Активация конфигурации Nginx
sudo ln -s /etc/nginx/sites-available/ton-exchange /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Запуск приложения через PM2
cd /var/www/ton-exchange
pm2 start /var/www/ton-exchange/server.js --name "ton-exchange"
pm2 save
pm2 startup 