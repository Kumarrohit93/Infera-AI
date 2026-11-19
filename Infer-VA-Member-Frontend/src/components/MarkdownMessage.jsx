import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components = {
  p: ({ children }) => (
    <p className="mb-3 whitespace-pre-wrap break-words leading-7 last:mb-0">
      {children}
    </p>
  ),
  h1: ({ children }) => (
    <h1 className="mb-3 mt-5 text-lg font-bold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-base font-bold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-sm font-bold first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-6 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-6 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-[#D7A781] pl-4 text-gray-600">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-[#722F37] underline underline-offset-2"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-[#F8F4E7] px-1.5 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 max-w-full overflow-x-auto rounded-xl bg-[#F8F4E7] p-4 text-xs leading-6">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="min-w-full border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-[#D7A781]/40 bg-[#F8F4E7] px-3 py-2 font-bold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-[#D7A781]/40 px-3 py-2">{children}</td>
  ),
  hr: () => <hr className="my-4 border-[#D7A781]/40" />,
};

function normalizeMarkdown(content) {
  return String(content || "")
    .replace(/(^|\n|[ \t]+)\*(?!\*)[ \t]+/g, "\n- ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function MarkdownMessage({ content }) {
  return (
    <div className="min-w-0 break-words text-sm leading-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {normalizeMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
}
