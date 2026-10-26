import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { ZoomIn } from 'lucide-react';
import captures from '@/data/guide-images.json';
import Image from 'next/image';

export function GuideScreenshot({ id }: { id: keyof typeof captures }) {
  const capture = captures[id];
  const caption = <><p>{capture.caption}</p><p>{capture.sourceHref.startsWith('https://') ? <a href={capture.sourceHref}>{capture.source}</a> : capture.source}</p></>;
  return <figure className="guide-screenshot not-prose">
    <div className="guide-screenshot-frame">
      <ImageZoom src={capture.src} alt={capture.alt} caption={caption}>
        <Image src={capture.src} alt={capture.alt} width={capture.width} height={capture.height} unoptimized loading="lazy" />
      </ImageZoom>
      <span className="guide-screenshot-zoom" aria-hidden="true"><ZoomIn size={16} />Ampliar</span>
    </div>
    <figcaption>{caption}</figcaption>
  </figure>;
}
