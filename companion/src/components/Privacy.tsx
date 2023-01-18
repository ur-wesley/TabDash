import { useStore } from '@nanostores/solid';
import { Component, Show } from 'solid-js';
import { language } from '../helper/store.js';

import './styles/privacy.scss';

const Privacy: Component<{}> = (props) => {
  const $lang = useStore(language);
  return (
    <section class='privacy'>
      <div>
        <Show when={$lang() == 'en'}>
          <h1>TabDash Privacy Policy</h1>
          <p>
            TabDash is a browser extension that replaces the default new tab
            page with a custom version. The extension does not collect any data
            or use any cookies. Therefore, there is no personal information to
            be shared or stored. The extension is intended for use as a simple
            new tab page replacement and does not have any additional
            functionality that would require data collection.
          </p>
          <p>
            Contact Information If you have any concerns or questions about this
            privacy policy, please contact the developer directly:
          </p>
          <ul>
            <li>wes.urb[at]gmail.com</li>
            <li>
              GitHub: <a href='https://github.com/ur-wesley'>ur-wesley</a>
            </li>
          </ul>
          <p>Last updated: January 18, 2023.</p>
        </Show>
        <Show when={$lang() == 'de'}>
          <h1>TabDash Datenschutzbestimmungen</h1>
          <p>
            TabDash ist eine Browsererweiterung, die die standardmäßige Seite
            für neue Registerkarten durch eine eine benutzerdefinierte Version
            ersetzt. Die Erweiterung sammelt keine Daten und verwendet keine
            Cookies. Es werden also keine persönlichen Informationen
            weitergegeben oder gespeichert. Die Erweiterung ist für die
            Verwendung als einfacher Ersatz für eine neue Registerkarte und
            verfügt über keine zusätzlichen Funktionen, die eine Datenerfassung
            erfordern würde.
          </p>
          <p>
            Wenn Sie irgendwelche Bedenken oder Fragen zu dieser
            Datenschutzrichtlinie haben, wenden Sie sich bitte direkt an den
            Entwickler:
          </p>
          <ul>
            <li>E-Mail: wes.urb[at]gmail.com</li>
            <li>
              GitHub: <a href='https://github.com/ur-wesley'>ur-wesley</a>
            </li>
          </ul>
          <p>Letzte Aktualisierung: Januar 18, 2023.</p>
        </Show>
      </div>
    </section>
  );
};

export default Privacy;
