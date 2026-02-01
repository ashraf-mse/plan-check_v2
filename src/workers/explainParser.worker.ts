import { parseExplainText } from '../../pev2/parser';

addEventListener('message', (event) => {
    try {
        const result = parseExplainText(event.data);
        postMessage({ type: 'result', payload: result });
    } catch (error: any) {
        postMessage({ type: 'error', payload: error.message });
    }
});
