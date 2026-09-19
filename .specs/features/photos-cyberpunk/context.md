# Photos Cyberpunk Context

**Updated:** 2026-09-19
**Spec:** .specs/features/photos-cyberpunk/spec.md
**Status:** Galeria local validada após remoção da integração: build e 23 testes aprovados.

## Feature Boundary

Modernizar somente a página Photos com a identidade cyberpunk do site. O usuário cancelou a integração com Instagram porque o perfil contém mais do que fotos. A proposta de renovação automática também foi cancelada antes de qualquer implementação.

## Confirmed Decisions

- Superfícies escuras, neon ciano/magenta e molduras angulares.
- Carrossel manual com seis destaques, setas, miniaturas e gesto de arrastar no celular.
- Grade com as 17 fotos originais; clique abre o visualizador PhotoSwipe.
- Preservar teclado, foco visível, movimento reduzido e links da grade sem JavaScript.
- Remover feed, scripts de sincronização/restauração, loader, estilos e testes exclusivos do Instagram.
- Retirar o agendamento de seis horas e as referências a credenciais do workflow.
- Preservar os links sociais gerais do site, que não fazem parte da integração.
- Nenhuma configuração de conta, callback ou token é necessária para a galeria.

## Existing Project Facts

Eleventy gera `docs/`; LESS gera `assets/css/style.min.css`. O workflow publica em `release` após push em `master` ou execução manual na branch de produção. Deploys são serializados.

## Next Step

Entrega local concluída. A publicação remota ainda não foi autorizada.
