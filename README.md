# Sistema de Gestão Operacional GCM

Sistema completo de gestão operacional para a Guarda Civil Municipal de Capão Bonito.

## 🚀 Deploy no Vercel

Este projeto está configurado para deploy automático no Vercel.

### Configuração das Variáveis de Ambiente

Antes de fazer o deploy, configure as seguintes variáveis de ambiente no painel do Vercel:

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://iccxvbloyaijyubzrvku.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
GEMINI_API_KEY=sua-chave-gemini-aqui (opcional)
```

### Deploy Manual

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer deploy
vercel
```

### Deploy Automático

Cada push para a branch `main` fará deploy automático no Vercel.

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.local.example .env.local

# Editar .env.local com suas credenciais

# Iniciar servidor de desenvolvimento
npm run dev
```

## 📦 Build de Produção

```bash
npm run build
npm run preview
```

## 🔑 Credenciais Supabase

Obtenha suas credenciais em:
https://supabase.com/dashboard/project/iccxvbloyaijyubzrvku/settings/api

## 📝 Tecnologias

- React 19
- TypeScript
- Vite
- Supabase
- Leaflet (Mapas)
- Recharts (Gráficos)
- Lucide React (Ícones)
