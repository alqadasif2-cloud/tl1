# TForwarder Pro (مُعيد توجيه رسائل Telegram تلقائيًا لنظام أندرويد)

تطبيق Android أصلي (Native Kotlin + Jetpack Compose + Material 3) مخصص لإعادة توجيه رسائل Telegram تلقائيًا وبصورة لحظية وفق قواعد تصفية وتحويل متقدمة، مع دعم Foreground Service للتشغيل المستمر وحماية الجلسات باستخدام Android Keystore.

---

## 🌟 المميزات الرئيسية (Core Features)

1. **اتصال مباشر وحقيقي بحساب تيليجرام:**
   - تسجيل الدخول برقم الهاتف ورمز التحقق الرسمي.
   - دعم كامل للتحقق بخطوتين (2FA Cloud Password).
   - تشفير الجلسات باستخدام `Android Keystore` و `EncryptedSharedPreferences`.
   - استعادة الجلسة تلقائيًا عند إعادة فتح التطبيق أو إعادة تشغيل الجهاز.

2. **محرك إعادة التوجيه الفوري (Real-Time Forwarding Engine):**
   - متابعة القنوات والمجموعات والمحادثات الخاصة لحظيًا.
   - تشغيل مستمر في الخلفية عبر `Foreground Service` مع إشعار دائم وإمكانية الإيقاف المباشر.
   - استعادة العمل بعد إعادة تشغيل الهاتف بواسطة `BootReceiver` و `RecoveryWorker`.

3. **نظام فلاتر وتصفية متقدم (Advanced Filters):**
   - كلمات مفتاحية للتضمين والاستبعاد (Include / Exclude).
   - خيارات مطابقة الكل (Match All) أو أي كلمة (Match Any) وتجاهل حالة الأحرف.
   - دعم كامل للتعبيرات النمطية (Regular Expressions) مع التحقق الفوري من صحتها وتجربتها.
   - تصفية حسب نوع الوسائط (نصوص، صور، فيديو، مستندات، صوتيات، ألبومات، روابط).

4. **محرر تعديل الرسائل (Message Transformation Pipeline):**
   - استبدال كلمات أو عبارات محددة (مثل: تغيير `GOLD` إلى `XAUUSD`).
   - استبدال أو حذف بالاعتماد على Regex.
   - إضافة نصوص ترويسة (Prefix) أو تذييل (Suffix).
   - إزالة الروابط ومعرفات القنوات تلقائيًا.
   - تنظيف الأسطر الفارغة وإزالة التواقيع الإعلانية.
   - إضافة اسم المصدر أو وقت وصول الرسالة.

5. **أوضاع التوجيه (Forwarding Modes):**
   - **الوضع الأصلي:** إعادة توجيه Telegram الرسمية مع إسناد المصدر.
   - **نسخ المحتوى كرسالة جديدة:** يتيح التعديل والتخصيص الكاملين.
   - **نسخ بدون إسناد:** إرسال المحتوى منسقًا دون اسم القناة الأصلية.

6. **منع التكرار وسجل العمليات (Deduplication & Local Room Logging):**
   - فحص معرفات الرسائل وبصمة التشفير (SHA-256 Hash) لمنع تكرار الإرسال عند انقطاع الشبكة.
   - قاعدة بيانات محلية `Room` تسجل وقت وتفاصيل كل عملية، مع بيان سبب الرفض أو الفشل ومحتوى النص قبل وبعد التعديل.
   - مرشحات بحث في السجلات حسب الحالة والتاريخ والقاعدة.

---

## 📂 بنية المشروع (Project Structure)

```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/example/tforwarder/
│   │   │   │   ├── TForwarderApp.kt
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── core/
│   │   │   │   │   ├── AppContainer.kt
│   │   │   │   │   ├── ErrorHandler.kt
│   │   │   │   │   └── Result.kt
│   │   │   │   ├── data/
│   │   │   │   │   ├── local/
│   │   │   │   │   │   ├── AppDatabase.kt
│   │   │   │   │   │   ├── RuleDao.kt
│   │   │   │   │   │   ├── MessageLogDao.kt
│   │   │   │   │   │   └── entities/
│   │   │   │   │   │       ├── ForwardingRuleEntity.kt
│   │   │   │   │   │       ├── MessageProcessingLogEntity.kt
│   │   │   │   │   │       └── ProcessedMessageEntity.kt
│   │   │   │   ├── telegram/
│   │   │   │   │   ├── TelegramClient.kt
│   │   │   │   │   ├── TelegramSessionManager.kt
│   │   │   │   │   └── TelegramConnectionManager.kt
│   │   │   │   ├── forwarding/
│   │   │   │   │   ├── ForwardingEngine.kt
│   │   │   │   │   ├── ForwardingService.kt
│   │   │   │   │   ├── MessageProcessor.kt
│   │   │   │   │   ├── RuleMatcher.kt
│   │   │   │   │   ├── DuplicateDetector.kt
│   │   │   │   │   ├── BootReceiver.kt
│   │   │   │   │   └── RecoveryWorker.kt
│   │   │   │   ├── filters/
│   │   │   │   │   ├── KeywordFilter.kt
│   │   │   │   │   ├── RegexFilter.kt
│   │   │   │   │   └── MessageTypeFilter.kt
│   │   │   │   ├── transformations/
│   │   │   │   │   ├── TextTransformer.kt
│   │   │   │   │   └── ReplacementRule.kt
│   │   │   │   └── security/
│   │   │   │       └── SecureStorage.kt
│   │   │   └── res/
│   │   │       ├── values/strings.xml
│   │   │       └── values-ar/strings.xml
│   │   └── test/java/com/example/tforwarder/
│   │       └── FilterAndTransformerUnitTest.kt
│   └── build.gradle.kts
├── gradle/
│   └── libs.versions.toml
├── build.gradle.kts
└── settings.gradle.kts
```

---

## 🛠️ كيفية البناء والتشغيل (Build & Run Instructions)

### 1. في بيئة Android Studio:
1. افتح Android Studio واختر **Open Existing Project** وحدد مجلد `android/`.
2. انتظر اكتمال مزامنة Gradle (`Gradle Sync`).
3. شغّل المشروع على محاكي (Emulator) أو جهاز حقيقي بنظام Android 8.0 (API 26) فما فوق.

### 2. بناء APK عبر سطر الأوامر (Command Line):
```bash
cd android
# بناء نسخة التجربة (Debug APK)
./gradlew assembleDebug

# ملف APK الناتج تجده في:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. البناء التلقائي عبر GitHub Actions:
المشروع مزود بملف جاهز `.github/workflows/build-apk.yml`. بمجرد رفع الكود إلى GitHub:
- يتم تجميع التطبيق تلقائيًا على خوادم Ubuntu مع JDK 17.
- يُرفع ملف `tforwarder-debug-apk` كـ Artifact قابل للتنزيل فورًا.

---

## 🔑 الحصول على مفاتيح Telegram الرسمية (API ID & API Hash)
1. توجّه إلى موقع تيليجرام الرسمي: [https://my.telegram.org](https://my.telegram.org)
2. سجّل الدخول برقم هاتفك.
3. اختر **API development tools**.
4. أنشئ تطبيقًا جديدًا واحصل على `App api_id` و `App api_hash`.
5. أدخلهما في شاشة إعدادات التطبيق.

---

## 🔋 تحسينات البطارية والتشغيل الدائم في أندرويد
لضمان عدم إيقاف الخدمة في الخلفية من قبل نظام التشغيل:
1. استثنِ التطبيق من **تحسين استهلاك البطارية (Battery Optimization)** من إعدادات الهاتف.
2. في هواتف Xiaomi (MIUI) و Huawei و Samsung: فعّل خيار **التشغيل التلقائي (Auto-start)** وامنح صلاحية العمل بالخلفية.
