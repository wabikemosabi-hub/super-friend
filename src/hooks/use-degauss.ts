import { useState } from 'react';

import { rememberScanLine, scanLineOn } from '@/lib/scan-line';

export function useDegauss() {
  const [scanning, setScanning] = useState(scanLineOn);

  return {
    scanning,
    degauss: () => {
      rememberScanLine(!scanning);
      setScanning(!scanning);
    },
  };
}
