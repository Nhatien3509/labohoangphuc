# Env Files theo MÃ´i TrÆ°á»ng

Má»—i service cÃ³ file `.env.<service>` riÃªng cho má»—i environment.

## Cáº¥u trÃºc

```
envs/
â”œâ”€â”€ dev/
â”‚   â””â”€â”€ .env.portal          # Dev config
â”œâ”€â”€ poc/
â”‚   â””â”€â”€ .env.portal          # POC config
â””â”€â”€ prod/
    â””â”€â”€ .env.portal          # Production config
```

## Táº¡o env má»›i

```bash
# Copy tá»« dev
cp dev/.env.portal <new-env>/.env.portal

# Chá»‰nh sá»­a cÃ¡c biáº¿n cho phÃ¹ há»£p
```

## Override local

Táº¡o `.env.<service>.local` Ä‘á»ƒ override mÃ  khÃ´ng commit lÃªn git:

```bash
cp dev/.env.portal dev/.env.portal.local
```

> **âš ï¸ QUAN TRá»ŒNG**: KhÃ´ng commit file chá»©a secrets tháº­t. Chá»‰ commit `.example` files.
