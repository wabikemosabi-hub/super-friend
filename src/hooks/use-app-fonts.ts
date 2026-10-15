import { BarlowCondensed_700Bold, BarlowCondensed_800ExtraBold } from '@expo-google-fonts/barlow-condensed';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { useFonts } from 'expo-font';

import { Typefaces } from '@/constants/theme';

export function useAppFonts() {
  const [loaded, error] = useFonts({
    [Typefaces.display]: BarlowCondensed_800ExtraBold,
    [Typefaces.tape]: BarlowCondensed_700Bold,
    [Typefaces.label]: SpaceMono_400Regular,
    [Typefaces.labelBold]: SpaceMono_700Bold,
    [Typefaces.screen]: VT323_400Regular,
  });
  return loaded || error !== null;
}
