/**
 * The company literature offered from the footer (supplied by AKTCL, 2026-09-23).
 *
 * The files are served untouched from public/downloads — the owner asked for them to
 * arrive under their own names, so `file` is both the served name and the name the
 * browser saves. Do not rename, re-compress or re-export them: they are AKTCL's own
 * documents, and the sizes below are the real ones (checked in, so the page can say
 * what a visitor is about to pull down).
 *
 * COMPLIANCE — these decks show branded consumer packs carrying Bangladesh's pictorial
 * health warnings, which is further than the site itself goes (unbranded pack imagery,
 * trade audience only). Published at the owner's instruction; see the gap list in
 * docs/content-inventory.md, which flags them for AKTCL legal sign-off along with the
 * brand marks on the AKT Signature Collection page.
 */

export interface DownloadFile {
  /** The file's own name, exactly as supplied. Also what the browser saves it as. */
  file: string;
  /** What it is, for the accessible name of the link. */
  label: string;
  /** Bytes on disk. Rendered through `mb()`. */
  bytes: number;
}

export const downloads: DownloadFile[] = [
  { file: 'AKT_Overview.pdf', label: 'Company overview', bytes: 3151410 },
  { file: 'AKT_Cigarettes.pdf', label: 'Cigarette manufacturing', bytes: 11499232 },
  { file: 'AKT_Leaf Operations.pdf', label: 'Leaf operations', bytes: 14028342 },
];

/** The folder they are served from. The name may contain spaces, so href is encoded. */
export const downloadHref = (file: string) => encodeURI(`/downloads/${file}`);

/** "3 MB" — one figure, no decimals below 10 MB either: this is a size hint, not a spec. */
export const mb = (bytes: number) => `${Math.round(bytes / 1048576)} MB`;

export const totalBytes = downloads.reduce((sum, d) => sum + d.bytes, 0);
