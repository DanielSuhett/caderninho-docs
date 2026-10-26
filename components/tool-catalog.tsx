'use client';

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import catalog from '@/data/catalog.json';

function searchable(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function ToolCatalog({ category }: { category?: string }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [selectedCategory, setCategory] = useState(category ?? 'all');
  const [selectedFunction, setFunction] = useState('all');
  const [operation, setOperation] = useState('all');
  const filtered = useMemo(() => {
    const words = searchable(query).split(/\s+/).filter(Boolean);
    return catalog.tools.filter(tool =>
      (selectedCategory === 'all' || tool.category === selectedCategory) &&
      (selectedFunction === 'all' || tool.function === selectedFunction) &&
      (operation === 'all' || tool.operation === operation) &&
      words.every(word => searchable(`${tool.name} ${tool.description} ${tool.categoryTitle} ${tool.function}`).includes(word)),
    );
  }, [query, selectedCategory, selectedFunction, operation]);
  const functions = [...new Set(catalog.tools.map(tool => tool.function))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const active = !!query || selectedFunction !== 'all' || operation !== 'all' || selectedCategory !== (category ?? 'all');
  function clear() { setQuery(''); setCategory(category ?? 'all'); setFunction('all'); setOperation('all'); }

  return <div className="tool-catalog not-prose">
    <div className="catalog-controls">
      <label className="catalog-search" htmlFor={`${id}-search`}><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar ferramenta ou utilidade</span><input id={`${id}-search`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Busque por ferramenta ou pelo que você quer fazer" /></label>
      <div className="catalog-filters">
        {!category && <label htmlFor={`${id}-category`}>Categoria<select id={`${id}-category`} value={selectedCategory} onChange={event => setCategory(event.target.value)}><option value="all">Todas as categorias</option>{catalog.categories.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
        <label htmlFor={`${id}-function`}>Função<select id={`${id}-function`} value={selectedFunction} onChange={event => setFunction(event.target.value)}><option value="all">Todas as funções</option>{functions.map(item => <option key={item} value={item}>{item}</option>)}</select></label>
        <label htmlFor={`${id}-operation`}>Efeito<select id={`${id}-operation`} value={operation} onChange={event => setOperation(event.target.value)}><option value="all">Todos os efeitos</option><option value="read">Consulta ou prévia</option><option value="write">Altera dados locais</option><option value="sync">Pede importação</option></select></label>
      </div>
    </div>
    <div className="catalog-result"><p role="status" aria-live="polite"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'ferramenta' : 'ferramentas'}{active ? ' neste recorte' : ' disponíveis'}</p>{active && <button type="button" onClick={clear}><X size={14} aria-hidden="true" />Limpar filtros</button>}</div>
    {filtered.length === 0 && <div className="catalog-empty"><h2>Nenhuma ferramenta encontrada</h2><p>Tente buscar “fatura”, “regra” ou “transações”, ou limpe os filtros.</p><button type="button" onClick={clear}>Limpar filtros</button></div>}
    {catalog.categories.map(group => {
      const tools = filtered.filter(tool => tool.category === group.id);
      if (!tools.length) return null;
      return <section className="tool-group" key={group.id} aria-labelledby={`${id}-${group.id}`}>
        <div className="tool-group-heading"><h2 id={`${id}-${group.id}`}>{group.title}</h2><span>{tools.length}</span></div>
        <p className="tool-group-description">{group.description}</p>
        <div className="tool-list">{tools.map(tool => <Link href={tool.url} className="tool-card" key={tool.name}>
          <div className="tool-card-top"><code>{tool.name}</code><ArrowRight size={16} aria-hidden="true" /></div>
          <p>{tool.description}</p><div className="tool-card-bottom"><span className={`tool-effect effect-${tool.operation}`}>{tool.operation === 'read' ? 'Consulta / prévia' : tool.operation === 'sync' ? 'Importação' : 'Escrita local'}</span><span>{tool.function}</span></div>
        </Link>)}</div>
      </section>;
    })}
  </div>;
}
