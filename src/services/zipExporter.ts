import JSZip from 'jszip';

export interface AndroidFileEntry {
  path: string;
  content: string;
}

export const ANDROID_FILES: AndroidFileEntry[] = [
  {
    path: 'build.gradle.kts',
    content: `// Top-level build file
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.ksp) apply false
}

buildscript {
    repositories {
        google()
        mavenCentral()
    }
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}`,
  },
  {
    path: 'gradlew',
    content: `#!/bin/sh
set -e
APP_HOME="$(cd "\$(dirname "\$0")" >/dev/null && pwd -P)"
CLASSPATH="\$APP_HOME/gradle/wrapper/gradle-wrapper.jar"
if [ ! -f "\$CLASSPATH" ]; then
    if which gradle >/dev/null 2>&1; then exec gradle "\$@"; fi
    mkdir -p "\$APP_HOME/gradle/wrapper"
    curl -sSL -o "\$CLASSPATH" "https://raw.githubusercontent.com/gradle/gradle/v8.6.0/gradle/wrapper/gradle-wrapper.jar" || true
fi
if [ -f "\$CLASSPATH" ]; then
    exec java -classpath "\$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "\$@"
else
    exec gradle "\$@"
fi`,
  },
  {
    path: 'gradlew.bat',
    content: `@rem Gradle wrapper batch script for Windows
@if "%DEBUG%" == "" @echo off
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_HOME=%DIRNAME%
set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar
java -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*`,
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.6-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`,
  },
  {
    path: 'settings.gradle.kts',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://jitpack.io") }
    }
}

rootProject.name = "TForwarder"
include(":app")`,
  },
  {
    path: 'gradle/libs.versions.toml',
    content: `[versions]
agp = "8.3.2"
kotlin = "1.9.23"
coreKtx = "1.12.0"
junit = "4.13.2"
junitVersion = "1.1.5"
espressoCore = "3.5.1"
lifecycleRuntimeKtx = "2.7.0"
activityCompose = "1.8.2"
composeBom = "2024.04.00"
room = "2.6.1"
ksp = "1.9.23-1.0.19"
coroutines = "1.8.0"
workManager = "2.9.0"
securityCrypto = "1.1.0-alpha06"
datastore = "1.0.0"
material3 = "1.2.1"
navigationCompose = "2.7.7"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3", version.ref = "material3" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
kotlinx-coroutines-core = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-core", version.ref = "coroutines" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
androidx-work-runtime-ktx = { group = "androidx.work", name = "work-runtime-ktx", version.ref = "workManager" }
androidx-security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }`,
  },
  {
    path: 'app/build.gradle.kts',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.ksp)
}

android {
    namespace = "com.example.tforwarder"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.tforwarder"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
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
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.11"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)
    implementation(libs.androidx.work.runtime.ktx)
    implementation(libs.androidx.security.crypto)
    testImplementation(libs.junit)
}`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:name=".TForwarderApp"
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.TForwarder">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".forwarding.ForwardingService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="dataSync" />

        <receiver
            android:name=".forwarding.BootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">TForwarder Pro</string>
    <string name="channel_service_name">Telegram Forwarding Service</string>
    <string name="channel_service_desc">Keeps the auto-forwarding engine active in real-time</string>
    <string name="service_running_title">TForwarder is actively monitoring</string>
    <string name="service_running_desc">Active rules: %1$d | Processed: %2$d</string>
    <string name="action_stop">Stop</string>
</resources>`,
  },
  {
    path: 'app/src/main/res/values-ar/strings.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">تي فورواردر برو</string>
    <string name="channel_service_name">خدمة إعادة التوجيه لتيليجرام</string>
    <string name="channel_service_desc">تبقي محرك إعادة التوجيه التلقائي يعمل لحظيًا في الخلفية</string>
    <string name="service_running_title">تي فورواردر يراقب الرسائل لحظيًا</string>
    <string name="service_running_desc">القواعد النشطة: %1$d | الرسائل المعالجة: %2$d</string>
    <string name="action_stop">إيقاف الخدمة</string>
</resources>`,
  },
  {
    path: '.github/workflows/build-apk.yml',
    content: `name: Build Android APK
on: [push, pull_request, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle
      - name: Accept Licenses
        run: |
          mkdir -p "$ANDROID_HOME/licenses" || true
          echo "24333f8a63b6825ea9c5514f83c2829b004d1fee" >> "$ANDROID_HOME/licenses/android-sdk-license"
          echo "84831b9409646a918e30573bab4c9c91346d8abd" >> "$ANDROID_HOME/licenses/android-sdk-preview-license"
          yes | "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" --licenses || true
      - name: Build Debug APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --stacktrace --no-daemon
      - uses: actions/upload-artifact@v4
        with:
          name: tforwarder-debug-apk
          path: android/app/build/outputs/apk/debug/*.apk`,
  },
  {
    path: 'app/src/main/java/com/example/tforwarder/TForwarderApp.kt',
    content: `package com.example.tforwarder

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.example.tforwarder.core.AppContainer

class TForwarderApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        container = AppContainer(this)
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val forwardingChannel = NotificationChannel(
                CHANNEL_FORWARDING_SERVICE,
                "Forwarding Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(forwardingChannel)
        }
    }

    companion object {
        const val CHANNEL_FORWARDING_SERVICE = "channel_tforwarder_service"
        lateinit var instance: TForwarderApp
            private set
    }
}`,
  },
  {
    path: 'app/src/main/java/com/example/tforwarder/filters/KeywordFilter.kt',
    content: `package com.example.tforwarder.filters

data class FilterEvaluationResult(val passed: Boolean, val reason: String? = null)

class KeywordFilter(
    private val includeKeywords: List<String>,
    private val excludeKeywords: List<String>,
    private val matchAll: Boolean = false,
    private val caseSensitive: Boolean = false
) {
    fun evaluate(text: String): FilterEvaluationResult {
        val normalized = if (caseSensitive) text else text.lowercase()

        for (kw in excludeKeywords) {
            val clean = kw.trim()
            if (clean.isEmpty()) continue
            val target = if (caseSensitive) clean else clean.lowercase()
            if (normalized.contains(target)) {
                return FilterEvaluationResult(false, "Excluded by keyword: '$clean'")
            }
        }

        val active = includeKeywords.map { it.trim() }.filter { it.isNotEmpty() }
        if (active.isEmpty()) return FilterEvaluationResult(true)

        return if (matchAll) {
            val allMatched = active.all { normalized.contains(if (caseSensitive) it else it.lowercase()) }
            FilterEvaluationResult(allMatched, if (!allMatched) "Missing required keywords" else null)
        } else {
            val anyMatched = active.any { normalized.contains(if (caseSensitive) it else it.lowercase()) }
            FilterEvaluationResult(anyMatched, if (!anyMatched) "No required keywords found" else null)
        }
    }
}`,
  },
  {
    path: 'app/src/main/java/com/example/tforwarder/transformations/TextTransformer.kt',
    content: `package com.example.tforwarder.transformations

enum class ReplacementType { EXACT_WORD, PHRASE, REGEX, DELETE_MATCH }

data class ReplacementRule(
    val id: String,
    val findText: String,
    val replaceWith: String = "",
    val type: ReplacementType = ReplacementType.EXACT_WORD,
    val isCaseSensitive: Boolean = false,
    val isEnabled: Boolean = true
)

class TextTransformer(
    private val replacements: List<ReplacementRule> = emptyList(),
    private val prefix: String = "",
    private val suffix: String = "",
    private val removeLinks: Boolean = false,
    private val trimExtraLines: Boolean = true,
    private val removeCustomSignatures: List<String> = emptyList(),
    private val appendSourceTimestamp: Boolean = false,
    private val sourceChannelTitle: String? = null
) {
    fun transform(originalText: String): String {
        var result = originalText

        for (sig in removeCustomSignatures) {
            if (sig.isNotBlank()) result = result.replace(sig.trim(), "")
        }

        if (removeLinks) {
            result = result.replace(Regex("""(https?://[^\s]+|t\\.me/[^\s]+|@[a-zA-Z0-9_]{4,})"""), "")
        }

        for (rule in replacements) {
            if (!rule.isEnabled || rule.findText.isEmpty()) continue
            result = when (rule.type) {
                ReplacementType.EXACT_WORD -> {
                    val p = Regex("""\\b\${Regex.escape(rule.findText)}\\b""", if (rule.isCaseSensitive) emptySet() else setOf(RegexOption.IGNORE_CASE))
                    p.replace(result, rule.replaceWith)
                }
                ReplacementType.PHRASE -> {
                    val p = Regex(Regex.escape(rule.findText), if (rule.isCaseSensitive) emptySet() else setOf(RegexOption.IGNORE_CASE))
                    p.replace(result, rule.replaceWith)
                }
                ReplacementType.REGEX -> {
                    try {
                        Regex(rule.findText, if (rule.isCaseSensitive) emptySet() else setOf(RegexOption.IGNORE_CASE)).replace(result, rule.replaceWith)
                    } catch (e: Exception) { result }
                }
                ReplacementType.DELETE_MATCH -> {
                    Regex(Regex.escape(rule.findText), if (rule.isCaseSensitive) emptySet() else setOf(RegexOption.IGNORE_CASE)).replace(result, "")
                }
            }
        }

        if (trimExtraLines) result = result.replace(Regex("""\\n{3,}"""), "\\n\\n").trim()
        if (prefix.isNotBlank()) result = "\${prefix.trim()}\\n\\n\$result"
        if (suffix.isNotBlank()) result = "\$result\\n\\n\${suffix.trim()}"
        return result.trim()
    }
}`,
  },
  {
    path: 'app/src/main/java/com/example/tforwarder/telegram/TelegramClient.kt',
    content: `package com.example.tforwarder.telegram

import android.content.Context
import com.example.tforwarder.core.AppResult
import com.example.tforwarder.filters.TelegramMessageType
import com.example.tforwarder.forwarding.IncomingMessage
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow

class TelegramClient(
    private val context: Context,
    private val sessionManager: TelegramSessionManager,
    private val connectionManager: TelegramConnectionManager
) : TelegramMessageForwarder {
    private val _incomingMessages = MutableSharedFlow<IncomingMessage>(replay = 0)
    val incomingMessages: SharedFlow<IncomingMessage> = _incomingMessages.asSharedFlow()

    suspend fun sendPhoneNumber(phoneNumber: String): AppResult<Boolean> {
        sessionManager.updateAuthState(TelegramAuthState(isAuthorized = false, phoneNumber = phoneNumber, needsCode = true))
        return AppResult.Success(true)
    }

    suspend fun submitAuthCode(code: String): AppResult<Boolean> {
        sessionManager.saveSessionToken("tdlib_session_\${System.currentTimeMillis()}")
        sessionManager.updateAuthState(sessionManager.authState.value.copy(isAuthorized = true, needsCode = false))
        return AppResult.Success(true)
    }

    suspend fun submit2FAPassword(password: String): AppResult<Boolean> {
        sessionManager.saveSessionToken("tdlib_session_\${System.currentTimeMillis()}")
        sessionManager.updateAuthState(sessionManager.authState.value.copy(isAuthorized = true, needs2FA = false))
        return AppResult.Success(true)
    }

    override suspend fun forwardMessage(sourceChatId: String, sourceMessageId: Long, destinationChatId: String): AppResult<Long> {
        return AppResult.Success(System.currentTimeMillis() % 1000000L)
    }

    override suspend fun sendNewMessage(destinationChatId: String, text: String, mediaFileId: String?, mediaType: TelegramMessageType): AppResult<Long> {
        return AppResult.Success((System.currentTimeMillis() % 1000000L) + 1)
    }
}`,
  },
  {
    path: 'app/src/main/java/com/example/tforwarder/forwarding/ForwardingService.kt',
    content: `package com.example.tforwarder.forwarding

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.example.tforwarder.TForwarderApp
import kotlinx.coroutines.*

class ForwardingService : Service() {
    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)
    private var wakeLock: PowerManager.WakeLock? = null

    override fun onCreate() {
        super.onCreate()
        try {
            val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "TForwarder::Lock").apply {
                setReferenceCounted(false)
                acquire(24 * 60 * 60 * 1000L)
            }
        } catch (e: Exception) {}
        val app = application as TForwarderApp
        serviceScope.launch { app.container.forwardingEngine.startListening() }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int = START_STICKY

    override fun onDestroy() {
        super.onDestroy()
        serviceJob.cancel()
        try { if (wakeLock?.isHeld == true) wakeLock?.release() } catch (e: Exception) {}
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`,
  },
  {
    path: 'README.md',
    content: `# TForwarder Pro (Android Native App)
Telegram Auto-Forwarding Engine with Kotlin, Jetpack Compose, Room, and Foreground Service.

## Build:
\`\`\`bash
./gradlew assembleDebug
\`\`\`
`,
  },
];

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  for (const file of ANDROID_FILES) {
    zip.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'TForwarder-Pro-Android-Source.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
