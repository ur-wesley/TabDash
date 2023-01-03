---
layout: ../../../layouts/Help.astro
title: Background
---

# background

Set your personal background.

### Background active

If the switch is active, a new image from the Unsplash collection will be loaded every 15 minutes.

### Collections

Unsplash collections. Here only the IDs are needed. This is located in the link of a collection.
You can specify multiple collections. These must be specified in the field comma separated.

>for example at `https://unsplash.com/collections/1319040/nature` the ID would be `1319040`.

### static image

Works only if `background active` is switched off. Then you can add a static image via link.

### color

Works only if `background active` is turned off and `static image` is empty. Then a color can be specified in text form or in hex form.

### Reload image

Immediately loads a new image from the collection.

# Background filter

If the switch is enabled, a filter will be applied over the background.

### blur

Blurs the image from 'not blurred' to 'absolutely blurred'.
Default: leftmost - not blurred.

### Brightness

sets the background brightness. From `all black` to `all white`.
Default: in the middle - normal brightness. 

### Saturation

sets the background saturation. From `black white` to `bright colors`.
Default: in the middle - normal saturation.