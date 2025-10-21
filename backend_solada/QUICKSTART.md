# 🚀 Quickstart - Cronia Backend

Guia rápido para ter o backend da Cronia rodando em menos de 5 minutos.

---

## ⚡ Setup Rápido

### Opção 1: Com Make (recomendado)

```bash
# Executar setup completo (instala tudo)
make setup

# Iniciar todos os serviços
make dev
```

### Opção 2: Com script bash

```bash
# Executar setup
chmod +x scripts/setup.sh
./scripts/setup.sh

# Iniciar serviços
npm run dev:all
```

### Opção 3: Manual

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Instalar dependências
npm install

# 3. Subir infraestrutura (Postgres + Redis)
npm run docker:up

# 4. Configurar banco de dados
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 5. Iniciar serviços
npm run dev:all
```

---

## 🎯 Acessar a API

- **API**: http://localhost:3000/v1
- **Swagger Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/v1/health

---

## 🧪 Testar a API

### Via Swagger UI

Acesse http://localhost:3000/docs e teste os endpoints diretamente na interface.

### Via cURL

```bash
# Health check
curl http://localhost:3000/v1/health

# Auth challenge
curl -X POST http://localhost:3000/v1/auth/challenge \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA"}'
```

### Com script de teste

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

---

## 👥 Usuários de Teste (Seed Data)

### Consumidor

- **Wallet**: `TestConsumer7xKXtg2CW87d97TXJSDpbD5jBkheTqA`
- **Email**: `consumer@test.com`
- **Crédito**: $1000

### Lojista

- **Wallet**: `TestMerchant8yLYug3DX98e08UYKTEqcE6kCifuUrB`
- **Email**: `merchant@test.com`
- **API Key**: `cronia_test_api_key_123456789`

---

## 📊 Verificar Banco de Dados

```bash
# Abrir Prisma Studio (interface visual)
make prisma-studio
# ou
npx prisma studio
```

Acesse: http://localhost:5555

---

## 🐳 Docker Commands

```bash
# Subir containers
make docker-up

# Ver logs
make docker-logs

# Parar containers
make docker-down
```

---

## 📝 Comandos Úteis

```bash
# Ver todos os comandos disponíveis
make help

# Iniciar apenas a API
make api

# Iniciar apenas o Keeper
make keeper

# Iniciar apenas o Indexer
make indexer

# Rodar migrations
make prisma-migrate

# Popular banco com seed
make prisma-seed

# Limpar build
make clean
```

---

## 🔧 Estrutura de Diretórios

```
cronia-backend/
├── apps/
│   ├── api/              # API REST (NestJS)
│   │   ├── src/
│   │   │   ├── modules/  # Módulos de negócio
│   │   │   └── main.ts   # Entry point
│   │   └── package.json
│   ├── keeper/           # Jobs agendados
│   │   └── src/jobs/     # Billing, Risk, Liquidation
│   └── indexer/          # Listener blockchain
│       └── src/
├── prisma/
│   ├── schema.prisma     # Schema do banco
│   └── seed.ts           # Dados de teste
└── docker-compose.yml    # Infraestrutura
```

---

## ❓ Troubleshooting

### Erro: "Port 3000 already in use"

```bash
# Verificar o que está usando a porta
lsof -i :3000
# Matar o processo
kill -9 <PID>
```

### Erro: "Database connection failed"

```bash
# Verificar se o Postgres está rodando
docker ps | grep postgres

# Verificar logs do Postgres
docker logs cronia-postgres

# Restart dos containers
npm run docker:down
npm run docker:up
```

### Erro: "Prisma Client not generated"

```bash
# Regenerar Prisma Client
npm run prisma:generate
```

---

## 📚 Próximos Passos

1. ✅ Backend funcionando
2. 📖 Ler a [documentação completa](./README.md)
3. 🔐 Integrar autenticação com wallet Solana no frontend
4. 🎨 Desenvolver interface frontend
5. ⛓️ Desenvolver smart contracts Solana
6. 🚀 Deploy em produção

---

## 🆘 Precisa de Ajuda?

- Abra uma issue no GitHub
- Consulte a [documentação completa](./README.md)
- Verifique os logs dos serviços

---

**Divirta-se desenvolvendo! 🎉**
