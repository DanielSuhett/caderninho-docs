import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncTheme } from './sync-theme.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.argv[2] ?? '../caderninho');
const sourceDocs = path.join(source, 'docs');
const output = path.join(root, 'content/docs/assistentes/ferramentas');
const categories = [
  { id: 'instalacao', title: 'Instalação e dados da origem', description: 'Conferir conexões, pedir importação e consultar os registros bancários preservados.', pattern: /^caderninho_/ },
  { id: 'contas', title: 'Contas e organização', description: 'Consultar contas, ajustar sua apresentação e organizar os espaços da instalação.', pattern: /account|connection|space/ },
  { id: 'transacoes', title: 'Transações e compras', description: 'Consultar compras, registrar lançamentos e editar sua apresentação local.', pattern: /transaction/ },
  { id: 'analises', title: 'Análises e assinaturas', description: 'Entender gastos, comparar períodos e investigar candidatos a cobranças recorrentes.', pattern: /overview|spending|analyze|chart|subscription/ },
  { id: 'cartoes', title: 'Cartões, faturas e parcelas', description: 'Acompanhar gastos, faturas, limites e parcelas recebidas ou cadastradas.', pattern: /card|bill|installment/ },
  { id: 'categorias', title: 'Categorias e etiquetas', description: 'Organizar categorias, agrupadores e etiquetas usadas nas transações.', pattern: /category|categories|tag/ },
  { id: 'regras', title: 'Regras de classificação', description: 'Criar e simular regras, importar pacotes e reaplicar ao histórico após revisão.', pattern: /rule/ },
  { id: 'orcamento', title: 'Orçamento e projeções', description: 'Definir limites, acompanhar o ciclo e consultar compromissos e projeções.', pattern: /budget|projection|upcoming|category_limit/ },
  { id: 'recorrencias', title: 'Recorrências cadastradas', description: 'Planejar contas fixas e receitas mensais sem inventar lançamentos bancários.', pattern: /recurrence/ },
  { id: 'investimentos', title: 'Investimentos', description: 'Consultar a carteira e manter posições manuais e sua inclusão no patrimônio.', pattern: /investment/ },
  { id: 'dividas', title: 'Dívidas e conciliação', description: 'Acompanhar empréstimos, cronogramas SAC e conciliar parcelas com registros existentes.', pattern: /loan|scheduled_payment/ },
  { id: 'metas', title: 'Metas e contribuições', description: 'Planejar objetivos, acompanhar aportes e vincular patrimônio sem dupla contagem.', pattern: /goal/ },
  { id: 'avisos', title: 'Preferências de avisos', description: 'Consultar e guardar preferências; o registro não configura um serviço de entrega.', pattern: /notification/ },
];

// Ordem explícita evita que "preview_rule_import" vire importação bancária,
// "remove_category_limit" vire CRUD de categoria ou tags virem edição monetária.
function categoryOf(name) {
  if (name.includes('rule')) return 'regras';
  if (name.includes('goal')) return 'metas';
  if (name.includes('category_limit')) return 'orcamento';
  if (name.includes('tag')) return 'categorias';
  const category = categories.find(item => item.pattern.test(name));
  if (!category) throw new Error(`Ferramenta sem categoria: ${name}`);
  return category.id;
}
function functionOf(name) {
  if (name === 'caderninho_sync') return 'Sincronizar';
  if (/^preview/.test(name)) return 'Simular';
  if (/^analyze|^generate|get_spending|get_overview|get_projection|get_subscriptions|get_goal_plan/.test(name)) return 'Analisar';
  if (/^get_|^caderninho_/.test(name)) return 'Consultar';
  if (/^create_/.test(name)) return 'Criar';
  if (/^delete_|^batch_delete/.test(name)) return 'Excluir';
  if (/^move_/.test(name)) return 'Mover';
  if (/^import_/.test(name)) return 'Importar';
  if (/^apply_/.test(name)) return 'Aplicar';
  if (/^(un|remove|reopen)/.test(name)) return 'Remover ou desfazer';
  if (/^(link|attach|add)/.test(name)) return 'Vincular ou registrar';
  return 'Editar ou configurar';
}

const idSources = {
  add_goal_contribution: 'get_goals',
  complete_goal: 'get_goals',
  complete_installment: 'get_installments',
  create_manual_loan_schedule: 'get_loans',
  deactivate_recurrence: 'get_recurrences',
  delete_card: 'get_cards',
  delete_category: 'get_categories',
  delete_category_group: 'get_category_groups',
  delete_goal: 'get_goals',
  delete_manual_account: 'get_accounts',
  delete_manual_investment: 'get_investments',
  delete_manual_loan: 'get_loans',
  delete_rule: 'get_rules',
  delete_space: 'get_spaces',
  delete_tag: 'get_tags',
  delete_transaction: 'get_transactions',
  edit_transaction: 'get_transactions',
  get_goal_plan: 'get_goals',
  get_loan_schedule: 'get_loans',
  link_goal_asset: 'get_goals',
  mark_bill_paid: 'get_bills',
  move_account: 'get_accounts',
  reconcile_scheduled_payment: 'get_loans',
  remove_category_limit: 'get_categories',
  remove_goal_contribution: 'get_goals',
  reopen_installment: 'get_installments',
  replace_manual_loan_schedule: 'get_loans',
  set_category_limit: 'get_categories',
  set_investment_inclusion: 'get_investments',
  set_loan_visibility: 'get_loans',
  set_primary_card: 'get_cards',
  undo_scheduled_payment: 'get_loans',
  unlink_goal_asset: 'get_goals',
  unlink_goal_transaction: 'get_goals',
  unmark_bill_paid: 'get_bills',
  update_account_settings: 'get_accounts',
  update_card: 'get_cards',
  update_category: 'get_categories',
  update_category_group: 'get_category_groups',
  update_goal: 'get_goals',
  update_installment: 'get_installments',
  update_manual_investment: 'get_investments',
  update_manual_loan: 'get_loans',
  update_recurrence: 'get_recurrences',
  update_rule: 'get_rules',
  update_space: 'get_spaces',
  update_tag: 'get_tags',
};

const exportCode = 'import {tools} from "./src/contracts/index.ts"; process.stdout.write(JSON.stringify(tools));';
const tools = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', exportCode], { cwd: source, maxBuffer: 12 * 1024 * 1024, encoding: 'utf8' }));
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: source, encoding: 'utf8' }).trim();
const dirty = !!execFileSync('git', ['status', '--porcelain'], { cwd: source, encoding: 'utf8' }).trim();

const examples = {};
function sample(schema, key = '') {
  if (Object.hasOwn(schema, 'const')) return schema.const;
  if (Object.hasOwn(schema, 'default') && schema.default !== null) return schema.default;
  if (schema.enum) return schema.enum.includes('BRL') ? 'BRL' : schema.enum[0];
  if (schema.anyOf || schema.oneOf) return sample((schema.anyOf ?? schema.oneOf).find(item => item.type !== 'null') ?? {}, key);
  if (schema.type === 'object') return Object.fromEntries((schema.required ?? []).map(name => [name, sample(schema.properties[name], name)]));
  if (schema.type === 'array') return Array.from({ length: Math.max(1, schema.minItems ?? 1) }, () => sample(schema.items ?? {}, key.replace(/Ids$/, 'Id')));
  if (schema.type === 'boolean') return true;
  if (schema.type === 'number' || schema.type === 'integer') return Math.max(schema.minimum ?? 0, key === 'total' ? 12 : key.includes('Day') ? 10 : 1);
  if (schema.type === 'null') return null;
  if (schema.format === 'date' || /^(from|to|date|startDate|endDate|targetDate|firstPaymentDate)$/.test(key)) return key === 'to' ? '2026-10-31' : '2026-10-01';
  if (schema.format === 'date-time') return '2026-10-26T12:00:00.000Z';
  if (schema.format === 'email') return 'pessoa@example.com';
  if (schema.format === 'uri') return 'https://example.com';
  if (key === 'spaceId' || key === 'targetSpaceId' || key === 'destinationSpaceId') return 'personal';
  if (key === 'idempotency_key') return 'docs-exemplo-01';
  if (key === 'currency') return 'BRL';
  if (key.toLowerCase().includes('minor')) return '10000';
  if (key === 'color') return '#2563eb';
  if (key === 'cardNumber') return '1234';
  if (key === 'name' || key === 'description' || key === 'text') return 'Mercado de exemplo';
  if (schema.minLength === schema.maxLength && schema.minLength) return 'a'.repeat(schema.minLength);
  if (schema.pattern?.includes('[A-Z]{3}')) return 'BRL';
  if (schema.pattern?.includes('\\d{4}')) return '1234';
  if (schema.pattern?.includes('[1-9]') || schema.pattern?.includes('\\d')) return '100';
  return `${key || 'registro'}-exemplo`;
}

for (const tool of tools) {
  const example = sample(tool.inputSchema);
  if (tool.inputSchema.properties?.idempotency_key) example.idempotency_key = `docs:${tool.name}:01`;
  if (tool.inputSchema.properties?.from) example.from = '2026-10-01';
  if (tool.inputSchema.properties?.to) example.to = '2026-10-31';
  if (tool.name === 'move_connection') example.targetSpaceId = 'familia';
  if (tool.inputSchema.properties?.limit) example.limit = 5;
  if (tool.name === 'get_transactions') example.order = 'date_desc';
  if (tool.name === 'get_subscriptions') example.from = '2025-11-01';
  if (tool.name === 'generate_chart') example.includeSvg = false;
  if (tool.name.startsWith('move_') && tool.inputSchema.properties?.targetSpaceId) example.targetSpaceId = 'familia';
  if (/^(edit_transaction|batch_edit_transactions|edit_transactions_by_period)$/.test(tool.name)) example.category = 'categoria-alimentacao-exemplo';
  const editableExamples = {
    update_account_settings: { name: 'Conta do dia a dia' },
    update_card: { name: 'Cartão da família' },
    update_category: { color: '#2563eb' },
    update_category_group: { name: 'Casa' },
    update_installment: { name: 'Notebook' },
    update_space: { name: 'Família' },
    update_tag: { name: 'Viagem' },
  };
  if (editableExamples[tool.name]) Object.assign(example, editableExamples[tool.name]);
  if (tool.name === 'caderninho_aggregate') Object.assign(example, { metric: 'debits', groupBy: 'category', filter: { currency: 'BRL', from: '2026-10-01', to: '2026-10-31' } });
  if (tool.name === 'create_rule' || tool.name === 'update_rule' || tool.name === 'preview_rule') example.text = 'MERCADO';
  if (tool.name === 'create_manual_loan' || tool.name === 'update_manual_loan') { example.total = 12; example.paid = 0; example.amountMinor = '120000'; example.installmentMinor = '10000'; }
  if (tool.name === 'import_rules' || tool.name === 'preview_rule_import') {
    example.pack.rules[0].categoryKey = example.pack.categories[0].key;
    example.pack.rules[0].text = 'MERCADO';
    example.pack.categories[0].kind = 'expense';
  }
  if (tool.name.includes('transactions') && !tool.annotations.readOnlyHint && tool.inputSchema.properties?.ids) example.ids = ['transacao-exemplo'];
  examples[tool.name] = example;
}

const validateCode = `import {planningDefinitions, ConnectionSelectionSchema, TransactionQuerySchema, AggregateQuerySchema} from "./src/contracts/index.ts";
const chunks=[]; for await (const chunk of process.stdin) chunks.push(chunk);
const examples=JSON.parse(Buffer.concat(chunks).toString());
const schemas=new Map(planningDefinitions.map(tool=>[tool.name,tool.schema]));
schemas.set('caderninho_status',ConnectionSelectionSchema); schemas.set('caderninho_sync',ConnectionSelectionSchema); schemas.set('caderninho_transactions',TransactionQuerySchema); schemas.set('caderninho_aggregate',AggregateQuerySchema);
const issues=[];for(const [name,input] of Object.entries(examples)){const result=schemas.get(name).safeParse(input);if(!result.success)issues.push({name,issues:result.error.issues.map(i=>({path:i.path,message:i.message}))});}process.stdout.write(JSON.stringify(issues));`;
const exampleIssues = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', validateCode], { cwd: source, input: JSON.stringify(examples), encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }));
if (exampleIssues.length) throw new Error(`Exemplos recusados pelos schemas: ${JSON.stringify(exampleIssues, null, 2)}`);

const catalog = {
  categories: categories.map(({ pattern, ...item }) => item),
  tools: tools.map(tool => {
    const category = categoryOf(tool.name);
    return { name: tool.name, description: tool.description, category, categoryTitle: categories.find(item => item.id === category).title, function: functionOf(tool.name), operation: tool.annotations.readOnlyHint ? 'read' : tool.annotations.openWorldHint ? 'sync' : 'write', url: `/docs/assistentes/ferramentas/${category}/${tool.name}` };
  }),
};
await mkdir(path.join(root, 'data'), { recursive: true });
await mkdir(path.join(root, 'public/examples'), { recursive: true });
await writeFile(path.join(root, 'data/catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
await writeFile(path.join(root, 'data/mcp-tools.json'), JSON.stringify(tools, null, 2) + '\n');
await writeFile(path.join(root, 'public/examples/mcp-tools.json'), JSON.stringify(tools, null, 2) + '\n');
await copyFile(path.join(source, 'public/rule-packs/brasil.json'), path.join(root, 'public/examples/brasil.json'));

const fieldDescriptions = {
  spaceId: 'Espaço da instalação. Consulte get_spaces; o espaço inicial é personal.',
  personId: 'Titular declarado. Obtenha seu ID em caderninho_status.',
  accountId: 'ID de conta devolvido por get_accounts.',
  categoryId: 'ID de categoria devolvido por get_categories no mesmo espaço.',
  id: 'ID do registro. Consulte a ferramenta indicada nesta página antes de usar.',
  ids: 'IDs de transações devolvidos por get_transactions. Confira a seleção antes de confirmar a escrita.',
  confirmed: 'Deve ser true somente depois da confirmação explícita do proprietário.',
  idempotency_key: 'Chave única para esta solicitação. Reutilize apenas para repetir exatamente a mesma operação.',
  amountMinor: 'Valor exato em unidades menores, como string. Em BRL, "10000" significa R$ 100,00.',
  currency: 'Moeda da operação. Valores de moedas diferentes permanecem separados.',
  from: 'Primeiro dia incluído na seleção, em AAAA-MM-DD.',
  to: 'Último dia incluído na seleção, em AAAA-MM-DD.',
  cursor: 'Cursor recebido na página anterior. Preserve filtros e revisão.',
  limit: 'Máximo de registros ou candidatos devolvidos. Confira paginação e cobertura na resposta.',
  expected_revision: 'Revisão obtida na leitura ou prévia. Uma revisão obsoleta exige nova leitura.',
  preview_revision: 'Revisão da prévia a ser confirmada.',
  name: 'Nome de exibição do registro.',
  priority: 'Prioridade da regra. Dentro do mesmo grupo, números menores vêm primeiro.',
  active: 'Define se a recorrência participa do planejamento.',
  cardNumber: 'Quatro últimos dígitos do cartão recebidos na identificação da origem.',
  category: 'ID da categoria local; null remove a atribuição quando permitido.',
  categoryIds: 'IDs de categorias devolvidos por get_categories no espaço selecionado.',
  channel: 'Canal da preferência de aviso; não configura um serviço de entrega.',
  closeDay: 'Dia de fechamento do cartão manual, dentro dos limites do contrato.',
  color: 'Cor de apresentação no formato hexadecimal aceito pelo catálogo.',
  comparison: 'Critério do período anterior. explicit usa previousFrom e previousTo.',
  connectionId: 'ID de conexão devolvido por caderninho_status.',
  connectionIds: 'IDs de conexão devolvidos por caderninho_status. Uma conexão pode conter várias contas.',
  contributionId: 'ID devolvido por add_goal_contribution ao registrar o aporte. Preserve esse resultado; o contrato atual não oferece uma consulta que liste IDs de contribuições anteriores.',
  count: 'Quantidade de parcelas do cronograma de empréstimo.',
  creditLimitMinor: 'Limite local do cartão em unidades menores; null restaura o valor importado.',
  current: 'Número da parcela corrente no plano manual.',
  date: 'Dia financeiro do registro, em AAAA-MM-DD.',
  description: 'Descrição local do lançamento, quando a operação permite editá-la.',
  direction: 'Direção DEBIT ou CREDIT. Ela não determina, sozinha, despesa ou receita.',
  dueDay: 'Dia de vencimento do cartão manual.',
  enabled: 'Define se a regra ou preferência está habilitada.',
  endDate: 'Último dia da recorrência; null mantém sem encerramento definido.',
  event: 'Evento da preferência de aviso. Guardar a preferência não agenda uma entrega.',
  filter: 'Filtro composto da ferramenta; veja objetos, alternativas e condições no schema.',
  firstPaymentDate: 'Vencimento da primeira parcela do empréstimo manual.',
  future: 'Inclui o recorte de compras futuras conforme a seleção da consulta.',
  groupBy: 'Agrupamento do agregado ou gráfico, conforme as opções desta ferramenta.',
  groupId: 'ID de agrupador devolvido por get_category_groups no mesmo espaço; null remove o vínculo.',
  hidden: 'Oculta ou restaura a apresentação do registro, preservando seu histórico.',
  icon: 'Identificador de ícone aceito pelo catálogo do produto.',
  ignored: 'Define a exclusão do lançamento das análises que respeitam ignorados.',
  includeSvg: 'Inclui o SVG estático opcional; false retorna os dados para outra visualização.',
  include_completed: 'Inclui registros já concluídos na consulta.',
  include_hidden: 'Inclui registros ocultos na listagem.',
  include_ignored: 'Inclui lançamentos marcados como ignorados na seleção.',
  included: 'Define a participação do investimento nos totais patrimoniais.',
  installmentMinor: 'Valor da parcela manual em unidades menores da moeda.',
  institutionId: 'Identificador da instituição disponível na carteira importada.',
  investmentId: 'ID de investimento devolvido por get_investments.',
  kind: 'Natureza da categoria: receita, despesa ou transferência.',
  metric: 'Medida solicitada. Preserve a definição de count, debits, credits ou cash_flow.',
  minOccurrences: 'Quantidade mínima de ocorrências para considerar um candidato recorrente.',
  month: 'Mês de referência no formato AAAA-MM.',
  monthStartDay: 'Dia que inicia o ciclo financeiro do espaço.',
  monthlyBudgetMinor: 'Total mensal do orçamento do espaço, em unidades menores.',
  monthlyRateBps: 'Taxa de juros mensal em pontos-base. 100 pontos-base correspondem a 1%.',
  months: 'Quantidade de meses do horizonte ou plano, conforme esta ferramenta.',
  openingBalanceMinor: 'Saldo inicial da conta manual, em unidades menores da moeda.',
  order: 'Ordem da lista. date_desc é adequada para consultar movimentos recentes.',
  pack: 'Pacote JSON de regras e categorias. Faça a prévia antes de confirmar a importação.',
  paid: 'Quantidade de parcelas informadas como pagas no cadastro manual da dívida.',
  paymentId: 'ID de parcela do cronograma devolvido por get_loan_schedule.',
  previousFrom: 'Primeiro dia do período anterior explícito, em AAAA-MM-DD.',
  previousTo: 'Último dia do período anterior explícito, em AAAA-MM-DD.',
  principalMinor: 'Principal do cronograma SAC, em unidades menores da moeda.',
  recurrenceId: 'ID de recorrência devolvido por get_recurrences.',
  revision: 'Revisão devolvida pela prévia de importação a ser confirmada.',
  startDate: 'Primeiro dia da recorrência, em AAAA-MM-DD.',
  status: 'Estado do registro ou filtro. Use somente as opções aceitas por esta ferramenta.',
  tagId: 'ID de etiqueta devolvido por get_tags no mesmo espaço.',
  tagIds: 'IDs de etiquetas devolvidos por get_tags no mesmo espaço.',
  targetDate: 'Prazo da meta; null representa ausência de data definida.',
  targetMinor: 'Valor-alvo da meta, em unidades menores da sua moeda.',
  targetSpaceId: 'ID de outro espaço existente na mesma instalação, obtido em get_spaces. Substitua familia pelo ID do destino desejado.',
  text: 'Texto literal de busca ou condição. Confira as regras de comparação da ferramenta.',
  total: 'Quantidade total de parcelas do plano manual.',
  transactionId: 'ID de transação devolvido por get_transactions.',
  type: 'Tipo do registro ou visualização, conforme as opções desta ferramenta.',
  uncategorized: 'Restringe a consulta a movimentos sem categoria efetiva.',
};
function describeField(toolName, key, schema) {
  if (key === 'id' && idSources[toolName]) {
    return `ID do registro devolvido por ${idSources[toolName]}.`;
  }
  if (key === 'ids' && toolName.includes('transaction')) {
    return 'IDs de transações devolvidos por get_transactions. Confira a seleção antes de confirmar a escrita.';
  }
  if (key === 'contributionId' && toolName === 'remove_goal_contribution') {
    return fieldDescriptions.contributionId;
  }
  if (toolName === 'move_connection' && key === 'targetSpaceId') {
    return 'ID de outro espaço existente, obtido em get_spaces. Substitua familia por um ID diferente de spaceId.';
  }
  return schema.description ?? fieldDescriptions[key] ?? 'Consulte o tipo, as opções e os limites no schema completo abaixo.';
}
function typeOf(schema) {
  if (schema.const !== undefined) return JSON.stringify(schema.const);
  if (schema.enum) return schema.enum.map(item => JSON.stringify(item)).join(' / ');
  if (schema.anyOf || schema.oneOf) return (schema.anyOf ?? schema.oneOf).map(typeOf).join(' ou ');
  if (schema.type === 'array') return `lista de ${typeOf(schema.items ?? {})}`;
  return { object: 'objeto', integer: 'inteiro', number: 'número', string: 'texto', boolean: 'booleano', null: 'null' }[schema.type] ?? 'ver schema';
}
function cell(value) { return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }
function frontmatter(title, description) {
  const full = title === 'Todas as ferramentas MCP' || categories.some(category => category.title === title);
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n${full ? 'full: true\n' : ''}---\n\n`;
}

await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'meta.json'), JSON.stringify({ title: 'Ferramentas MCP', defaultOpen: false, pages: ['index', ...categories.filter(item => catalog.tools.some(tool => tool.category === item.id)).map(item => item.id)] }, null, 2));
  await writeFile(path.join(output, 'index.mdx'), frontmatter('Todas as ferramentas MCP', 'Encontre o que seu assistente pode consultar ou alterar, por categoria, função e efeito.') + `${tools.length} ferramentas, com parâmetros e exemplos em cada referência. [Entenda as confirmações](/docs/assistentes/contratos).\n\n<ToolCatalog />\n\n[Baixar o catálogo completo em JSON](/examples/mcp-tools.json)\n`);
for (const group of categories) {
  const members = catalog.tools.filter(tool => tool.category === group.id);
  if (!members.length) continue;
  const dir = path.join(output, group.id);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'meta.json'), JSON.stringify({ title: group.title, defaultOpen: false, pages: ['index', ...members.map(tool => tool.name)] }, null, 2));
  await writeFile(path.join(dir, 'index.mdx'), frontmatter(group.title, group.description) + `Esta categoria reúne ${members.length} ferramentas. Abra uma página para consultar parâmetros, efeito e exemplo.\n\n<ToolCatalog category="${group.id}" />\n`);
  for (const member of members) {
    const tool = tools.find(item => item.name === member.name);
    const required = new Set(tool.inputSchema.required ?? []);
    const rows = Object.entries(tool.inputSchema.properties ?? {}).map(([key, schema]) => {
      let description = describeField(tool.name, key, schema);
      if (Object.hasOwn(schema, 'default')) description += ` Padrão: ${JSON.stringify(schema.default)}.`;
      if (schema.maximum !== undefined) description += ` Máximo: ${schema.maximum}.`;
      if (schema.minimum !== undefined) description += ` Mínimo: ${schema.minimum}.`;
      if (schema.maxItems !== undefined) description += ` Até ${schema.maxItems} itens.`;
      return `| \`${key}\` | ${required.has(key) ? 'Sim' : 'Não'} | ${cell(typeOf(schema))} | ${cell(description)} |`;
    });
    const effect = member.name === 'move_connection'
      ? 'Move para targetSpaceId as contas da conexão que pertencem a spaceId, além dos investimentos e empréstimos vinculados. As edições locais das contas mudam de espaço; categorias, tags e vínculos de metas dessas edições são removidos. Recorrências e parcelas manuais também mudam de espaço, e suas categorias são removidas. Vínculos de metas com contas e investimentos movidos são desfeitos. Esta reorganização não altera dados no banco. Confirme o espaço de origem e o destino antes de enviar confirmed: true e uma chave de idempotência.'
      : member.operation === 'read' ? 'Consulta ou simula sem gravar alterações financeiras nem iniciar uma importação.' : member.operation === 'sync' ? 'Esta ferramenta solicita importação. Um pedido repetido pode reutilizar a execução existente; a admissão respeita a janela de 24 horas de cada conexão. Acompanhe por caderninho_status.' : 'Esta ferramenta altera dados locais da instalação. Confirme a ação e o espaço com o proprietário antes de enviar confirmed: true e uma chave de idempotência. Ela não altera registros nem executa pagamentos no banco.';
    const body = [
      `${group.title} · ${member.function} · ${member.operation === 'read' ? 'Consulta / prévia' : member.operation === 'sync' ? 'Importação' : 'Escrita local'}`,
      '## Efeito da chamada', effect,
      '## Parâmetros', rows.length ? ['| Campo | Obrigatório | Tipo | Uso |', '| --- | --- | --- | --- |', ...rows].join('\n') : 'Não exige argumentos. Envie um objeto JSON vazio.',
      'Filtros compostos e limites estão no schema completo. Campos não listados são recusados.',
      '## Exemplo de chamada', 'Substitua os IDs fictícios pelos da sua instalação, obtidos nas consultas indicadas nos parâmetros.',
      '```json', JSON.stringify({ name: tool.name, arguments: examples[tool.name] }, null, 2), '```',
      '## Interpretar o resultado', member.operation === 'read' ? 'Preserve moeda, valores desconhecidos, cobertura e datas de referência informados na resposta. Uma leitura sem registros não comprova ausência de movimentos no banco. Para totais, use agregações de toda a seleção.' : member.operation === 'write' ? 'Confira o resultado da chamada antes de dar a alteração como concluída. Se a rede falhar, repita somente os mesmos argumentos com a mesma chave. Atualize a leitura se a revisão estiver obsoleta antes de confirmar outra operação.' : 'A aceitação do pedido confirma que ele pode ser processado. Para acompanhar a importação, confira estado, fase, parcialidade e último sucesso de cada conexão.',
      ...(tool.outputSchema ? ['O JSON Schema de saída está em Contrato completo.'] : ['O registro desta ferramenta não declara outputSchema. Consulte as regras de resposta no guia de contratos.']),
      '## Contrato completo', '<details>', '<summary>Ver JSON Schema de entrada</summary>', '', '```json', JSON.stringify(tool.inputSchema, null, 2), '```', '', '</details>',
      ...(tool.outputSchema ? ['<details>', '<summary>Ver JSON Schema de saída</summary>', '', '```json', JSON.stringify(tool.outputSchema, null, 2), '```', '', '</details>'] : []),
      `[Voltar para ${group.title}](/docs/assistentes/ferramentas/${group.id}) · [Confirmações e contratos](/docs/assistentes/contratos)`,
    ].join('\n\n');
    await writeFile(path.join(dir, `${tool.name}.mdx`), frontmatter(tool.name, tool.description) + body + '\n');
  }
}

// Preserve os textos técnicos como referência; os tutoriais novos têm outra finalidade.
const files = (await readdir(sourceDocs)).filter(name => name.endsWith('.md'));
const sourceMap = new Map(files.map(name => [`docs/${name}`, `/docs/referencia/${name.slice(0, -3)}`]));
sourceMap.set('README.md', '/docs/referencia/projeto');
sourceMap.set('CONTRIBUTING.md', '/docs/referencia/contribuir');
const manifest = [];
const usageConditionsSources = new Set(['README.md', 'docs/household.md', 'docs/onboarding.md', 'docs/usage.md', 'docs/adr-modular-monolith.md']);
const usageConditionsNote = '\n\nAntes de reunir dados de outros titulares, confirme com a Pluggy as [condições aplicáveis à sua conta](/docs/bancos/autorizacoes#uso-pessoal-e-limites). Os comportamentos técnicos descritos neste documento não ampliam cotas nem confirmam autorização do provedor para esse uso.';
for (const item of [...files.map(name => ({ file: `docs/${name}`, slug: name.slice(0, -3) })), { file: 'README.md', slug: 'projeto' }, { file: 'CONTRIBUTING.md', slug: 'contribuir' }]) {
  const original = await readFile(path.join(source, item.file), 'utf8');
  const title = original.match(/^# (.+)$/m)?.[1] ?? item.slug;
  let body = original.replace(/^# .+\r?\n/, '');
  body = body.replace(/(!?\[[^\]]*\]\()([^\s)]+)(\))/g, (match, start, href, end) => {
    if (/^(https?:|mailto:|#|data:)/.test(href)) return match;
    if (href.startsWith('/demo')) return `${start}https://usecaderninho.com${href}${end}`;
    if (href.startsWith('/')) return match;
    const [target, anchor] = href.split('#');
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(item.file), target));
    if (sourceMap.has(resolved)) return `${start}${sourceMap.get(resolved)}${anchor ? `#${anchor}` : ''}${end}`;
    if (resolved === 'public/rule-packs/brasil.json') return `${start}/examples/brasil.json${end}`;
    return `${start}https://github.com/DanielSuhett/caderninho/blob/main/${resolved}${anchor ? `#${anchor}` : ''}${end}`;
  });
  await mkdir(path.join(root, 'content/docs/referencia'), { recursive: true });
  await writeFile(path.join(root, `content/docs/referencia/${item.slug}.mdx`), frontmatter(title, `Referência técnica de ${item.file}, preservada a partir do projeto Caderninho.`) + `<Callout title="Documento técnico do projeto">\n\nEste texto foi preservado de \`${item.file}\`. Relatos de testes e validações são os do documento original. Para a jornada guiada, comece em [Instalar o Caderninho](/docs/comecar/instalar).${usageConditionsSources.has(item.file) ? usageConditionsNote : ''}\n\n</Callout>\n\n` + body);
  manifest.push({ file: item.file, url: sourceMap.get(item.file), sha256: createHash('sha256').update(original).digest('hex') });
}
await writeFile(path.join(root, 'content/docs/referencia/meta.json'), JSON.stringify({ title: 'Referência do projeto', defaultOpen: false, pages: ['index', ...files.map(name => name.slice(0, -3)), 'projeto', 'contribuir'] }, null, 2));
await writeFile(path.join(root, 'data/source-manifest.json'), JSON.stringify({ repository: 'DanielSuhett/caderninho', commit, includesWorkingTreeChanges: dirty, toolCount: tools.length, toolSchemaSha256: createHash('sha256').update(JSON.stringify(tools)).digest('hex'), files: manifest }, null, 2) + '\n');
console.log(`Sincronizado: ${tools.length} ferramentas, ${categories.length} categorias, ${manifest.length} referências. ${Object.keys(examples).length} exemplos validados sem executar ferramentas.`);
await syncTheme(source);
