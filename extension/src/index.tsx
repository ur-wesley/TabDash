/* @refresh reload */
import { render } from 'solid-js/web';

import './features/theme/theme-tokens.css';
import './index.css';
import App from './App';
import 'virtual:uno.css';

render(() => <App />, document.querySelector('#root') as HTMLElement);
