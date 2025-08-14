-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS banco_dio;
USE banco_dio;

-- Configurações de charset
ALTER DATABASE banco_dio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário se não existir
CREATE USER IF NOT EXISTS 'banco_user'@'%' IDENTIFIED BY 'banco_pass';
GRANT ALL PRIVILEGES ON banco_dio.* TO 'banco_user'@'%';
FLUSH PRIVILEGES;