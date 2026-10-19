## Primeiros passos

As dependências (incluindo o `less`) vêm do `npm install`. Não é preciso instalar nada globalmente.

## Usando

### Build

O comando para compilar o CSS uma vez é:

```
npm run less:build
```

Ele roda [scripts/build-css.cjs](../scripts/build-css.cjs), que compila `less/core.less` em `assets/css/core.min.css` (estilos que toda página carrega) e cada `less/pages/<area>.less` em `assets/css/<area>.min.css` (estilos de uma área do site). Um arquivo novo em `less/pages/` vira um bundle novo automaticamente.

### Watch

O comando para servir o site e recompilar o CSS a cada arquivo salvo é:

```
npm run watch
```

Quando for fazer os commits, lembrar de commitar os arquivos .less modificados e .css gerados.
