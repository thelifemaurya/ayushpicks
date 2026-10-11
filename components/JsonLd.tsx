export function JsonLd({ data }: { data: object }) {
  // "<" is escaped so admin-entered text can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
