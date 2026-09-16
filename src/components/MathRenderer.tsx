import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', block = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Split by block math $$...$$ first, then inline math $...$
    // We will parse both and render through KaTeX
    try {
      const parts: string[] = [];
      let lastIndex = 0;
      // Match $$...$$ or $...$
      const regex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(content)) !== null) {
        // Plain text before match
        if (match.index > lastIndex) {
          parts.push(escapeHtml(content.substring(lastIndex, match.index)));
        }

        const isBlock = Boolean(match[1]);
        const mathExpr = isBlock ? match[1] : match[2];

        try {
          const renderedKaTeX = katex.renderToString(mathExpr.trim(), {
            displayMode: isBlock || block,
            throwOnError: false,
            strict: false,
          });
          parts.push(renderedKaTeX);
        } catch {
          // Fallback to raw text
          parts.push(`<code>${escapeHtml(mathExpr)}</code>`);
        }

        lastIndex = regex.lastIndex;
      }

      // Remaining plain text
      if (lastIndex < content.length) {
        parts.push(escapeHtml(content.substring(lastIndex)));
      }

      return parts.join('').replace(/\n/g, '<br />');
    } catch {
      return escapeHtml(content);
    }
  }, [content, block]);

  return (
    <span
      className={`inline-block align-baseline leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
