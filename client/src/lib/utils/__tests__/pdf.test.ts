import { describe, expect, it } from 'vitest';

import { getPdfCompatibleImageSource } from '../pdf';

describe('getPdfCompatibleImageSource', () => {
  it('requests a PNG rendition for Cloudinary WebP images', () => {
    expect(
      getPdfCompatibleImageSource(
        'https://res.cloudinary.com/demo/image/upload/v123/business-logos/logo.webp'
      )
    ).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_png/v123/business-logos/logo.png'
    );
  });

  it('leaves non-Cloudinary sources unchanged', () => {
    expect(getPdfCompatibleImageSource('/local/logo.png')).toBe(
      '/local/logo.png'
    );
  });
});
