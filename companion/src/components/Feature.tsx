import { useStore } from '@nanostores/solid';
import { onCleanup, onMount } from 'solid-js';
import type { Component } from 'solid-js';
import { language } from '../helper/store.js';
import type { AvailableLanguages } from '../lang.js';

type Content = Record<AvailableLanguages, string>;

interface FeatureText {
  description: Content;
  img: string;
  title: Content;
}

interface Props {
  feature: FeatureText;
  imgSide: 'left' | 'right';
}

const INTERSECTION_VISIBLE = 0,
  SLIDE_OFFSET_PX = 100,
  TRANSITION_DURATION = '1s',
  Feature: Component<Props> = (props) => {
    const $lang = useStore(language);
    let desc: HTMLElement | undefined;
    let headline: HTMLHeadingElement | undefined;
    let image: HTMLImageElement | undefined;

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target;
        if (!(element instanceof HTMLElement)) {
          continue;
        }
        if (entry.intersectionRatio > INTERSECTION_VISIBLE) {
          element.style.transform = 'translateX(0)';
          element.style.transition = `transform ${TRANSITION_DURATION}`;
        } else {
          let direction = '';
          if (props.imgSide !== 'right') {
            direction = '-';
          }
          element.style.transform = `translateX(${direction}${String(SLIDE_OFFSET_PX)}px)`;
        }
      }
    });

    onMount(() => {
      let direction = '';
      if (props.imgSide !== 'right') {
        direction = '-';
      }
      const offset = `${direction}${String(SLIDE_OFFSET_PX)}px`;
      if (headline !== undefined) {
        headline.style.transform = `translateX(${offset})`;
        observer.observe(headline);
      }
      if (desc !== undefined) {
        desc.style.transform = `translateX(${offset})`;
        observer.observe(desc);
      }
      if (image !== undefined) {
        image.style.transform = `translateX(${offset})`;
        observer.observe(image);
      }
    });

    onCleanup(() => {
      if (headline !== undefined) {
        observer.unobserve(headline);
      }
      if (desc !== undefined) {
        observer.unobserve(desc);
      }
      if (image !== undefined) {
        observer.unobserve(image);
      }
    });
    let imageColumnClass = 'col-start-2';
    if (props.imgSide === 'left') {
      imageColumnClass = 'col-start-1';
    }
    let textColumnClass = 'col-start-2';
    if (props.imgSide === 'right') {
      textColumnClass = 'col-start-1';
    }
    return (
      <div class="flex flex-col lg:grid grid-cols-2 grid-rows-1 gap-4 max-w-full lg:max-w-screen-xl">
        <div
          class={`w-full h-full m-0 p-4 row-start-1 flex flex-col justify-center ${textColumnClass}`}
        >
          <h2
            ref={(element) => {
              headline = element;
            }}
            class="font-bold text-xl lg:text-3xl py-4"
          >
            {props.feature.title[$lang()]}
          </h2>
          <span
            ref={(element) => {
              desc = element;
            }}
          >
            {props.feature.description[$lang()]}
          </span>
        </div>
        <div
          class={`w-full row-start-1 p-4 flex flex-col justify-center lg:text-xl ${imageColumnClass}`}
        >
          <img
            ref={(element) => {
              image = element;
            }}
            class="rounded-xl"
            src={props.feature.img}
            alt={props.feature.title[$lang()]}
          />
        </div>
      </div>
    );
  };

export default Feature;
