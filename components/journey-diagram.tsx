import { ArrowDown, ArrowRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

const journeys = {
  instalar: {
    title: 'Da instalação ao primeiro acesso',
    steps: [
      { where: 'Cloudflare', title: 'Escolher a conta GitHub', detail: 'Sua cópia do repositório ficará na conta que você selecionar.' },
      { where: 'Cloudflare', title: 'Criar a instalação', detail: 'Confira os recursos e aguarde o deploy.' },
      { where: 'Caderninho', title: 'Guardar a chave', detail: 'Abra o link privado e escolha Começar.' },
    ],
  },
  pluggy: {
    title: 'Onde acontece cada parte',
    steps: [
      { where: 'Meu Pluggy', title: 'Autorizar seus bancos', detail: 'Entre com sua conta e confira os bancos conectados.' },
      { where: 'Dashboard Pluggy', title: 'Obter as credenciais', detail: 'Use a mesma conta e a aplicação que vai configurar.' },
      { where: 'Caderninho', title: 'Conectar a origem', detail: 'Informe as credenciais e escolha MeuPluggy na autorização.' },
    ],
  },
  importar: {
    title: 'Do cadastro à consulta',
    steps: [
      { where: 'Pessoas', title: 'Concluir e importar', detail: 'O pedido inicia a primeira coleta de cada banco.' },
      { where: 'Importar', title: 'Acompanhar a coleta', detail: 'Cada banco tem sua fila, fase e resultado.' },
      { where: 'Consultar', title: 'Conectar um assistente', detail: 'Quando as coletas iniciadas terminarem, use o endereço MCP e autorize o acesso separadamente.' },
    ],
    note: 'Durante a coleta, você pode consultar os dados parciais quando já houver transações salvas. Essa consulta é opcional e não interrompe a importação.',
  },
} satisfies Record<string, { title: string; steps: { where: string; title: string; detail: string }[]; note?: string }>;

export function JourneyDiagram({ kind }: { kind: keyof typeof journeys }) {
  const journey = journeys[kind];
  const style: CSSProperties & { '--journey-columns': number } = { '--journey-columns': journey.steps.length };
  return <figure className="journey-diagram not-prose" aria-label={journey.title}>
    <figcaption>{journey.title}</figcaption>
    <ol style={style}>
      {journey.steps.map((step, index) => <li key={step.title}>
        <span className="journey-number" aria-hidden="true">{index + 1}</span>
        <div className="journey-node">
          <span className="journey-where">{step.where}</span>
          <span className="journey-title">{step.title}</span>
          <p>{step.detail}</p>
        </div>
        {index < journey.steps.length - 1 && <><ArrowRight className="journey-next" aria-hidden="true" size={18} /><ArrowDown className="journey-down" aria-hidden="true" size={18} /></>}
      </li>)}
    </ol>
    {'note' in journey && <p className="journey-note">{journey.note}</p>}
  </figure>;
}

function Branches({ split = false }: { split?: boolean }) {
  return <svg className="access-branches" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
    <path d={split ? 'M50 0V12M25 24V12H75V24' : 'M25 0V12H75V0M50 12V24'} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
  </svg>;
}

export function FamilyAccessDiagram({ children }: { children: ReactNode }) {
  return <figure className="access-map not-prose" aria-label="Bancos por titular, acesso compartilhado à instalação">
    <div className="access-map-pair">
      <div className="access-map-node"><span>Ana</span><p>Autoriza seus bancos</p></div>
      <div className="access-map-node"><span>Bruno</span><p>Autoriza seus bancos</p></div>
    </div>
    <Branches />
    <div className="access-map-node access-map-center"><span>Uma instalação do Caderninho</span><p>Histórico organizado por titular</p></div>
    <Branches split />
    <div className="access-map-pair">
      <div className="access-map-node"><span>Administrador</span><p>Consulta pelo painel</p></div>
      <div className="access-map-node"><span>Assistentes autorizados</span><p>Consultam pelas ferramentas</p></div>
    </div>
    <figcaption><span>Quem consegue consultar</span><div>{children}</div></figcaption>
  </figure>;
}
