# Photos Cyberpunk Specification

**Status:** Aprovada pelo usuário em 2026-09-13; implementação em andamento.
**Scope:** Large. Galeria interativa, geração estática e integração externa agendada.
**Date:** 2026-09-13
**Context:** [Decisões confirmadas](context.md)

## Problem Statement

A página Photos apresenta 17 miniaturas em um layout simples que não acompanha a identidade cyberpunk do site. O acervo contém registros históricos e a página não exibe publicações recentes de @insanedriverid.

Esta mudança cria um carrossel de destaques, preserva o acervo e adiciona uma seleção do Instagram atualizada por automação. O visitante recebe uma página estática sem precisar entrar no Instagram para ver as fotos no site.

## Goals

- [ ] Apresentar 6 destaques locais em um carrossel cyberpunk navegável.
- [ ] Manter acesso às 17 fotos atuais em grade e em visualização ampliada.
- [ ] Exibir até 12 publicações elegíveis do Instagram em ordem recente.
- [ ] Agendar atualização a cada 6 horas com credenciais restritas à automação.
- [ ] Preservar uma galeria utilizável quando a sincronização falhar.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Login de visitantes e backend em execução no site | A solução aceita gera arquivos estáticos no GitHub Actions. |
| Reels, reprodução de vídeos e Stories | A primeira versão é uma página de fotos. |
| Navegação pelas imagens internas de posts | Foi aceita a exibição da capa com link ao post. |
| Comentários, curtidas e publicação pelo site | A integração solicitada é de leitura. |
| Painel administrativo, upload e filtros novos | O escopo cobre o acervo e a seleção automática. |
| Redesign de outras páginas e migração de hospedagem | Preservar Eleventy, LESS e GitHub Pages. |
| Push, publicação remota e configuração de contas sem autorização específica | A entrega local e a ativação externa são etapas distintas. |

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Visual | Superfícies escuras, neon ciano e magenta, molduras angulares | Continuidade solicitada com o site | Sim |
| Galeria | 6 destaques, setas e miniaturas, sem autoplay, grade de 17 fotos e ampliação | Recomendação aceita integralmente | Sim |
| Integração | API oficial no GitHub Actions, sem login de visitantes | Mantém a hospedagem estática | Sim |
| Instagram | Até 12 posts com fotos, capa de álbuns, clique no post, sem Reels | Recomendação aceita integralmente | Sim |
| Atualização | Agendamento a cada 6 horas | Recomendação aceita; não constitui SLA do provedor de CI | Sim |
| Falhas | Última seleção válida; sem seleção, chamada para o perfil | Recomendação aceita integralmente | Sim |
| Idioma | Inglês | Preserva a convenção da página atual | Sim, aprovação da especificação |
| Destaques | Selecionar 6 fotos distintas entre promo, shows e acústico existentes | Representa o acervo sem exigir novas fotos | Sim, aprovação da especificação |
| Extremidades | Navegação circular | Permite continuar ao chegar à primeira ou última foto | Sim, aprovação da especificação |
| Álbum com capa de vídeo | Omitir esse post | A proposta aceita usa a capa e não reproduz vídeos | Sim, aprovação da especificação |
| Poucos posts | Exibir a quantidade real, sem duplicação | Até 12 é um limite | Sim, aprovação da especificação |
| Consulta válida e vazia | Substituir a seleção antiga pela chamada ao perfil | Distingue ausência real de fotos de falha técnica | Sim, aprovação da especificação |
| Acessibilidade | Teclado, foco visível, nomes acessíveis e movimento reduzido | Permite operar a galeria por diferentes formas de interação | Sim, aprovação da especificação |
| Conta e credenciais | Administrador configura conta profissional compatível e secrets | Pré-requisito operacional ainda não verificado | Dependência de ativação |
| Testes propostos | Testes de seleção/sincronização e interação, build e revisão responsiva | npm test atual é placeholder; estratégia será consolidada nas tarefas | Sim, aprovação da especificação |

**Open questions:** none — decisões resolvidas ou explicitamente registradas acima. A autorização da conta permanece dependência de ativação, não uma alegação de integração já funcional.

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

**Independent Test:** Com a integração desligada, navegar pelos 6 destaques e abrir fotos do carrossel e da grade; conferir as 17 entradas originais.

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

### P1: Ver publicações recentes do Instagram

**User Story:** Como visitante, quero encontrar fotos recentes de @insanedriverid e abrir a publicação original.

**Acceptance Criteria**:
1. WHEN a valid selection exists THEN the Photos page SHALL render at most 12 eligible Instagram posts ordered by publication timestamp descending, with post ID ascending as a deterministic tie-breaker. (PHOTO-18)
2. The Instagram selection SHALL include only image posts and carousel posts whose first item is an image. (PHOTO-19)
3. WHEN an eligible carousel post is displayed THEN the Photos page SHALL render only its first image. (PHOTO-20)
4. WHEN the visitor activates an Instagram card THEN the browser SHALL open that card's original Instagram permalink. (PHOTO-21)
5. The Photos page SHALL display Instagram photos without requiring visitor authentication. (PHOTO-22)
6. IF no valid selection exists or the valid selection contains no eligible posts THEN the Instagram section SHALL render a working link to https://www.instagram.com/insanedriverid/. (PHOTO-23)
7. The Instagram selection SHALL contain each post ID no more than once. (PHOTO-24)
8. The Photos page SHALL render Instagram captions as text rather than executable markup. (PHOTO-25)

**Independent Test:** Gerar páginas com fixtures de fotos, vídeos, álbuns, duplicatas, legendas com marcação e seleção vazia; conferir conteúdo e links.

### P1: Atualizar o feed sem backend no site

**User Story:** Como responsável pelo site, quero atualizar as fotos pelo GitHub Actions sem expor credenciais e sem depender da API durante visitas.

**Acceptance Criteria**:
1. The Instagram workflow SHALL declare a recurring schedule with a six-hour interval. (PHOTO-26)
2. WHEN an authorized maintainer triggers synchronization manually THEN the workflow SHALL execute the same synchronization used by the scheduled run. (PHOTO-27)
3. WHEN synchronization succeeds THEN the next generated site SHALL use the newly validated selection. (PHOTO-28)
4. IF authentication fails, the API rate-limits requests, a request times out, or required media cannot be obtained THEN synchronization SHALL retain the previous valid selection and its usable image assets. (PHOTO-29)
5. IF the first synchronization fails THEN the site build SHALL succeed using the profile-link empty state. (PHOTO-30)
6. The generated site and synchronization logs SHALL exclude Instagram credentials. (PHOTO-31)
7. WHEN overlapping synchronization runs are requested THEN the workflow SHALL prevent concurrent publication of different selections. (PHOTO-32)
8. WHEN synchronization finishes THEN its summary SHALL report success, retained previous selection, or no selection available without secret values. (PHOTO-33)
9. WHEN successful synchronization replaces a selection THEN the generated Instagram section SHALL omit posts absent from the replacement selection. (PHOTO-34)
10. The integration documentation SHALL describe account authorization, secret configuration, manual synchronization and recovery after credential expiration or revocation. (PHOTO-35)

**Independent Test:** Simular API e downloads com sucesso, 401, 429, timeout e falha parcial; conferir snapshot anterior, publicação serializada e ausência de credenciais nos artefatos e logs capturados.

## Edge Cases

- Nenhum post elegível: PHOTO-23; não usar conteúdo fictício em produção.
- Menos de 12 fotos: PHOTO-18; renderizar quantidade real.
- Duplicação entre páginas da API: PHOTO-24.
- Álbum com vídeo na capa e Reel: PHOTO-19.
- Falha parcial de sincronização: PHOTO-29; não substituir snapshot válido por incompleto.
- Build local sem credenciais: PHOTO-30; a galeria local permanece independente.
- Consulta válida e vazia: PHOTO-23 e PHOTO-34; retirar a seleção antiga.
- Extremidades do carrossel: PHOTO-04 e PHOTO-05.
- Rolagem predominantemente vertical: PHOTO-07; não trocar o slide.
- Movimento reduzido e JavaScript ausente: PHOTO-15 e PHOTO-16.

## Implicit Requirement Dimensions

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | PHOTO-18, PHOTO-19, PHOTO-24 e PHOTO-25. URLs e limites técnicos de paginação/download serão definidos no design. |
| Failure / partial-failure states | PHOTO-23, PHOTO-29 e PHOTO-30; snapshot anterior ou chamada ao perfil. |
| Idempotency / retry / duplicate handling | PHOTO-24 e PHOTO-28; repetir a leitura não duplica posts nem publica snapshot incompleto. |
| Auth boundaries & rate limits | PHOTO-22, PHOTO-29, PHOTO-31 e PHOTO-35. |
| Concurrency / ordering | PHOTO-18 e PHOTO-32; ordem determinística e publicação serializada. |
| Data lifecycle / expiry | PHOTO-29 e PHOTO-34; substituição após sucesso e preservação após falha. Retenção e expiração técnica de mídia serão verificadas no design contra os requisitos atuais da API. |
| Observability | PHOTO-33; resumo operacional sem segredo, sem novo sistema de métricas. |
| External-dependency failure | PHOTO-29 e PHOTO-30; visitantes recebem o snapshot estático. |
| State-transition integrity | PHOTO-04 a PHOTO-10 e PHOTO-28 a PHOTO-32. |

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| PHOTO-01 | Explorar as fotos da banda — AC 1 | Execute | Verified |
| PHOTO-02 | Explorar as fotos da banda — AC 2 | Execute | Verified |
| PHOTO-03 | Explorar as fotos da banda — AC 3 | Execute | Verified |
| PHOTO-04 | Explorar as fotos da banda — AC 4 | Execute | Verified |
| PHOTO-05 | Explorar as fotos da banda — AC 5 | Execute | Verified |
| PHOTO-06 | Explorar as fotos da banda — AC 6 | Execute | Verified |
| PHOTO-07 | Explorar as fotos da banda — AC 7 | Execute | Verified |
| PHOTO-08 | Explorar as fotos da banda — AC 8 | Execute | Verified |
| PHOTO-09 | Explorar as fotos da banda — AC 9 | Execute | Verified |
| PHOTO-10 | Explorar as fotos da banda — AC 10 | Execute | Verified |
| PHOTO-11 | Navegar no celular e por teclado — AC 1 | Execute | Verified |
| PHOTO-12 | Navegar no celular e por teclado — AC 2 | Execute | Verified |
| PHOTO-13 | Navegar no celular e por teclado — AC 3 | Execute | Verified |
| PHOTO-14 | Navegar no celular e por teclado — AC 4 | Execute | Verified |
| PHOTO-15 | Navegar no celular e por teclado — AC 5 | Execute | Verified |
| PHOTO-16 | Navegar no celular e por teclado — AC 6 | Execute | Verified |
| PHOTO-17 | Navegar no celular e por teclado — AC 7 | Execute | Verified |
| PHOTO-18 | Ver publicações recentes do Instagram — AC 1 | Execute | Verified |
| PHOTO-19 | Ver publicações recentes do Instagram — AC 2 | Execute | Verified |
| PHOTO-20 | Ver publicações recentes do Instagram — AC 3 | Execute | Verified |
| PHOTO-21 | Ver publicações recentes do Instagram — AC 4 | Execute | Verified |
| PHOTO-22 | Ver publicações recentes do Instagram — AC 5 | Execute | Verified |
| PHOTO-23 | Ver publicações recentes do Instagram — AC 6 | Execute | Verified |
| PHOTO-24 | Ver publicações recentes do Instagram — AC 7 | Execute | Verified |
| PHOTO-25 | Ver publicações recentes do Instagram — AC 8 | Execute | Verified |
| PHOTO-26 | Atualizar o feed sem backend no site — AC 1 | Execute | Verified |
| PHOTO-27 | Atualizar o feed sem backend no site — AC 2 | Execute | Verified |
| PHOTO-28 | Atualizar o feed sem backend no site — AC 3 | Execute | Verified |
| PHOTO-29 | Atualizar o feed sem backend no site — AC 4 | Execute | Verified |
| PHOTO-30 | Atualizar o feed sem backend no site — AC 5 | Execute | Verified |
| PHOTO-31 | Atualizar o feed sem backend no site — AC 6 | Execute | Verified |
| PHOTO-32 | Atualizar o feed sem backend no site — AC 7 | Execute | Verified |
| PHOTO-33 | Atualizar o feed sem backend no site — AC 8 | Execute | Verified |
| PHOTO-34 | Atualizar o feed sem backend no site — AC 9 | Execute | Verified |
| PHOTO-35 | Atualizar o feed sem backend no site — AC 10 | Execute | Verified |

**Coverage:** 35 requisitos implementados. A tarefa corretiva T9 acrescenta evidência do comando real para PHOTO-31 e PHOTO-33; o resultado independente está em validation.md.

## Success Criteria

- [ ] PHOTO-01 a PHOTO-35 possuem evidências vinculadas às tarefas.
- [ ] O build existente termina com sucesso.
- [ ] Controles e estados passam na verificação de comportamento e responsividade.
- [ ] Verificador independente revisa os resultados e executa o sensor exigido pela tlc-spec-driven.
- [ ] A entrega distingue validação local com fixtures de sincronização real autorizada.

## Delivery and Activation

A implementação local incluirá interface, automação, testes e instruções de configuração. Credenciais não serão solicitadas em mensagens nem gravadas em arquivos versionados. A sincronização real depende da autorização da conta e da instalação dos secrets pelo administrador. Execução remota e publicação serão tratadas somente quando autorizadas.

## Implementation Outline

Após aprovação, detalhar galeria, seleção de posts, persistência do último snapshot e integração com o build existente. As tarefas incluirão verificação de interação, falhas da API e conteúdo gerado. Nenhum código de produto foi alterado nesta etapa.
