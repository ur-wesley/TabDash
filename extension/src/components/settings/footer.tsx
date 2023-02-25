import { Component } from "solid-js";
import { version } from '../../../package.json'
import { locale } from "../../App.jsx";
import { helpLinks } from "../../lang.js";

const Footer: Component = () => {
    return <div class="mt-4 p-2">
        <ul class="m-0 p-0 list-none color-fade">
            <li>
                heavily inspired by <a href="https://bonjourr.fr">bonjourr</a>
            </li>
            <li>
                TabDash {version}
            </li>
            <li>
                <a href={`${helpLinks.base}${locale()}`}>documentation</a>
            </li>
            <li>
                <a href="https://github.com/ur-wesley/tabdash">repository</a>
            </li>
        </ul>
    </div>;
};

export default Footer;
