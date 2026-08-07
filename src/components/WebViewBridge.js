// Helper for Android WebView JavaScript Interface integration
export const isAndroidWebView = () => {
  return typeof window !== 'undefined' && window.AndroidInterface !== undefined;
};

export const showAndroidToast = (message) => {
  if (isAndroidWebView() && typeof window.AndroidInterface.showToast === 'function') {
    window.AndroidInterface.showToast(message);
  } else {
    console.log('[Web Fallback Toast]:', message);
  }
};

export const vibrateDevice = (durationMs = 50) => {
  if (isAndroidWebView() && typeof window.AndroidInterface.vibrate === 'function') {
    window.AndroidInterface.vibrate(durationMs);
  } else if (navigator.vibrate) {
    navigator.vibrate(durationMs);
  }
};

export const triggerNativeSound = (soundType) => {
  if (isAndroidWebView() && typeof window.AndroidInterface.playSound === 'function') {
    window.AndroidInterface.playSound(soundType);
  }
};
