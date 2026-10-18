import { NgOptimizedImage } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/** One product, the same for every visitor. */
const PRODUCT = {
  name: 'Trail running shoe',
  description: 'A light trail running shoe with a grippy sole.',
};

/** Served twice: `/m32/why/client` (RenderMode.Client) and `/m32/why/server` (RenderMode.Server). */
@Component({
  selector: 'lab-m32-why-product',
  imports: [NgOptimizedImage],
  template: `
    <h2>{{ product.name }}</h2>
    <img ngSrc="favicon.ico" width="48" height="48" priority alt="Product photo" />
    <p>{{ product.description }}</p>
  `,
})
export class LabM32WhyProduct {
  protected readonly product = PRODUCT;

  constructor() {
    inject(Title).setTitle(`${PRODUCT.name} | Lab shop`);
    inject(Meta).updateTag({ name: 'description', content: PRODUCT.description });
  }
}
