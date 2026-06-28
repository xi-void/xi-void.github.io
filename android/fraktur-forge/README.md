# Fraktur Forge — Android

A minimalist, dependency-free native port of the [Fraktur Forge](../../tools/fraktur-forge/)
web tool. Converts plain text to Unicode Fraktur entirely on-device.

## Why it's small and fast

- **No AndroidX, no Material Components, no Jetpack Compose.** A single
  `android.app.Activity` against the framework, styled with the platform
  `Theme.Material` (available since API 21). The only runtime code beyond the
  framework is the Kotlin stdlib.
- **Conversion is a flat table lookup** over the input's code points, run live
  on each keystroke — no allocation churn, no background threads, no I/O.
- **R8 in release** with `isMinifyEnabled` + `isShrinkResources`, and
  `buildConfig`/`aidl`/`renderScript`/`shaders` build features disabled. With
  zero dependencies the APK is essentially the framework-linked Activity plus a
  handful of resources.
- **No permissions, no network, no analytics.** Nothing leaves the device.

## Layout

```
app/src/main/
  AndroidManifest.xml
  java/com/xivoid/frakturforge/MainActivity.kt   # all logic + the char map
  res/layout/activity_main.xml                    # single screen
  res/values/{strings,colors,themes}.xml          # black/green terminal theme
  res/drawable/{bg_field,bg_button,ic_launcher}.xml
```

## Build

Requires a JDK 17 and the Android SDK (set `ANDROID_HOME`, or create
`local.properties` with `sdk.dir=/path/to/Android/sdk`). Then:

```sh
./gradlew assembleRelease    # APK in app/build/outputs/apk/release/
./gradlew installDebug       # build + install on a connected device/emulator
```

Or just open `android/fraktur-forge/` in Android Studio and run.

## Behaviour

- Live conversion as you type.
- **copy** puts the Fraktur output on the clipboard; **clear** resets;
  **example** inserts sample text.
- German support: `ä ö ü` (and `Ä Ö Ü`) via combining diaeresis, `ß`→`𝖘𝖘`,
  `ẞ`→`𝕾𝕾`. Input is NFC-normalized so decomposed umlauts also convert. Digits,
  punctuation, and unknown glyphs pass through unchanged.
