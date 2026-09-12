const ACCESS_KEY = 'mars-access-granted';

export function isAccessGranted(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.sessionStorage.getItem(ACCESS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function grantAccess(): void {
  try {
    window.sessionStorage.setItem(ACCESS_KEY, 'true');
  } catch {
    return;
  }
}
