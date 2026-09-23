import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloads, downloadHref, mb, totalBytes } from '@/content/downloads';

/**
 * One button, three files: the company literature AKTCL supplies to the trade
 * (src/content/downloads.ts). Pressing it starts all three downloads under their own
 * names — `download` carries the name, so a browser cannot rename them from the URL.
 *
 * The clicks are spaced: a browser that is asked for several files at once treats the
 * burst as a pop-up and may drop all but the first. Some browsers still ask the visitor
 * to allow multiple downloads — that prompt is the browser's, and answering it is the
 * visitor's decision, so it is not worked around.
 *
 * A plain <button>, not links: three files cannot be one href. The list under it names
 * what is coming and how heavy it is, which is also how a keyboard or screen-reader
 * visitor learns what the one button will fetch.
 */
const DownloadResources = ({ className }: { className?: string }) => {
  const start = () => {
    downloads.forEach((item, i) => {
      window.setTimeout(() => {
        const a = document.createElement('a');
        a.href = downloadHref(item.file);
        a.download = item.file;
        a.rel = 'noopener';
        // Firefox needs the anchor in the document before the click counts.
        document.body.append(a);
        a.click();
        a.remove();
      }, i * 400);
    });
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={start}
        data-lead="footer-downloads"
        aria-describedby="footer-downloads-note"
        className={cn('btn btn-outline-ink', 'hover:border-ink-foreground hover:bg-ink-foreground hover:text-ink')}
      >
        <Download aria-hidden="true" />
        Download Resources
      </button>
      <p id="footer-downloads-note" className="mt-3 font-mono text-[0.8125rem] leading-relaxed text-ink-muted">
        {downloads.length} PDFs · {mb(totalBytes)}
        <span className="sr-only">
          : {downloads.map((d) => `${d.label} (${d.file}, ${mb(d.bytes)})`).join(', ')}
        </span>
      </p>
    </div>
  );
};

export default DownloadResources;
