# Photos Cyberpunk Context

**Gathered:** 2026-09-13
**Spec:** .specs/features/photos-cyberpunk/spec.md
**Status:** Especificação, design e tarefas aprovados; implementação local em revisão final.

## Feature Boundary

Modernizar a página Photos com um carrossel na identidade cyberpunk do site e uma seção com publicações de @insanedriverid. O site permanece estático, gerado pelo Eleventy e publicado no GitHub Pages.

## Implementation Decisions

### Identidade visual

- O usuário confirmou que Photos deve seguir a linha cyberpunk do site.
- A proposta aceita usa neon, molduras angulares e elementos de interface futurista no carrossel.

### Integração com Instagram

- O usuário aceitou a consulta à API oficial durante uma automação no GitHub Actions.
- A autorização será feita pelo administrador da conta da banda; visitantes não precisarão autenticar.
- Credenciais permanecerão nos secrets do GitHub e não serão incluídas nos arquivos públicos.
- A implementação depende da configuração de uma conta profissional e da autorização correspondente. A disponibilidade dessas credenciais ainda não foi verificada.
- O aceite da arquitetura não representa autorização para publicar mudanças remotas nesta etapa.

### Galeria e carrossel

- Carrossel principal com 6 destaques do acervo local.
- Setas, miniaturas e gesto de arrastar no celular; sem avanço automático.
- Clique abre a foto ampliada.
- Grade abaixo do carrossel preserva acesso às 17 fotos atuais.

### Publicações e atualização

- Até 12 publicações recentes com fotos; atualização agendada a cada 6 horas.
- Clique abre a publicação no Instagram; álbuns aparecem pela capa.
- Reels ficam fora desta primeira versão.
- Falha na sincronização preserva a última seleção disponível.
- Antes da primeira sincronização, a seção oferece um link para @insanedriverid.

## Existing Project Facts

- A página atual contém 17 fotos locais e usa PhotoSwipe para visualização ampliada.
- Eleventy gera o site em `docs/`.
- `.github/workflows/main.yml` compila e publica o site quando há push em `master`.
- A newsletter oferece referências locais de paleta neon, molduras e tipografia.

## Specific References

O usuário respondeu “Todas recomendacoes” à rodada que definiu os comportamentos acima. A identidade visual segue o restante do site, especialmente a newsletter.

## Agent's Discretion

Escolhas de implementação seguem a stack existente. Os detalhes de borda necessários para critérios verificáveis estão explicitados na tabela de premissas da especificação.

## Open Product Decisions

Nenhuma decisão principal pendente. A autorização da conta e a instalação dos secrets são pré-requisitos operacionais ainda não verificados.

## Deferred Ideas

Nenhuma.
