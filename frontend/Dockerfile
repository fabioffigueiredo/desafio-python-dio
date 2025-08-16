FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta 3000
EXPOSE 3000

# Definir variável de ambiente para o host
ENV HOST=0.0.0.0

# Comando para iniciar a aplicação
CMD ["npm", "start"]