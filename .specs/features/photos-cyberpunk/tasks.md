# Photos Cyberpunk Tasks

## Execution Protocol

Implementar com a skill tlc-spec-driven já solicitada pelo usuário. Seguir testes derivados da especificação, gate por tarefa, status e commit atômicos e verificador independente ao final. Não executar push ou publicação remota sem autorização específica.

**Spec:** [spec.md](spec.md), aprovada em 2026-09-13.
**Design:** [design.md](design.md).
**Status:** Aprovado; execução em andamento.

## Test Coverage Matrix

> Gerada a partir do repositório e da especificação aprovada. Guidelines: nenhuma diretriz adicional de testes foi encontrada; aplicar cobertura dos critérios da feature. README exige CSS gerado junto ao LESS. package.json:10 contém apenas placeholder; não existe suite funcional a preservar. A proposta de testes já consta da especificação aprovada. Os comandos abaixo serão criados na primeira tarefa; não são apresentados como comandos preexistentes.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Coleção e seleção | unit | Valores e ramos correspondentes aos critérios, limites e duplicatas | tests/photos/*.test.cjs | npm run test:unit |
| Sincronizador e recuperação | integration | Sucesso, todos os erros especificados e conteúdo persistido entre execuções | tests/photos/*.test.cjs | npm run test:unit |
| Templates e loader | integration | HTML final, vazio, escape e links definidos pela spec | tests/photos/*.test.cjs | npm run test:unit |
| Carrossel e lightbox | e2e | Todos os controles, foco, touch, movimento reduzido e ausência de JS | tests/photos/*.e2e.cjs | npm run test:photos |
| Layout e estilo | e2e + revisão visual | Quatro larguras, foco e identidade visual local | tests/photos/visual.e2e.cjs | npm run test:photos |
| Workflow | integration | Contrato YAML e helper real em Git temporário, inclusive falha de restore | tests/photos/instagram-workflow.test.cjs | npm run test:unit |
| Documentação | manual | Cinco cenários operacionais da tarefa final | README.md | Revisão documentada + build |

## Gate Check Commands

> npm run build é existente. Os scripts test:unit e test:photos são propostas para aprovação e serão adicionados na T1. Não há lint configurado; usar git diff --check sem introduzir padronização de código fora do escopo.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Lógica unitária | npm run test:unit |
| Full | Integração ou interface | npm run test:unit && npm run test:photos |
| Build | Fim de fase e documentação | npm run build && npm run test:unit && npm run test:photos && git diff --check |

- test:unit: `node --test tests/photos/*.test.cjs`.
- test:photos: compilar LESS e executar Playwright com configuração própria; o webServer inicia o Eleventy local. Asserções atingem a página gerada.
- A primeira tarefa adiciona @playwright/test como devDependency e preserva o lockfile existente. Nenhuma biblioteca nova de produção.
- Fixtures nunca contêm credenciais reais e ficam fora da saída do Eleventy. Testes não chamam o Instagram real.
- Contagens abaixo são mínimos de cenários planejados. Registrar contagens reais por tarefa e preservar todos os casos criados; nenhuma redução silenciosa.
- Testes e infraestrutura estritamente necessária acompanham o componente na mesma tarefa, conforme regra de co-localização. Os arquivos de apoio estão explicitados, sem tratá-los como entregas independentes.

## Execution Plan

Duas fases, executadas sequencialmente. Oito tarefas cabem em um lote do agente principal; não há delegação de implementação a aprovar. O verificador independente ao final é obrigatório.

### Phase 1: Galeria

```text
T1 -> T2
T1 -> T3
T2 -> T3
T1 -> T4
T3 -> T4
```

### Phase 2: Instagram

```text
T5 -> T6
T5 -> T7
T6 -> T7
T7 -> T8
```

Dependência entre fases: T6 também depende de T1. Ordem de execução: T1, T2, T3, T4, T5, T6, T7, T8.

## Task Breakdown

### Phase 1: Galeria

### T1: Estruturar a galeria estática

**Status**: Complete
**What**: Renderizar os seis destaques e o acervo completo a partir de uma única coleção local.
**Where**: `photos/index.html`
**Supporting files**: `_data/photos.json`, `_data/highlights.js`, `tests/photos/browser.cjs`, `tests/photos/gallery.test.cjs`, `tests/photos/gallery.e2e.cjs`, `playwright.config.cjs`, `package.json`, `package-lock.json`, `.eleventyignore`, `.gitignore`.
**Depends on**: None
**Reuses**: 17 links existentes, layout base, estrutura PhotoSwipe e scripts npm existentes.
**Requirement**: PHOTO-01, PHOTO-02, PHOTO-16, PHOTO-17

**Tools**:

- Terminal, editor de arquivos e Git local; Playwright nos testes e2e.
- Skill: tlc-spec-driven. Sites-building somente nas orientações compatíveis de edição do site existente; sem registro ou migração de hospedagem.

**Done when**:

- [x] Catalogar os 17 registros com dimensões medidas e texto alternativo; selecionar 6 destaques distintos.
- [x] Renderizar todos os links originais e assegurar acesso ao acervo sem JavaScript.
- [x] Adicionar somente a infraestrutura de testes necessária: node:test, Playwright/Chromium e exclusões de fixtures/relatórios na geração.
- [x] Mínimo de 3 testes unitários para coleção e 2 testes e2e para markup/sem JavaScript; nenhum teste ignorado.
- [x] Gate full passa; tabela de evidência relaciona cada critério às asserções e à spec.

**Tests**: unit + e2e
**Gate**: full
**Commit**: `feat(photos): structure the local photo gallery`

### T2: Aplicar o visual cyberpunk responsivo

**Status**: Complete
**What**: Aplicar a identidade visual aprovada ao carrossel e à grade com escopo exclusivo da página.
**Where**: `less/photos.less`
**Supporting files**: `assets/css/style.css`, `assets/css/style.min.css` e `tests/photos/visual.e2e.cjs`; eventual ajuste de classes no template é limitado à ligação da mesma camada visual.
**Depends on**: T1
**Reuses**: Paleta e fontes atuais; pipeline LESS.
**Requirement**: PHOTO-03, PHOTO-11, PHOTO-14, PHOTO-15

**Tools**:

- Terminal, editor de arquivos e Git local; Playwright nos testes e2e.
- Skill: tlc-spec-driven. Sites-building somente nas orientações compatíveis de edição do site existente; sem registro ou migração de hospedagem.

**Done when**:

- [x] Molduras angulares e acentos ciano/magenta estão presentes sem encobrir as fotos.
- [x] Verificar ausência de overflow em 320, 390, 768 e 1440 px; foco visível; movimento reduzido sem animações decorativas.
- [x] Gerar os CSS pelo comando existente e revisar as quatro larguras no navegador.
- [x] Mínimo de 6 casos e2e: quatro larguras, foco e movimento reduzido. Registrar evidência visual da identidade.
- [x] Gate full passa; tabela de evidência relaciona cada critério às asserções e à spec.

**Tests**: e2e + revisão visual
**Gate**: full
**Commit**: `feat(photos): add responsive cyberpunk styling`

### T3: Implementar a navegação do carrossel

**Status**: Pending
**What**: Operar o carrossel por setas, miniaturas, teclado e gesto horizontal, sem autoplay.
**Where**: `assets/js/photos.js`
**Supporting files**: `_includes/js/photos.liquid` e `tests/photos/carousel.e2e.cjs`.
**Depends on**: T1, T2
**Reuses**: HTML e classes das tarefas anteriores.
**Requirement**: PHOTO-04, PHOTO-05, PHOTO-06, PHOTO-07, PHOTO-08, PHOTO-12

**Tools**:

- Terminal, editor de arquivos e Git local; Playwright nos testes e2e.
- Skill: tlc-spec-driven. Sites-building somente nas orientações compatíveis de edição do site existente; sem registro ou migração de hospedagem.

**Done when**:

- [ ] Próximo/anterior fazem wrap; miniatura seleciona a imagem e atualiza contador/estado acessível.
- [ ] Teclado só controla o carrossel quando há foco nele.
- [ ] Gesto de pelo menos 40 px troca uma foto, gesto vertical não troca e arrastar não abre lightbox.
- [ ] Mínimo de 7 casos e2e: wrap nos dois sentidos, miniatura, teclado, swipe, gesto vertical e ausência de autoplay.
- [ ] Gate full passa; tabela de evidência relaciona cada critério às asserções e à spec.

**Tests**: e2e
**Gate**: full
**Commit**: `feat(photos): implement manual carousel navigation`

### T4: Integrar ampliação e retorno de foco

**Status**: Pending
**What**: Abrir a foto correta dos destaques ou do acervo e restaurar o foco ao fechar o visualizador.
**Where**: `assets/js/photoswipe-impl.js`
**Supporting files**: `assets/js/photos.js` apenas na chamada do adaptador e `tests/photos/viewer.e2e.cjs`.
**Depends on**: T1, T3
**Reuses**: PhotoSwipe 4.1.0 local, zoom e controles existentes.
**Requirement**: PHOTO-09, PHOTO-10, PHOTO-13, PHOTO-15

**Tools**:

- Terminal, editor de arquivos e Git local; Playwright nos testes e2e.
- Skill: tlc-spec-driven. Sites-building somente nas orientações compatíveis de edição do site existente; sem registro ou migração de hospedagem.

**Done when**:

- [ ] Abrir a imagem correspondente ao destaque ativo e a uma entrada da grade, mantendo navegação e zoom.
- [ ] Escape fecha; fechamento restaura o foco no acionador.
- [ ] Normalizar dimensões e desativar transições de abertura/fechamento com movimento reduzido.
- [ ] Mínimo de 4 casos e2e: destaque, grade, fechamento/foco e movimento reduzido; build completo passa.
- [ ] Gate build passa; tabela de evidência relaciona cada critério às asserções e à spec.

**Tests**: e2e
**Gate**: build
**Commit**: `fix(photos): integrate accessible photo viewing`

### Phase 2: Instagram

### T5: Sincronizar um snapshot completo do Instagram

**Status**: Pending
**What**: Consultar mídia autorizada e substituir o snapshot somente após validar a seleção e obter todas as imagens.
**Where**: `scripts/sync-instagram.cjs`
**Supporting files**: `tests/photos/instagram-sync.test.cjs` e fixtures isoladas; `.gitignore` apenas para mídia/staging gerados.
**Depends on**: None
**Reuses**: Node nativo, filesystem e contratos do design.
**Requirement**: PHOTO-18, PHOTO-19, PHOTO-20, PHOTO-24, PHOTO-28, PHOTO-29, PHOTO-30, PHOTO-31, PHOTO-33, PHOTO-34

**Tools**:

- Terminal, editor de arquivos e Git local; Playwright nos testes e2e.
- Skill: tlc-spec-driven. Sites-building somente nas orientações compatíveis de edição do site existente; sem registro ou migração de hospedagem.

**Done when**:

- [ ] Adaptador usa host/configuração explícitos e não acessa rede sem configuração; versionamento e contrato real são conferidos antes da ativação.
- [ ] Ordenar, deduplicar, filtrar tipos e selecionar até 12; capa de vídeo não entra; resolver capa de álbum sem escolher imagem arbitrária.
- [ ] Validar URLs, timestamps, IDs e downloads conforme limites do design; não seguir páginas externas nem enviar credenciais aos hosts de mídia.
- [ ] Sucesso substitui manifest e arquivos; 401, 429, timeout, limite ou falha parcial preservam integralmente o anterior; consulta completa vazia limpa a seleção.
- [ ] Sem snapshot e sem credenciais produz estado vazio sem quebrar build; logs e JSON não contêm token nem URLs autenticadas.
- [ ] Mínimo de 16 testes: ordem/limite, desempate, duplicação, tipos/capas, vazio válido, ausência de configuração, sucesso completo, substituição, 401, 429, timeout, download parcial, cursor cíclico, limite de coleta, URL/arquivo inválido e ausência de segredo.
- [ ] Gate full passa; tabela de evidência relaciona cada critério às asserções e à spec.

**Tests**: unit + integration
**Gate**: full
**Commit**: `feat(photos): synchronize instagram photo snapshots`

### T6: Renderizar a seção estática do Instagram

**Status**: Pending
**What**: Exibir a seleção local ou a chamada ao perfil sem chamadas de API no navegador.
**Where**: `_includes/photos/instagram.liquid`
**Supporting files**: `_data/instagram.js`, `photos/index.html` apenas para inclusão, `less/photos.less` e CSS gerado para os cards, `tests/photos/instagram-render.test.cjs`, `tests/photos/instagram.e2e.cjs`.
**Depends on**: T1, T5
**Reuses**: Loader local do Eleventy, sistema visual e snapshot validado.
**Requirement**: PHOTO-18, PHOTO-19, PHOTO-20, PHOTO-21, PHOTO-22, PHOTO-23, PHOTO-25

**Tools**:

- Terminal, editor de arquivos e Git local; Playwright nos testes e2e.
- Skill: tlc-spec-driven. Sites-building somente nas orientações compatíveis de edição do site existente; sem registro ou migração de hospedagem.

**Done when**:

- [ ] Loader lê somente o arquivo público local e retorna dados validados; não lê token nem faz rede.
- [ ] Cards preservam ordem/capa, apontam ao permalink e escapam legendas e atributos.
- [ ] Sem seleção, exibir link para insanedriverid; não servir fixtures de demonstração em produção.
- [ ] Mínimo de 4 testes de integração: seleção renderizada, vazio, legenda hostil e snapshot inválido; 2 e2e: link real e acesso sem login/rede à API.
- [ ] Cards continuam sem overflow nas quatro larguras já cobertas pela suite visual.
- [ ] Gate full passa; tabela de evidência relaciona cada critério às asserções e à spec.

**Tests**: integration + e2e
**Gate**: full
**Commit**: `feat(photos): render the static instagram section`

### T7: Integrar restauração, sincronização e publicação

**Status**: Pending
**What**: Ampliar o workflow existente com recuperação do snapshot e atualização serializada a cada seis horas.
**Where**: `.github/workflows/main.yml`
**Supporting files**: `scripts/restore-instagram.cjs` se necessário para tornar a restauração testável; `tests/photos/instagram-workflow.test.cjs`; package scripts apenas para comandos já definidos no plano.
**Depends on**: T5, T6
**Reuses**: Branch release e ação de publicação existentes.
**Requirement**: PHOTO-26, PHOTO-27, PHOTO-28, PHOTO-29, PHOTO-30, PHOTO-31, PHOTO-32, PHOTO-33, PHOTO-34

**Tools**:

- Terminal, editor de arquivos e Git local; Playwright nos testes e2e.
- Skill: tlc-spec-driven. Sites-building somente nas orientações compatíveis de edição do site existente; sem registro ou migração de hospedagem.

**Done when**:

- [ ] Um workflow cobre push master, cron 17 */6 * * * e workflow_dispatch; mesma rota de sincronização para todos.
- [ ] Serializar desde a restauração até deploy e limitar publicação à fonte de produção; não presumir FIFO na fila.
- [ ] Restaurar somente dados/imagens do snapshot anterior antes de qualquer build; erro de rede não pode ser confundido com primeiro uso.
- [ ] O token fica no passo de sincronização; não executar código da release; nenhum comando de publicação remota é executado durante desenvolvimento local.
- [ ] Mínimo de 6 testes: contrato dos triggers, concorrência/escopo do segredo, restauração completa entre checkouts limpos, bootstrap sem snapshot, falha de recuperação impedindo publicação e preservação após erro da API.
- [ ] Usar repositório Git temporário como remoto de teste e executar o helper real; conferir conteúdo final, não apenas chamadas mockadas.
- [ ] Gate build passa; tabela de evidência relaciona cada critério às asserções e à spec.

**Tests**: integration
**Gate**: build
**Commit**: `ci(photos): schedule instagram synchronization`

### T8: Documentar configuração e recuperação

**Status**: Pending
**What**: Entregar instruções operacionais que distinguem configuração da conta, desenvolvimento local e ativação real.
**Where**: `README.md`
**Supporting files**: Nenhum arquivo de produto adicional; evidências da revisão ficam nos documentos da feature.
**Depends on**: T7
**Reuses**: README existente, configuração e comandos implementados.
**Requirement**: PHOTO-35

**Tools**:

- Terminal, editor de arquivos e Git local; Playwright nos testes e2e.
- Skill: tlc-spec-driven. Sites-building somente nas orientações compatíveis de edição do site existente; sem registro ou migração de hospedagem.

**Done when**:

- [ ] Documentar conta profissional, permissão básica, versão da API, identificação da conta e cadastro seguro do token.
- [ ] Documentar execução manual, prazo real do token, renovação manual, reativação de schedule e leitura do resumo.
- [ ] Documentar limpeza explícita da integração e mídias, incluindo histórico Git; falha transitória não equivale a pedido de exclusão.
- [ ] Revisar cinco cenários: primeiro uso, build local sem segredo, recuperação de token, agendamento parado e desativação; marcar separadamente tudo que ainda depende da conta real.
- [ ] Build e suites acumuladas passam; a conclusão desta tarefa dispara automaticamente o verificador independente.
- [ ] Gate build passa; tabela de evidência relaciona cada critério às asserções e à spec.

**Tests**: manual
**Gate**: build
**Commit**: `docs(photos): document instagram setup and recovery`

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | Coleção estática e HTML progressivo; apoio e testes do mesmo componente explicitados | OK |
| T2 | Camada visual e responsividade; apoio e testes do mesmo componente explicitados | OK |
| T3 | Interação do carrossel; apoio e testes do mesmo componente explicitados | OK |
| T4 | Adaptador do visualizador; apoio e testes do mesmo componente explicitados | OK |
| T5 | Seleção e persistência da sincronização; apoio e testes do mesmo componente explicitados | OK |
| T6 | Template e loader Instagram; apoio e testes do mesmo componente explicitados | OK |
| T7 | Orquestração e restauração entre builds; apoio e testes do mesmo componente explicitados | OK |
| T8 | Documentação operacional; apoio e testes do mesmo componente explicitados | OK |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | None | OK |
| T2 | T1 | T1 | OK |
| T3 | T1, T2 | T1, T2 | OK |
| T4 | T1, T3 | T1, T3 | OK |
| T5 | None | None | OK |
| T6 | T1, T5 | T1 (entre fases, explícita no plano), T5 | OK |
| T7 | T5, T6 | T5, T6 | OK |
| T8 | T7 | T7 | OK |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Coleção estática e HTML progressivo | unit + e2e | unit + e2e; 3 unitários + 2 e2e | OK |
| T2 | Camada visual e responsividade | e2e + revisão visual | e2e + revisão visual; 6 e2e + revisão visual | OK |
| T3 | Interação do carrossel | e2e | e2e; 7 e2e | OK |
| T4 | Adaptador do visualizador | e2e | e2e; 4 e2e | OK |
| T5 | Seleção e persistência da sincronização | unit + integration | unit + integration; 16 unitários/integração | OK |
| T6 | Template e loader Instagram | integration + e2e | integration + e2e; 4 integração + 2 e2e | OK |
| T7 | Orquestração e restauração entre builds | integration | integration; 6 integração | OK |
| T8 | Documentação operacional | manual | manual; 5 cenários manuais | OK |

## Requirement Coverage

| Requirement | Tasks |
| ----------- | ----- |
| PHOTO-01 | T1 |
| PHOTO-02 | T1 |
| PHOTO-03 | T2 |
| PHOTO-04 | T3 |
| PHOTO-05 | T3 |
| PHOTO-06 | T3 |
| PHOTO-07 | T3 |
| PHOTO-08 | T3 |
| PHOTO-09 | T4 |
| PHOTO-10 | T4 |
| PHOTO-11 | T2 |
| PHOTO-12 | T3 |
| PHOTO-13 | T4 |
| PHOTO-14 | T2 |
| PHOTO-15 | T2, T4 |
| PHOTO-16 | T1 |
| PHOTO-17 | T1 |
| PHOTO-18 | T5, T6 |
| PHOTO-19 | T5, T6 |
| PHOTO-20 | T5, T6 |
| PHOTO-21 | T6 |
| PHOTO-22 | T6 |
| PHOTO-23 | T6 |
| PHOTO-24 | T5 |
| PHOTO-25 | T6 |
| PHOTO-26 | T7 |
| PHOTO-27 | T7 |
| PHOTO-28 | T5, T7 |
| PHOTO-29 | T5, T7 |
| PHOTO-30 | T5, T7 |
| PHOTO-31 | T5, T7 |
| PHOTO-32 | T7 |
| PHOTO-33 | T5, T7 |
| PHOTO-34 | T5, T7 |
| PHOTO-35 | T8 |

## Closing Verification

Após a T8, despachar um verificador novo com spec, diff da feature e testes. O verificador confirma resultados por critério, injeta falhas em cópia temporária e comprova que os testes as detectam. Não modificar o diretório real durante o sensor. Escrever validation.md com evidências file:line e veredito. Executar validate_state.py antes de declarar a entrega local concluída.

A conexão real e a publicação permanecem distinguíveis do resultado local. Ausência de credenciais não pode ser reportada como teste de integração real bem-sucedido.
