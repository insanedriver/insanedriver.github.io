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

## Photos

A página `/photos/` usa a identidade cyberpunk do site, com seis destaques em carrossel manual e o acervo completo de 17 fotos. Setas, miniaturas e gestos no celular navegam pelos destaques; clicar em uma foto abre o PhotoSwipe, com zoom e navegação por teclado.

O catálogo fica em `_data/photos.json`; `_data/highlights.js` seleciona os seis destaques pela propriedade `highlightOrder`. As imagens e miniaturas são arquivos locais em `assets/gallery/`.

### Desenvolvimento local

Use Node 24, a mesma versão major do workflow:

```sh
npm ci
npm run build
npm test
```

Os testes verificam o catálogo, o carrossel, o visualizador, a acessibilidade e o layout em 320, 390, 768 e 1440 px. Os testes de navegador usam o Chrome instalado ou o Chromium do Playwright. Se nenhum estiver instalado, execute `npx playwright install chromium`; também é possível informar o executável em `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

Os arquivos LESS e `assets/css/style.min.css` gerado devem acompanhar o commit. A saída `docs/` é gerada pelo Eleventy; não atualizar seu gitlink nem criar commits dentro dela.

### Publicação

O workflow **Build and Deploy** verifica os dados, compila e publica em `release` após um push em `master` ou execução manual na `master`. A galeria usa apenas o acervo local e não precisa de tokens, callbacks ou configuração de APIs. Não há atualização agendada.
