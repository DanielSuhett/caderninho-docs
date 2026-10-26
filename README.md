# caderninho-docs

Guias públicos do Caderninho, em uma aplicação independente do produto financeiro.

Base oficial `+next+fuma-docs-mdx+static`, criada por `create-fumadocs-app`.
Next.js exporta HTML, busca local, Markdown, `llms.txt` e imagens OG em `out/`.
O domínio previsto é `docs.usecaderninho.com`, mantendo a rota `/docs`.
O código-fonte fica no GitHub em um repositório independente. O deploy do site e a configuração do domínio são etapas separadas.

## Preparar e revisar

```bash
mise exec -- npm ci
mise exec -- npm run dev -- --hostname 127.0.0.1
```

Abra `http://localhost:3000/docs`. Para validar e servir exatamente o export estático:

```sh
mise exec -- npm run check
mise exec -- npm run start -- --listen tcp://127.0.0.1:3001
```

Abra `http://localhost:3001/docs`. O `check` verifica tipos, build, links internos,
âncoras, os arquivos para agentes e a presença de todas as referências MCP.

## Conteúdo e manutenção

`content/docs` reúne tutoriais em português, manutenção, extensões Pluggy e
referências técnicas. `meta.json` determina a navegação. Cada ferramenta MCP tem
página própria, parâmetros, schema completo e exemplo sintético validado.

Atualize o catálogo e a cópia dos documentos técnicos a partir do checkout do
produto, que precisa ter suas dependências instaladas:

```sh
mise exec -- npm run sync:source -- /caminho/para/caderninho
mise exec -- npm run check
```

O script lê os contratos, gera o catálogo, os schemas e exemplos, valida os
exemplos e sincroniza documentos técnicos e o pacote de regras do projeto-fonte.
Também extrai os tokens semânticos de tema do produto para um snapshot separado;
o site mantém seus componentes Fumadocs e não carrega o CSS ou os componentes Kumo
do produto. A sincronização não executa ferramentas, consulta bancos nem lê
secrets. Os tutoriais autorais não são sobrescritos. O site usa o snapshot
versionado, sem depender de outro checkout durante o build.

`data/source-manifest.json` registra commit, alterações locais e hashes de origem.
`data/catalog.json` alimenta a busca por categoria, função e efeito. O snapshot
completo de schemas também fica em `public/examples/mcp-tools.json`.

Não edite `.source/` ou `.next/`: são gerados. Fontes e avisos de licença ficam em
`public/fonts`. Os guias usam dados de exemplo e não incluem acesso financeiro.

## Diagramas e capturas

`components/journey-diagram.tsx` mantém os três fluxos de início e o mapa de
acesso por titular. Os diagramas usam HTML, SVG e os tokens de tema do site;
não dependem de um serviço externo para renderizar.

`data/guide-images.json` registra as capturas, dimensões, texto alternativo,
legenda e origem. As imagens locais ficam em `public/guides/2026-10`. As duas
referências da Pluggy usam as URLs públicas da documentação do provedor, com
crédito, sem copiar telas da conta privada. O componente `GuideScreenshot`
oferece ampliação e navegação pelo visualizador do Fumadocs.

As capturas do Caderninho usam seus componentes reais com fixtures e não
comprovam autorização bancária ou importação real. A chave e o endereço exibidos
são fictícios. A captura Cloudflare mostra somente o formulário anterior ao
deploy, sem identificadores da conta. Ao atualizar imagens, confira o roteiro,
os rótulos e os créditos; o check também procura imagens locais ausentes e
texto alternativo faltante.

## Publicação

O site está público em <https://docs.usecaderninho.com> pelo Cloudflare Pages,
no projeto `caderninho-docs`. O projeto acompanha o repositório
`DanielSuhett/caderninho-docs`, branch `main`, e publica automaticamente a cada
push nessa branch.

A configuração de build é `npm run build`, com saída em `out`. O export é
estático: não usa bindings financeiros nem secrets do produto. As rotas HTML,
a busca e os arquivos Markdown são publicados junto com o site.
