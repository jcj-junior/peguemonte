# Protocolos de Deploy do Usuário

Este documento contém regras mandatórias definidas pelo usuário para o fluxo de trabalho de deploy.

## 🚀 Fluxo de Deploy Vercel

1. **Preview primeiro, Produção depois:**
    - NUNCA faça push diretamente para a branch `main` (produção) sem antes passar pelo Preview.
    - SEMPRE crie uma branch de funcionalidade (ex: `feat/nova-tela`) ou use a branch `develop` para gerar uma **Vercel Preview URL**.
    - O deploy em produção só deve ser realizado na branch `main` APÓS o usuário realizar os testes no ambiente de Preview e autorizar explicitamente.

2. **Verificação de Performance:**
    - Antes de cada preview, verifique se a conexão com o Supabase está estável e se não há logs de erro de rede no console.
