import { Platform } from 'react-native';

import { scanlines, textureStyle } from '@/lib/textures';

const originalOS = Platform.OS;

afterEach(() => {
  Platform.OS = originalOS;
});

test('phones draw a texture with React Native background images', () => {
  Platform.OS = 'ios';

  expect(textureStyle({ image: 'linear-gradient(red, blue)' })).toEqual({
    experimental_backgroundImage: 'linear-gradient(red, blue)',
  });
});

test('phones repeat a texture tile when it has a size', () => {
  Platform.OS = 'android';

  expect(textureStyle({ image: 'linear-gradient(red, blue)', size: '100% 3px' })).toEqual({
    experimental_backgroundImage: 'linear-gradient(red, blue)',
    experimental_backgroundSize: '100% 3px',
    experimental_backgroundRepeat: 'repeat',
  });
});

test('the web draws the same texture with CSS background images', () => {
  Platform.OS = 'web';

  expect(textureStyle({ image: 'linear-gradient(red, blue)', size: '100% 3px' })).toEqual({
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(red, blue)',
    backgroundSize: '100% 3px',
    backgroundRepeat: 'repeat',
  });
});

test('scanlines are a dark line at the top of every 3px tile', () => {
  expect(scanlines('#00000059')).toEqual({
    image: 'linear-gradient(180deg, #00000059 0%, #00000059 34%, transparent 34%, transparent 100%)',
    size: '100% 3px',
  });
});
