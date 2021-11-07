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