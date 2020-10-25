## Primeiros passos

Instalar o less e o watch compiler. O watch compiler vai ficar escutando os arquivos salvos e atualizar a página automaticamente.

Para instalar o less:
```
npm install
```

Para instalar (globalmente) o less-watch-compiler:
```
npm install -g less-watch-compiler
```

## Usando

### Watch compiler

O comando para escutar as alterações nos arquivos é:

```
less-watch-compiler
```

As configurações estão no arquivo [less-watch-compiler.config.json](../less-watch-compiler.config.json).  
O intuito é ter um arquivo principal (no diretório `less`) definido nesse arquivo de configuração, que vá importar todos os arquivos menores e incluir em um só arquivo de saída (no diretório `css`).

Quando for fazer os commits, lembrar de commitar os arquivos .less modificados e .css gerados.