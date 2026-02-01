import { parseExplainText } from './parser/index';

self.onmessage = (e) => {
  const { text } = e.data;
  const result = parseExplainText(text);
  self.postMessage(result);
};
