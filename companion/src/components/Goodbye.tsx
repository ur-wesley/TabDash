import { useStore } from "@nanostores/solid";
import { Component, createEffect } from "solid-js";
import { language } from "../helper/store.js";
import useQuery from "../helper/useQuery.js";
import { messages } from "../lang.js";

const Goodbye: Component = () => {
    const $lang = useStore(language);
    const { id, browser } = useQuery(window.location.href);
    createEffect(() => {
        console.log({ x: import.meta.env.PUBLIC_BACKEND_BASE })
        fetch(`${import.meta.env.PUBLIC_BACKEND_BASE}/deinstall?id=${id}&browser=${browser}`);
    });
    return <div class='grid place-content-center h-screen w-full'>
        <span class='max-w-120 text-xl bg-light/50 rounded-xl p-4'>
            {messages.goodbye[$lang()]}
        </span>
    </div>
};

export default Goodbye;