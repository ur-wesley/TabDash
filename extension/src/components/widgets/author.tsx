import { Component } from 'solid-js';
import { BackgroundData } from '../../../types/settings.js';
import { AvailableLanguages, messages } from '../../lang.js';

const Author: Component<Prop> = (props) => {
  return (
    <span class='absolute bottom-0 left-0 p-2 widget rounded-none rounded-tr-lg z-20'>
      <a
        class='decoration-none color-fade'
        href={
          props.information?.origin + '?utm_source=TabDash&utm_medium=referral'
        }
      >
        {messages['photo by'][props.locale]}&nbsp;
      </a>
      <a
        class='color-fade'
        href={
          props.information?.profile + '?utm_source=TabDash&utm_medium=referral'
        }
      >
        {props.information?.author}
      </a>
      <span class='color-fade'>&nbsp;on&nbsp;</span>
      <a class='color-fade' href='https://unsplash.com'>
        Unsplash
      </a>
    </span>
  );
};

export default Author;

interface Prop {
  information?: BackgroundData;
  locale: AvailableLanguages;
}
