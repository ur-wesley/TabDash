import { Component, createSignal, For, Show } from "solid-js";

const Tabs: Component<Props> = (props) => {
  const [activeTab, setActiveTab] = createSignal(props.activeTab || 0);
  return (
    <div class="flex flex-col gap-2">
      <div class="surface-base p-2 flex text-center rounded-xl">
        <For each={props.tabs}>
          {(tab, index) => (
            <span
              class={`p-1 rounded-md grow w-full cursor-pointer ${activeTab() == index()
                ? "text-white bg-blue-500"
                : "text-blue-500 bg-transparent"
                }`}
              onclick={() => {
                setActiveTab(index());
                props.onchange?.(index());
              }}
            >
              {tab}
            </span>
          )}
        </For>
      </div>
      {props.children[activeTab()] || props.children}
    </div>
  );
};

export default Tabs;

interface Props {
  activeTab?: number;
  tabs: string[];
  children: any[] | any;
  onchange?: (tab: number) => void;
}
