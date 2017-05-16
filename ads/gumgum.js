/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {loadScript, validateData} from '../3p/3p';
import {setStyles} from '../src/style';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function gumgum(global, data, undefined) {
  validateData(data, ['zone']);

  const
      win = window,
      ctx = win.context,
      dom = global.document.getElementById('c'),
      ampWidth = parseInt(data.width || '0', 10),
      ampHeight = parseInt(data.height || '0', 10),
      ggevents = global.ggevents || [];

  let ampLayout = String(data.layout);
  if (ampLayout !== undefined) {
    if (ampWidth || ampHeight) {
      if (ampWidth && ampHeight) {
        ampLayout = 'fixed';
      } else if (ampHeight || (!ampWidth && ampWidth === 'auto')) {
        ampLayout = 'fixed-height';
      } else {
        ampLayout = 'responsive';
      }
    } else {
      ampLayout = 'container';
    }
  }

  // Analyze if we need a manual trigger for visibility
  // global.context.observeIntersection(function(changes) {
  //   changes.forEach(function(c) {
  //     if (c.intersectionRect.height) {
  //       // In-view
  //     }
  //   });
  // });

  const
      max = Math.max,
      slotId = parseInt(data.slot, 10),
      onLoad = function(type) {
        return function(evt) {
          const
              ad = Object.assign({width: 0, height: 0}, evt.ad || {}),
              identifier = ['GUMGUM', type, evt.id].join('_');
          ctx.reportRenderedEntityIdentifier(identifier);
          ctx.renderStart({
            width: max(ampWidth, ad.width),
            height: max(ampHeight, ad.height),
          });
        };
      },
      noFill = function() {
        ctx.noContentAvailable();
      };

  // Ads logic starts
  global.ggv2id = data.zone;
  global.ggevents = ggevents;
  global.sourceUrl = context.sourceUrl;
  global.sourceReferrer = context.referrer;

  if (data.imgsrc) {
    // In-Image Ad
    const img = document.createElement('img');
    img.setAttribute('src', data.imgsrc);
    switch (ampLayout) {
      case 'fixed':
        img.setAttribute('width', '100%');
        img.setAttribute('height', '100%');
        break;
      case 'fixed-height':
        img.setAttribute('height', '100%');
        img.setAttribute('width', 'auto');
        break;
      case 'responsive':
      default:
        img.setAttribute('width', '100%');
        break;
    }
    dom.appendChild(img);
    // Events
    ggevents.push({
      'inimage.nofill': noFill,
      'inimage.load': onLoad('INIMAGE'),
    });
    // Main script
    loadScript(global, 'https://g2.gumgum.com/javascripts/ggv2.js');
  } else if (slotId) {
    // Slot Ad
    const ins = global.document.createElement('div');
    setStyles(ins, {
      display: 'block',
      width: '100%',
      height: '100%',
    });
    ins.setAttribute('data-gg-slot', slotId);
    dom.appendChild(ins);
    // Events
    ggevents.push({
      'slot.nofill': noFill,
      'slot.close': noFill,
      'slot.load': onLoad('SLOT'),
    });
    // Main script
    loadScript(global, 'https://g2.gumgum.com/javascripts/ad.js');
  } else {
    // No valid configuration
    ctx.noContentAvailable();
  }
}
