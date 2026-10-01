import { Michroma_400Regular } from '@expo-google-fonts/michroma';
import { SpaceMono_400Regular, SpaceMono_700Bold } from '@expo-google-fonts/space-mono';
import { VT323_400Regular } from '@expo-google-fonts/vt323';
import { useFonts } from 'expo-font';

import { Typefaces } from '@/constants/theme';

export function useAppFonts() {
  const [loaded, error] = useFonts({
    [Typefaces.display]: Michroma_400Regular,
    [Typefaces.label]: SpaceMono_400Regular,
    [Typefaces.labelBold]: SpaceMono_700Bold,
    [Typefaces.screen]: VT323_400Regular,
  });
  return loaded || error !== null;
}
