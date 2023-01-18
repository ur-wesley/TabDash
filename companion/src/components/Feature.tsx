import { useStore } from "@nanostores/solid";
import { Component, createEffect, onCleanup } from "solid-js";
import { language } from "../helper/store.js";
import type { AvailableLanguages } from "../lang.js";

const Feature: Component<Props> = (props) => {
  const $lang = useStore(language);
  let headline: HTMLHeadingElement;
  let desc: HTMLElement;
  let image: HTMLImageElement;
  createEffect(() => {
    observer.observe(headline);
    observer.observe(desc);
    observer.observe(image);
    headline.style.transform = `translateX(${props.imgSide == "right" ? "-" : ""
      }100px)`;
    desc.style.transform = `translateX(${props.imgSide == "right" ? "-" : ""
      }100px)`;
    image.style.transform = `translateX(${props.imgSide == "right" ? "-" : ""
      }100px)`;
  });
  onCleanup(() => {
    observer.unobserve(headline);
    observer.unobserve(desc);
    observer.unobserve(image);
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        (entry.target as HTMLElement).style.transform = "translateX(0)";
        (entry.target as HTMLElement).style.transition = "transform 1s";
      } else {
        (entry.target as HTMLElement).style.transform = `translateX(${props.imgSide == "right" ? "-" : ""
          }100px)`;
        // (entry.target as HTMLElement).style.transform = `translateX(100px)`;
      }
    });
  });
  return (
    <div class="flex flex-col lg:grid grid-cols-2 grid-rows-1 gap-4 max-w-full lg:max-w-screen-xl">
      <div
        class={`w-full h-full m-0 p-4 row-start-1 flex flex-col justify-center ${props.imgSide == "right" ? "col-start-1" : "col-start-2"
          }`}
      >
        <h2 ref={headline!} class="font-bold text-xl lg:text-3xl py-4">
          {props.feature.title[$lang()]}
        </h2>
        <span ref={desc!}>{props.feature.description[$lang()]}</span>
      </div>
      <div
        class={`w-full row-start-1 p-4 flex flex-col justify-center lg:text-xl ${props.imgSide == "left" ? "col-start-1" : "col-start-2"
          }`}
      >
        <img
          ref={image!}
          class="rounded-xl"
          src={props.feature.img}
          alt={props.feature.title[$lang()]}
        />
      </div>
    </div>
  );
};

export default Feature;

interface Props {
  imgSide: "left" | "right";
  feature: FeatureText;
}

interface FeatureText {
  title: Content;
  description: Content;
  img: string;
}

type Content = {
  [key in AvailableLanguages]: string;
};
