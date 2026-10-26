import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ToolCatalog } from './tool-catalog';
import { StartGuide } from './start-guide';
import { FamilyAccessDiagram, JourneyDiagram } from './journey-diagram';
import { GuideScreenshot } from './guide-screenshot';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: ({ src, alt, width, height, title, className }) => <img src={src} alt={alt ?? ''} width={width} height={height} title={title} className={className} loading="lazy" decoding="async" />,
    ToolCatalog,
    StartGuide,
    JourneyDiagram,
    FamilyAccessDiagram,
    GuideScreenshot,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
