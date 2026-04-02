// Minimal markdown-to-HTML formatting to match the existing chatbot.js behavior.
// This is intentionally lightweight (regex-based) to avoid adding dependencies.
export function formatMessage(text) {
  if (text == null) return '';
  let t = String(text);

  t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*(.*?)\*/g, '<em>$1</em>');
  t = t.replace(/`(.*?)`/g, '<code>$1</code>');
  t = t.replace(/\n/g, '<br>');

  // Numbered lists
  t = t.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
  if (t.includes('<li>')) {
    // If we didn't already wrap in <ol>, wrap <li> in <ol> when it comes from numbered lists.
    // The original JS tries to infer this; we keep the same spirit.
    if (!t.includes('<ol>') && !t.includes('<ul>')) {
      t = '<ol>' + t + '</ol>';
    }
  }

  // Bullet lists
  t = t.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  if (t.includes('<li>') && !t.includes('<ol>')) {
    t = '<ul>' + t + '</ul>';
  }

  return t;
}

