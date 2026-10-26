import Link from 'next/link';
import { ArrowRight, BookOpen, Landmark, UsersRound, Wrench } from 'lucide-react';

const paths = [
  { icon: BookOpen, title: 'Quero instalar', description: 'Crie sua instalação privada e faça a primeira importação.', href: '/docs/comecar/instalar', label: 'Começar do zero' },
  { icon: Landmark, title: 'Quero manter os bancos conectados', description: 'Autorizações, atualizações e o que fazer quando um banco pede atenção.', href: '/docs/bancos/manter-conectado', label: 'Cuidar das conexões' },
  { icon: Wrench, title: 'Quero consultar com IA', description: 'Conecte ChatGPT ou Claude à sua instalação e autorize o acesso.', href: '/docs/assistentes/conectar', label: 'Conectar um assistente' },
];

export function StartGuide() {
  return <div className="start-guide not-prose">
    <div className="guide-paths">{paths.map(({ icon: Icon, ...path }) => <Link className="guide-path" href={path.href} key={path.href}>
      <Icon aria-hidden="true" size={22} strokeWidth={1.6} />
      <h2>{path.title}</h2><p>{path.description}</p><span>{path.label}<ArrowRight aria-hidden="true" size={16} /></span>
    </Link>)}</div>
    <div className="family-note"><UsersRound aria-hidden="true" size={22} /><div><h2>Pessoas e bancos</h2><p>Uma pessoa administra a instalação. Antes de reunir bancos de outros titulares, confirme as condições desse uso com a Pluggy. O painel e os assistentes autorizados acessam os dados de todos; o filtro por pessoa organiza a consulta, mas não restringe o acesso.</p><Link href="/docs/bancos/familia">Entender pessoas e bancos <ArrowRight aria-hidden="true" size={14} /></Link></div></div>
    <div className="quick-links"><Link href="/docs/usar/visao-geral">O que consultar hoje <ArrowRight aria-hidden="true" size={14} /></Link><Link href="/docs/assistentes/ferramentas">Explorar as ferramentas do assistente <ArrowRight aria-hidden="true" size={14} /></Link><Link href="/docs/extensoes">Explorar possibilidades da Pluggy <ArrowRight aria-hidden="true" size={14} /></Link><Link href="/docs/manutencao/resolver-problemas">Resolver um problema <ArrowRight aria-hidden="true" size={14} /></Link></div>
  </div>;
}
