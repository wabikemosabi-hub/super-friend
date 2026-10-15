import { Platform, type ViewStyle } from 'react-native';

export type Texture = { image: string; size?: string };

export function textureStyle({ image, size }: Texture): ViewStyle {
  if (Platform.OS === 'web') {
    const css = {
      backgroundColor: 'transparent',
      backgroundImage: image,
      ...(size ? { backgroundSize: size, backgroundRepeat: 'repeat' } : {}),
    };
    return css;
  }
  return {
    experimental_backgroundImage: image,
    ...(size ? { experimental_backgroundSize: size, experimental_backgroundRepeat: 'repeat' } : {}),
  };
}

export function scanlines(line: string): Texture {
  return {
    image: `linear-gradient(180deg, ${line} 0%, ${line} 34%, transparent 34%, transparent 100%)`,
    size: '100% 3px',
  };
}
