import {
  InterstitialAd,
  AdEventType,
  AppOpenAd,
  TestIds,
} from 'react-native-google-mobile-ads';

// ── Ad Unit IDs ────────────────────────────────────────────────────────────────
const IS_PRODUCTION = true; // Set to true before Play Store release

const AD_UNITS = {
  APP_OPEN:             IS_PRODUCTION ? 'ca-app-pub-6902161296773045/7231828222' : TestIds.APP_OPEN,
  INTERSTITIAL_BEFORE:  IS_PRODUCTION ? 'ca-app-pub-6902161296773045/1135293353' : TestIds.INTERSTITIAL,
  INTERSTITIAL_AFTER:   IS_PRODUCTION ? 'ca-app-pub-6902161296773045/8822211680' : TestIds.INTERSTITIAL,
};

// ── App Open Ad ────────────────────────────────────────────────────────────────
let appOpenAd = null;
let appOpenLoaded = false;

export function loadAppOpenAd() {
  appOpenAd = AppOpenAd.createForAdRequest(AD_UNITS.APP_OPEN, {
    requestNonPersonalizedAdsOnly: false,
  });
  appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
    appOpenLoaded = true;
  });
  appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
    appOpenLoaded = false;
    loadAppOpenAd(); // preload next one
  });
  appOpenAd.addAdEventListener(AdEventType.ERROR, () => {
    appOpenLoaded = false;
  });
  appOpenAd.load();
}

export function showAppOpenAd() {
  if (appOpenLoaded && appOpenAd) {
    appOpenAd.show();
  }
}

// ── Interstitial — Before Recipe (before loading) ─────────────────────────────
let interstitialBefore = null;
let interstitialBeforeLoaded = false;

export function loadInterstitialBefore() {
  interstitialBefore = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL_BEFORE, {
    requestNonPersonalizedAdsOnly: false,
  });
  interstitialBefore.addAdEventListener(AdEventType.LOADED, () => {
    interstitialBeforeLoaded = true;
  });
  interstitialBefore.addAdEventListener(AdEventType.CLOSED, () => {
    interstitialBeforeLoaded = false;
    loadInterstitialBefore(); // preload next
  });
  interstitialBefore.addAdEventListener(AdEventType.ERROR, () => {
    interstitialBeforeLoaded = false;
  });
  interstitialBefore.load();
}

export function showInterstitialBefore(onAdDismissed) {
  if (interstitialBeforeLoaded && interstitialBefore) {
    interstitialBefore.addAdEventListener(AdEventType.CLOSED, () => {
      if (onAdDismissed) onAdDismissed();
    });
    interstitialBefore.show();
  } else {
    // Ad not ready — proceed directly
    if (onAdDismissed) onAdDismissed();
  }
}

// ── Interstitial — After Recipe (before save) ─────────────────────────────────
let interstitialAfter = null;
let interstitialAfterLoaded = false;

export function loadInterstitialAfter() {
  interstitialAfter = InterstitialAd.createForAdRequest(AD_UNITS.INTERSTITIAL_AFTER, {
    requestNonPersonalizedAdsOnly: false,
  });
  interstitialAfter.addAdEventListener(AdEventType.LOADED, () => {
    interstitialAfterLoaded = true;
  });
  interstitialAfter.addAdEventListener(AdEventType.CLOSED, () => {
    interstitialAfterLoaded = false;
    loadInterstitialAfter(); // preload next
  });
  interstitialAfter.addAdEventListener(AdEventType.ERROR, () => {
    interstitialAfterLoaded = false;
  });
  interstitialAfter.load();
}

export function showInterstitialAfter(onAdDismissed) {
  if (interstitialAfterLoaded && interstitialAfter) {
    interstitialAfter.addAdEventListener(AdEventType.CLOSED, () => {
      if (onAdDismissed) onAdDismissed();
    });
    interstitialAfter.show();
  } else {
    if (onAdDismissed) onAdDismissed();
  }
}

// ── Preload all ads on startup ─────────────────────────────────────────────────
export function preloadAllAds() {
  loadAppOpenAd();
  loadInterstitialBefore();
  loadInterstitialAfter();
}
