import 'expo-sqlite/localStorage/install';

const KEY = 'scan-line';

export function scanLineOn() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function rememberScanLine(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    return;
  }
}
