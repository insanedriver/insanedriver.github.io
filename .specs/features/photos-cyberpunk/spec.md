# Photos Cyberpunk Specification

**Status:** Escopo revisado pelo usuário em 2026-09-19: manter somente a página de fotos repaginada.
**Context:** [Decisões confirmadas](context.md)

## Scope

Galeria estática com identidade cyberpunk, seis destaques do acervo local, 17 fotos na grade e ampliação via PhotoSwipe. Preservar Eleventy, Liquid, LESS e GitHub Pages.

A integração com Instagram foi cancelada pelo usuário porque o perfil contém mais do que fotos. PHOTO-18 a PHOTO-35 foram retirados do escopo, incluindo feed, sincronização, restauração, agendamento, credenciais e renovação automática. Os relatórios anteriores documentam somente a versão histórica.

## User Stories

### P1: Explorar as fotos da banda

**User Story:** Como visitante, quero navegar pelas fotos em uma apresentação coerente com a banda e abrir os registros em tamanho ampliado.

**Acceptance Criteria**:
1. The Photos page SHALL render exactly 6 distinct local highlights in the primary carousel. (PHOTO-01)
2. The Photos page SHALL render all 17 existing local gallery entries in the archive grid. (PHOTO-02)
3. The Photos page SHALL use dark surfaces, cyan and magenta accents, and angular framing consistent with the newsletter. (PHOTO-03)
4. WHEN the visitor activates next THEN the carousel SHALL select the next highlight, wrapping from the sixth to the first. (PHOTO-04)
5. WHEN the visitor activates previous THEN the carousel SHALL select the previous highlight, wrapping from the first to the sixth. (PHOTO-05)
6. WHEN the visitor activates a thumbnail THEN the carousel SHALL select the corresponding highlight. (PHOTO-06)
7. WHEN the visitor swipes horizontally at least 40 CSS pixels with horizontal displacement greater than vertical displacement THEN the carousel SHALL select one adjacent highlight, advancing on a leftward swipe and going back on a rightward swipe. (PHOTO-07)
8. WHILE the visitor does not request navigation the carousel SHALL retain the selected highlight without automatic advancement. (PHOTO-08)
9. WHEN the visitor clicks the selected highlight or an archive image THEN the page SHALL open that image in the full-screen viewer. (PHOTO-09)
10. WHEN the visitor closes the viewer THEN the page SHALL restore focus to the control that opened it. (PHOTO-10)

**Independent Test:** Navegar pelos 6 destaques e abrir fotos do carrossel e da grade; conferir as 17 entradas originais.

### P1: Navegar no celular e por teclado

**User Story:** Como visitante, quero usar a galeria no celular ou por teclado sem perder acesso às imagens e controles.

**Acceptance Criteria**:
1. The Photos page SHALL expose visible focus and accessible names for every gallery navigation control. (PHOTO-11)
2. WHEN a carousel control has focus and the visitor presses ArrowRight or ArrowLeft THEN the carousel SHALL select the corresponding adjacent highlight. (PHOTO-12)
3. WHEN the visitor presses Escape in the full-screen viewer THEN the viewer SHALL close. (PHOTO-13)
4. WHILE viewport width is 320, 390, 768 or 1440 CSS pixels the Photos page SHALL display content without document-level horizontal overflow. (PHOTO-14)
5. WHILE reduced motion is requested the Photos page SHALL disable decorative animation and animated carousel transitions. (PHOTO-15)
6. IF JavaScript is unavailable THEN the Photos page SHALL retain working links to all 17 full-size archive images. (PHOTO-16)
7. The Photos page SHALL provide nonempty descriptive alternative text for each local photo. (PHOTO-17)

**Independent Test:** Tab, setas e Escape; larguras definidas; movimento reduzido; grade sem JavaScript.

## Delivery

- Preservar os critérios PHOTO-01 a PHOTO-17 e seus testes.
- Remover os componentes e testes exclusivos da integração cancelada.
- Publicar somente por push em master ou execução manual; manter a serialização de deploys.
- Validar build, testes unitários, testes de navegador e diff.
- Publicação remota continua dependendo de autorização específica.
