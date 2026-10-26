# Revisão local da documentação

## Método

Três subagentes `gpt-6-luna` simularam as perspectivas de uma pessoa programadora,
uma pessoa interessada em tecnologia e uma pessoa leiga. Cada um fez uma crítica
inicial, revisou arquivos de um escopo separado e participou de uma leitura
cruzada. Essas simulações ajudam a encontrar obstáculos; não substituem testes
com pessoas reais.

A escrita segue a skill [technical-storytelling de Daniel Suhett](https://github.com/DanielSuhett/dotfiles/blob/main/.agents/skills/technical-storytelling/SKILL.md),
lida pelo GitHub autenticado. A revisão foi adaptada para guias: explicar a tarefa,
quem age, a consequência e como conferir o resultado. Foram preservados os
contratos, os exemplos técnicos e as ressalvas das fontes. As referências copiadas
do produto conservam sua prosa original.

## Feedback aplicado

| Perspectiva | Obstáculo encontrado | Mudança aplicada |
| --- | --- | --- |
| Pessoa leiga | Chave do painel, senha bancária e credenciais Pluggy apareciam misturadas | Os guias de início separam os acessos e os responsáveis; o guia de assistentes explica MCP e OAuth |
| Pessoa leiga | A família precisava juntar etapas e não sabia o efeito de uma conexão interrompida | O guia familiar tem um roteiro de cinco passos; manutenção distingue pausa, autorização expirada e histórico já salvo |
| Interessado em tecnologia | O convite para conectar IA levava ao catálogo e o acesso familiar podia parecer isolado | O convite leva ao guia de conexão; filtros por titular são apresentados como organização, com acesso compartilhado explícito |
| Interessado em tecnologia | As extensões Pluggy podiam parecer recursos disponíveis no Caderninho | O inventário separa capacidades atuais das possibilidades que exigiriam desenvolvimento e contratação |
| Pessoa programadora | A origem de alguns IDs estava incorreta e um exemplo de movimentação usava o mesmo destino | O gerador indica consultas por entidade, usa outro destino de exemplo e informa que IDs são fictícios |
| Pessoa programadora | A atualização não dizia como preservar recursos e acessos | O guia explica o deploy suportado, a ordem das migrações e o papel de D1, KV, secrets e bindings |

## Pontos encontrados na leitura cruzada

O disponível de cartão com limite local é uma estimativa, diferente do disponível
informado pelo banco. O guia agora explica a ocupação preservada e o resultado
indisponível quando faltam os dados de origem.

O ID de uma contribuição vem do resultado de `add_goal_contribution`.
`get_goal_plan` não lista contribuições. Essa limitação está descrita no parâmetro
de remoção, sem inventar uma consulta ausente do contrato atual.

## Temas e isolamento

Os dois temas usam um snapshot de 30 tokens semânticos do Caderninho e do Kumo
2.14.0, com Inter local, tema escuro inicial e seleção neutra. Os valores e hashes
de origem ficam em `data/theme-manifest.json`. O site conserva seus componentes
Fumadocs e não carrega os estilos globais nem o runtime do produto financeiro.

O projeto continua em um repositório local separado. A publicação em
`docs.usecaderninho.com` depende da aprovação da prévia local.

## Validação local em 26/10/2026

1. `npm run check` concluiu tipos, build estático e verificação de destinos e âncoras: 171 páginas HTML, 6.780 links internos e 104 referências de ferramentas.
2. `sync:source` validou os 104 exemplos sintéticos com os schemas de entrada, sem executar as ferramentas. Exemplos de edição incluem uma alteração efetiva; exemplos de movimento usam outro espaço de destino.
3. No navegador, foram conferidos temas claro e escuro, seleção neutra, Inter, busca em português por reautorização e filtros de categoria, função e efeito. Catálogo, referência de `edit_transaction` e guia familiar foram inspecionados em 320 CSS px sem rolagem horizontal da página.
4. A validação cobre a documentação local. Não houve publicação, autorização OAuth real, consulta financeira nem teste com usuários reais.

O otimizador de CSS emitiu dois avisos sobre `::highlight(fd-search)`, vindo da
biblioteca. O recurso foi preservado; a busca em português retornou os guias
esperados no navegador inspecionado. Não foi feita uma auditoria completa de
acessibilidade ou de outros navegadores.

## Revisão com Humanizer

A [skill Humanizer](https://github.com/blader/humanizer/blob/main/SKILL.md), versão
3.1.0, orientou uma segunda revisão editorial. Foram alterados 14 guias autorais e
a prosa das 104 referências de ferramentas. A página inicial perdeu a frase que
repetia as três opções já apresentadas nos cartões.

| Padrão | Trecho revisado |
| --- | --- |
| Abertura ensaiada | A introdução da Pluggy passou a explicar quem configura a aplicação e quem autoriza os bancos |
| Fechamento que repete a explicação | A página de visão geral mantém a diferença entre data da consulta e última importação, sem repetir a conclusão |
| Narração do processo de escrita | Os exemplos orientam a substituir IDs fictícios; os detalhes de validação ficam na referência e no contrato comum |
| Ressalvas repetidas | O guia de assistentes explica o acesso de todos os titulares no início e evita repeti-lo depois |

Os contrastes que delimitam comportamento foram mantidos: filtro de pessoa não é
uma permissão isolada, uma consulta não inicia coleta e valores desconhecidos não
viram zero. A revisão compara as versões e preserva frontmatter, blocos de código,
código inline, destinos de links, schemas e dados. Os 18 documentos técnicos
copiados do produto mantêm seus textos originais.

## Condições de uso da Pluggy

Revisão em 26/10/2026 dos [termos e da política de privacidade](https://www.pluggy.ai/legal),
do [PDF vinculado nessa página](https://www.pluggy.ai/docs/termos-e-condicoes-de-uso.pdf),
do [guia pessoal](https://docs.pluggy.ai/pt/docs/guides/meu-pluggy-personal-use),
do [guia de acesso via API](https://meu.pluggy.ai/api-guide) e da
[página de preços](https://www.pluggy.ai/precos).

O guia pessoal descreve as próprias contas, para uso não comercial. Não foi
encontrado esclarecimento expresso para a consolidação familiar nos materiais
consultados. Por isso, a orientação editorial é confirmar esse cenário com a
Pluggy antes de conectar dados de outro titular. Essa condição é uma decisão
conservadora da documentação, sem afirmar proibição ou aprovação do provedor.
O código disponível para organizar titulares não estabelece autorização contratual.

O início dos guias passou a usar as próprias contas como exemplo. O roteiro familiar
continua disponível, condicionado à modalidade aplicável e ao acordo dos titulares.
Foram mantidos o administrador único, o acesso de todos os assistentes ao conjunto
da instalação e a ausência de permissões isoladas por filtro. Credenciais extras
não são apresentadas como forma de ampliar cotas. A seção de assistentes explica
o envio de resultados ao serviço escolhido e os limites da revogação.

O mapa de extensões continua completo e distingue recursos implementados,
contratos de dados no código e contratação comercial. Para pagamentos, a orientação
considera o consentimento específico descrito no HTML público atual. O PDF
vinculado não contempla iniciação de transações; a divergência não foi usada
para afirmar que pagamentos são proibidos.

Cinco referências técnicas receberam uma nota no aviso que antecede o documento.
O corpo original foi preservado. O gerador inclui a mesma nota nas próximas
sincronizações; a sincronização integral não foi executada nesta revisão.
Os três subagentes Luna fizeram uma leitura simulada, somente de revisão.
As sugestões aplicadas esclareceram a localização das credenciais, evitaram uma
leitura de aprovação ampla e distinguiram contratos de API de contratação comercial.

Não houve contato com a Pluggy ou confirmação para uma conta específica. A revisão
de texto não certifica conformidade da integração ou autorização de uso familiar.
O site permanece local, aguardando aprovação antes de publicar.

A validação desta revisão concluiu `npm run check`: tipos, build e 6.795 links
internos em 171 páginas HTML. As 104 ferramentas e os snapshots de dados foram
comparados com a cópia anterior e permanecem iguais. Blocos de código, comandos,
código inline e o corpo das referências também foram preservados. No navegador,
o aviso do guia familiar e a seção Uso pessoal e limites renderizaram na prévia
local. A aba familiar já aberta pelo usuário foi atualizada.

## Diagramas e capturas das jornadas

Foram adicionados três fluxos de início e um mapa de acesso por titular. A escolha
da conta GitHub aparece dentro da Cloudflare. A consulta parcial fica como opção
durante a importação, sem se tornar uma etapa obrigatória antes de conectar IA.
As condições para dados de outro titular e o acesso integral do administrador e
dos assistentes foram preservados.

As 11 imagens distintas têm legenda, texto alternativo, origem e ampliação pelo
Fumadocs. Nove arquivos locais somam 248 KB. Duas imagens continuam nas URLs
públicas da documentação da Pluggy, conforme a preferência do usuário:
[seleção de conectores](https://docs.pluggy.ai/pt/docs/guides/dashboard-connectors)
e [conector MeuPluggy](https://docs.pluggy.ai/pt/docs/guides/meu-pluggy-personal-use).
As páginas e os dois assets públicos foram inspecionados no navegador.

As três capturas da Cloudflare mostram o formulário do botão de instalação,
com nomes de exemplo e recorte que exclui os identificadores da conta. A seleção
de D1 foi alterada somente no formulário, para mostrar a criação de um recurso
novo. Não houve envio do formulário, criação de repositório ou recurso, nem deploy.

As seis capturas do Caderninho usam os componentes reais de acesso e Pessoas,
com fixtures isoladas. O checkout consultado estava em `cc2e5a4` com alterações
locais de outros trabalhos. O harness ficou em `.preview/capture`, ignorado pelo
Git, sem alterar o produto. Sua API e os envios de formulários ficaram bloqueados;
credenciais, nomes de bancos, origem e estados de importação são fictícios.
A renderização de acesso usa o próprio componente `GeneratedAccess`, com uma
chave sintética. Nenhuma autorização Pluggy ou OAuth foi executada.

As personas Luna revisaram os rótulos e a ordem das etapas. As sugestões aplicadas
esclareceram onde a conta GitHub é escolhida, o seletor efetivamente mostrado na
captura de D1 e o caráter opcional da consulta parcial. A revisão continua sendo
uma simulação, sem participação de usuários reais.

### Validação desta rodada

`npm run check` passou: 171 páginas HTML, 6.796 links internos, 14 ocorrências de
imagem e 104 ferramentas. O verificador agora confere imagens locais ausentes e
atributos `alt`. Ele encontrou o botão Cloudflare da referência técnica usando
`/_next/image`, incompatível com o export estático. As imagens Markdown passaram
a usar uma tag nativa com carregamento adiado; os textos técnicos não mudaram.

| Página ou componente | Evidência local |
| --- | --- |
| Instalar | Fluxo e capturas inspecionados no navegador; galeria abriu com Enter, avançou com seta direita e fechou com Escape; a imagem da chave carregou no visualizador |
| Preparar o Meu Pluggy | Campos de credenciais e as duas imagens públicas carregaram; créditos e escolha do conector conferidos |
| Família | Mapa e condição de uso presentes; largura de 320 CSS px sem rolagem horizontal da página; temas claro e escuro e navegação por teclado conferidos |
| Adicionar outra pessoa | Aba do usuário recarregada; nova imagem, legenda e link para a seleção do conector presentes |
| Primeiro acesso e importações | Build, imagens e links conferidos; os estados foram capturados nos componentes reais com fixtures, sem uma nova passagem visual completa por estes dois artigos |

O fluxo linear também se reorganizou em uma coluna em largura inferior a 320 CSS
px. O tamanho normal e o tema escuro foram restaurados após a inspeção. A comparação
com a cópia anterior confirmou que os schemas, exemplos, 104 referências MCP e
corpos dos documentos técnicos permanecem iguais. A evidência cobre documentação
e renderização local, sem validar uma instalação nova na Cloudflare, consentimento
bancário, importação real ou uma sessão de assistente.
