# Photos Cyberpunk Design

**Updated:** 2026-09-19, conforme retirada da integração solicitada pelo usuário.
**Spec:** [spec.md](spec.md)
**Context:** [context.md](context.md)

## Architecture

`_data/photos.json` contém as 17 fotos locais e os seis valores de `highlightOrder`. `_data/highlights.js` seleciona e ordena os destaques. `photos/index.html` renderiza carrossel e grade via Liquid; `less/photos.less` aplica os estilos dentro de `#page_photos`.

`assets/js/photos.js` controla setas, miniaturas e gestos sem autoplay. `assets/js/photoswipe-impl.js` abre a imagem correspondente e restaura o foco ao fechar. Os links da grade continuam utilizáveis sem JavaScript.

Eleventy e LESS geram o site estático em `docs/`. O workflow instala dependências, verifica os dados, compila e publica na branch `release`, apenas por push em `master` ou execução manual. O grupo `pages-production` serializa os deploys.

## Removed Scope

Nenhum loader, template, script, cron ou credencial de Instagram permanece na implementação. Renovação automática não chegou a ser implementada. Os links sociais gerais do site permanecem independentes da galeria.

## Validation

Manter os testes PHOTO-01 a PHOTO-17: acervo, destaques, navegação circular, gestos, ampliação, foco, teclado, movimento reduzido, ausência de JavaScript e layout em quatro larguras. Recompilar o CSS após remover os estilos da seção cancelada.
