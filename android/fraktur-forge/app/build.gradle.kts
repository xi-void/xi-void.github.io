plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.xivoid.frakturforge"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.xivoid.frakturforge"
        minSdk = 21
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        // No test runners, no app components beyond the single Activity.
    }

    buildTypes {
        release {
            // R8 full mode: shrink + optimize. With zero dependencies the
            // resulting APK is only the framework-linked Activity + resources.
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        // Trim everything we do not use.
        buildConfig = false
        resValues = false
        aidl = false
        renderScript = false
        shaders = false
    }
}

dependencies {
    // Intentionally empty. Framework + Kotlin stdlib only — no AndroidX,
    // no Material Components, no Compose. Keeps the APK tiny and cold-start fast.
}
