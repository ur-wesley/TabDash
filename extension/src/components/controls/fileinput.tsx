import { Component, createSignal } from "solid-js";

const FileInput: Component<Props> = (props) => {
  const [dragOver, setDragOver] = createSignal(false);
  const readFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const data = reader.result;
      props.oninput(data as string);
    };
    setDragOver(false);
  };
  return (
    <div
      class={`grid place-content-center hover:border-blue-500 cursor-pointer surface-base my-4 h-24 p-2 rounded-xl transition border-2 border-dashed ${
        dragOver() ? "border-blue-500" : "border-transparent"
      }`}
      onDragLeave={() => setDragOver(false)}
      onDragEnter={() => setDragOver(true)}
      onDragOver={(e) => {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer!.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.stopPropagation();
        e.preventDefault();
        const file = e.dataTransfer?.files[0];
        if (!file) return;
        readFile(file);
      }}
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.click();
        input.onchange = (e: Event) => {
          const target = e.target as HTMLInputElement;
          const file: FileList | null = target.files;
          if (!file) return;
          readFile(file[0]);
        };
        input.remove();
      }}
    >
      {props.label}
    </div>
  );
};

export default FileInput;

interface Props {
  label: string;
  oninput: (value: string) => void;
}
