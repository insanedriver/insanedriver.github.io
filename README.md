## Primeiros passos

### Instalar o less e o watch compiler.

O watch compiler vai ficar escutando os arquivos salvos e atualizar a página automaticamente.

Para instalar o less:
```
npm install -g less
```

Para instalar o less-watch-compiler:
```
npm install -g less-watch-compiler
```

OBS: Não deixar de instalar globalmente (flag `-g`).

### Instalar o 11ty através do package.json

Para instalar o 11ty e qualquer outro pacote do package.kson:
```
npm install
```

Estes pacotes devem ser instalados localmente.

## Usando

### Watch compiler

O comando para escutar as alterações nos arquivos é:

```
npm run watch
```

As configurações estão nos arquivos:
 - [less-watch-compiler.config.json](./less-watch-compiler.config.json)
 - [.eleventy.js](./.eleventy.js)


Na parte do less, o intuito é ter um arquivo principal (no diretório `less`) definido nesse arquivo de configuração, que vá importar todos os arquivos menores e incluir em um só arquivo de saída (no diretório `css`).

Na parte do Eleventy (11ty), ele captura todos os arquivos .html, jutamente com os arquivos dentro dos diretórios `_includes` e `assets`, compila e joga no diretório `docs`. Esse diretório que deve ser o que o Github Pages lê como home.

Quando for fazer os commits, lembrar de commitar os arquivos .less modificados e .css gerados.

## Photos e Instagram

A página `/photos/` contém seis destaques, o acervo de 17 fotos e uma seção estática do Instagram. O navegador recebe imagens locais; a consulta à API acontece somente na automação. As fotos locais funcionam mesmo sem configurar o Instagram.

### Desenvolvimento local

Use Node 24, a mesma versão major do workflow:

```sh
npm ci
npm run build
npm test
```

Os testes usam dados sintéticos em diretórios temporários e não consultam a conta real. Os testes de navegador usam o Chrome instalado ou o Chromium do Playwright. Se nenhum estiver instalado, execute `npx playwright install chromium`; também é possível informar o executável em `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

`npm run build` não lê credenciais nem consulta a API. O loader lê somente `assets/instagram/feed.json` e as imagens locais. Os arquivos LESS e `assets/css/style.min.css` gerado devem acompanhar o commit. A saída `docs/` continua sendo gerada pelo Eleventy; não atualizar seu gitlink nem criar commits dentro dela.

### Primeiro uso: autorização da conta

1. O administrador deve usar uma conta profissional (empresa ou criador) para **@insanedriverid** e configurar um aplicativo Meta com **Instagram API with Instagram Login**. Esse fluxo não exige vincular uma página Facebook. Solicite somente a permissão de leitura básica `instagram_business_basic`, conforme a [coleção oficial da Meta](https://www.postman.com/meta/instagram/folder/6raa77c/instagram-api-with-instagram-login).
2. Autorize a conta pelo fluxo oficial e confirme os papéis de administrador/testador ou as condições de acesso de produção exigidas no painel. Use o ID numérico da conta Instagram retornado pelo fluxo, não o nome de usuário ou um ID de página Facebook.
3. Consulte a [documentação de configuração da Meta](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started/) e selecione uma versão da API ainda suportada para esse aplicativo. Não existe versão padrão no código. A forma esperada é `vNN.0`; o valor `v25.0` usado nos testes é uma fixture, não uma indicação de versão vigente.
4. Nas configurações do repositório, em **Secrets and variables → Actions**, cadastre os valores abaixo. Nunca coloque o token em commits, mensagens, capturas ou variáveis públicas.

| Tipo | Nome | Valor |
| --- | --- | --- |
| Secret | `INSTAGRAM_ACCESS_TOKEN` | Token autorizado pelo administrador para ler a conta |
| Variable | `INSTAGRAM_USER_ID` | ID numérico da conta Instagram |
| Variable | `INSTAGRAM_API_VERSION` | Versão suportada confirmada no aplicativo Meta |

O adaptador usa `Authorization: Bearer` somente em `graph.instagram.com`. Consulta `/{version}/{user-id}/media` com `id,media_type,media_url,permalink,timestamp,caption`; para álbuns, consulta `/{version}/{media-id}/children` com `id,media_type,media_url` e `limit=1`. Usa cursores no endpoint fixo, sem seguir links de paginação externos. Antes de ativar, confirme esses campos, a paginação e que o primeiro filho corresponde à capa da publicação real. Álbuns cuja capa é vídeo são omitidos.

**Estado da ativação:** implementação e testes locais concluídos; conta, credenciais, contrato real da API e publicação ainda precisam ser validados pelo administrador. Em 14/09/2026, as páginas detalhadas da Meta retornaram HTTP 429 durante a consulta. A coleção oficial confirmou o fluxo de autorização, mas não permitiu fechar todos os detalhes da API. Nenhuma sincronização real foi executada para esta entrega.

### Execução e resultado

Após a publicação autorizada do código em `master`, use **Actions → Build and Deploy → Run workflow**, selecionando `master`. Push, execução manual e o cron `17 */6 * * *` seguem a mesma sequência: recuperar a seleção publicada em `release`, sincronizar, compilar e publicar. O checkout usa a versão atual de `master` quando o job começa; um grupo comum impede duas publicações simultâneas. Não presuma que execuções serão processadas na ordem em que foram solicitadas.

O agendamento usa UTC (00:17, 06:17, 12:17 e 18:17). Pode sofrer atrasos e só opera na branch padrão; `master` deve permanecer a branch padrão para este fluxo. Repositórios públicos podem ter o agendamento desativado após 60 dias sem atividade. Consulte os [eventos agendados do GitHub](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) e o [controle de concorrência](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).

Leia o resumo do passo **Synchronize Instagram**:

- `success`: a consulta terminou, todas as imagens selecionadas foram obtidas e a seleção foi substituída. Zero posts é um resultado válido e limpa a seleção antiga.
- `retained`: houve falha ou falta de configuração; a última seleção válida foi preservada.
- `no_selection`: não há seleção válida disponível; a página oferece o link para o perfil.

O resumo contém apenas status, contagem e uma categoria de erro, sem token ou resposta bruta da API. Falha ao recuperar a branch publicada interrompe o job antes da publicação. Só a ausência comprovada de branch ou seleção permite iniciar vazio.

Para executar apenas a sincronização local, use `node scripts/sync-instagram.cjs`. Sem as três configurações, ele não acessa a rede. Se um administrador fizer um teste autorizado com credenciais, forneça-as pelo ambiente do processo, não por argumentos ou arquivos versionados. Os arquivos gerados em `assets/instagram/` são ignorados na branch fonte.

### Expiração, revogação e recuperação

Registre o prazo real retornado pela Meta (`expires_in` e a data de emissão, ou a expiração exibida pelo painel). O token não é permanente; não trate um prazo genérico como garantia para a credencial emitida. Antes de expirar, siga o procedimento oficial de renovação aplicável ao token e atualize manualmente o secret. Não há rotina que regrave secrets nem necessidade de criar um PAT adicional.

Se o token expirar ou for revogado, a seleção anterior permanece disponível. O administrador deve reautorizar a conta quando necessário, substituir `INSTAGRAM_ACCESS_TOKEN`, executar manualmente o workflow e verificar `success`, a contagem e as fotos em `/photos/`. Se o resumo indicar `configuration`, confira também ID e versão. Em `http`, confira o estado da autorização e as cotas no painel Meta; em `limit` ou `timeout`, investigue antes de alterar os limites do código.

Se o agendamento parar, confira a branch padrão e se o workflow está habilitado em Actions; reative-o e execute uma rodada manual. Não publique uma seleção vazia para contornar um erro de recuperação da versão anterior.

### Desativação e exclusão explícitas

Uma falha transitória preserva as fotos; remover apenas o token também preserva o último snapshot. Para remover a integração e suas cópias, o administrador deve:

1. Desabilitar o workflow e aguardar o término de qualquer execução ativa antes da manutenção.
2. Revogar a autorização na Meta e remover o secret e as duas variables do repositório.
3. Remover `assets/instagram/` da árvore publicada de `release` em uma alteração administrativa autorizada. Limpar também esse diretório e `docs/assets/instagram/` em checkouts locais usados para publicação. Isso elimina a seleção atual e deixa a chamada ao perfil no próximo build.
4. Publicar a limpeza e verificar que as antigas URLs de imagem não são mais servidas. Reativar o workflow com a configuração vazia permite continuar publicando o restante do site sem sincronizar.
5. Avaliar o histórico Git da branch `release`, clones e caches: excluir a árvore atual não apaga commits antigos. Quando a exclusão também precisar atingir histórico ou caches, coordene a limpeza com os administradores e os provedores; ela pode exigir reescrita de histórico. Não há remoção automática dessas cópias.

Nenhuma conta, secret, branch remota ou histórico foi alterado durante o desenvolvimento local.
