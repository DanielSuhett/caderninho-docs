import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, repositoryUrl } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <span className="brand-name">{appName}<span className="brand-suffix"> / guias</span></span>,
      url: '/docs',
    },
    githubUrl: repositoryUrl,
    links: [
      { text: 'Site', url: 'https://usecaderninho.com', external: true },
      { text: 'Experimentar a demo', url: 'https://usecaderninho.com/demo/', external: true },
    ],
  };
}
