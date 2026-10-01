# تقرير ترحيل Firebase — تطبيق Anime Black للأندرويد

- **التاريخ:** 1 أكتوبر 2026
- **الفرع:** `arena/01a0f814-ab` (أساس `502ceae`) — تعديلات هذه الجلسة موضّحة في «سجل التنفيذ».
- **المشروع الجديد:** `animeblackapp-b6223` — رقم المشروع `233883926464` — تطبيق أندرويد `1:233883926464:android:13747ee836356f1bd21225` — الحزمة `com.animeblack.app`.
- **مراجع تفصيلية:** `AUDIT.md` و `DEPLOY.md` (بالإنجليزية، سجل تاريخي وتفصيلي) — هذا التقرير عربي ومُحدَّث.

---

## سجل التنفيذ في هذه الجلسة (1 أكتوبر 2026)

| # | الإجراء | النتيجة |
| --- | --- | --- |
| 1 | مقارنة الملف الذي أرسلته `google-services.json` مع المثبَّت في `android/app/google-services.json` | **متطابقان بايت-ببايت** (نفس بصمة SHA-256: `d89bc0e2…`) → لا حاجة لأي تبديل. ✅ |
| 2 | تعديل افتراضي قاعدة بيانات الدوال في `functions/src/index.ts` | أصبح `(default)` بدل القاعدة المسماة القديمة، مع إبقاء متغير `FIRESTORE_DB_ID` لتجاوزه. ✅ |
| 3 | التحقق من بناء الدوال محليًا | `npm install && npm run build` (tsc) → **نجح بلا أخطاء**. ✅ |
| 4 | `index.html.stories_bak` | **يُبقى بقرارك** (قد تحتاجه كمرجع) — لا حذف. |
| 5 | ملفات الويب (`index.html`, `firebase-applet-config.json`, `src/config/firebase.ts`) | **تُركت كما هي** لأن تطبيق الويب يعمل عليها — لا كسر. |

**تعديلات هذه الجلسة (3 ملفات):** `functions/src/index.ts` (سطران)، `android/firebase-migration/DEPLOY.md` (فقرة الدوال)، وإضافة `android/firebase-migration/REPORT-AR.md` (هذا التقرير). **لا تغيير في كود الأندرويد** — لأنه مكتمل أصلًا.

---

## تنبيهات أولى (يجب قراءتها)

1. **الملف المرفق مُتحقَّق منه:** أرسلته لي لاحقًا وطابق تمامًا الملف المثبَّت (نفس المشروع، نفس رقم المشروع، نفس معرّف التطبيق، نفس الحزمة، نفس عميل الويب) — **الترحيل في الأندرويد سليم ولا يحتاج تعديلًا**. ⚠️ الملف لا يحوي عميل Android OAuth (`client_type 1`)، أي لا بصمة مسجّلة بعد (انظر النقطة 5 أدناه).
2. **تصحيح اسم المشروع:** `animeblackapp` هو **الاسم المعروض (display name)**؛ المعرّف الفعلي الذي تستخدمه SDK هو `animeblackapp-b6223`. لا تعارض.
3. **تصحيح حالة Firestore:** الطلب ذكر أن قاعدة Firestore أُنشئت في المشروع الجديد، لكن الفحص المباشر (1 أكتوبر) يعيد: `404 — The database (default) does not exist for project animeblackapp-b6223`. أي أن **قاعدة البيانات غير موجودة بعد**، وهذه أول خطوة يدوية مطلوبة.

---

# القسم أ — تقرير التدقيق (المرحلة 1)

## 1) أين يُشار إلى المشروع القديم؟

### داخل `android/` — لا توجد أي إشارة فعّالة ✅
| الموضع | الحالة |
| --- | --- |
| `android/app/firebase-web-config.json` | كان يحمل إعداد الويب القديم كاملًا — **حُذف** في الدفعة `881361d2c`. |
| `android/app/build.gradle.kts` | كان يقرأ إعداد الويب كبديل عند غياب `google-services.json` — **أُزيل البديل**، الملف الآن إلزامي. |
| `android/scripts/ci-android.mjs` | كان فحص الجاهزية يقرأ إعداد الويب — **يقرأ الآن `google-services.json`**. |
| كود Kotlin (168 ملفًا) | **لا يوجد أي مرجع** لمشروع أو قاعدة قديمة. |
| `android/firebase-migration/AUDIT.md` و `DEPLOY.md` | إشارات مختصرة مقصودة (`ai-studio-51245802-…`، `booming-…`) كسجل تاريخي موثّق — **تبقى عمدًا** ومشروحة. |
| `android/MIGRATION.md` و `README.md` | حُدِّثا ليذكرا `animeblackapp-b6223`. |

### خارج `android/`
| الملف | السطر | ماذا يوجد / القرار |
| --- | --- | --- |
| `functions/src/index.ts` | 26 | **عُدِّل اليوم:** الافتراضي أصبح `(default)`؛ متغيّر `FIRESTORE_DB_ID` يبقى لتجاوزه عند نشر دوال مشروع الويب القديم. |
| `firebase-applet-config.json` | 6 | `firestoreDatabaseId = ai-studio-51245802-…` — **يبقى** (تطبيق الويب يعمل عليه) |
| `index.html` | 24013 | `const dbId = "ai-studio-51245802-…"` — **يبقى** (واجهة تشخيص في السطر 23665) |
| `src/config/firebase.ts` | 53–54 | يقرأ الإعداد أعلاه — **يبقى** |
| `index.html.stories_bak` | 9331 | نسخة احتياطية غير مرجعية (1.4MB) — **تبقى بقرارك لمراجعتها لاحقًا** |
| `FIX-REPORT.md` / `PR2-HARDENING-REPORT.md` | — | إشارات مختصرة في تقارير ويب قديمة (سجل تاريخي) |

> السبب في إبقاء مراجع الويب: تطبيق الويب لا يزال يعمل على المشروع القديم (بيانات الويب منفصلة عن الأندرويد عن قصد).

## 2) أين تُحمَّل إعدادات Firebase في تطبيق الأندرويد؟

1. **`android/app/build.gradle.kts`** — يتحقق من وجود `google-services.json` (`check()`) ويستخرج منه: قاعدة `(default)`، ومعرّف عميل الويب (`oauth_client` نوع `3`) لتسجيل دخول Google.
2. **إضافة `com.google.gms.google-services`** — تولّد الموارد القياسية (`google_app_id`, `gcm_defaultSenderId`, `project_id`, `google_api_key`, `google_storage_bucket`, `default_web_client_id`) و`FirebaseInitProvider` — أي أن `FirebaseApp` تُهيَّأ تلقائيًا من نفس الملف.
3. **`FirebaseModule.providesFirebaseApp`** (`core/data/.../firebase/FirebaseModule.kt`) — `FirebaseApp.getApps()` أو `initializeApp`.
4. **`AppModule`** (`app/.../di/AppModule.kt`) — يبني `AppConfig` من `BuildConfig`: `FIRESTORE_DATABASE_ID = "(default)"`، `GOOGLE_WEB_CLIENT_ID` (من الملف)، `API_BASE_URL` (لسيرفر الويب).
5. **`FirebaseModule.providesFirestore`** — قاعدة `(default)` مع كاش محلي دائم 100MB.
6. **`AnimeBlackApplication`** — يثبّت App Check (تصحيح في debug، Play Integrity في release) ويضبط Crashlytics/Performance.

> التطبيق **لا يقرأ** `default_web_client_id` مباشرة؛ يحسب القيمة المكافئة في `build.gradle.kts` ويضعها في `BuildConfig.GOOGLE_WEB_CLIENT_ID` ثم يمرّرها كـ `serverClientId`.

## 3) خدمات Firebase المستخدمة فعليًا

| الخدمة | مستخدمة؟ | أين |
| --- | --- | --- |
| Authentication | ✅ | بريد/كلمة مرور، Google، حساب ضيف (Anonymous)، وربط الحسابات — `FirebaseAuthRepository` |
| Google Sign-In | ✅ | Credential Manager + `googleid`، `serverClientId` = عميل الويب (`GoogleSignInClient.kt`) |
| Firestore | ✅ | كل المستودعات + Outbox + الحضور + توكنات الأجهزة |
| Storage | ✅ (كود فقط) | `StorageUploader` — يفشل حاليًا ويعيد المحاولة لأن التخزين غير مفعّل |
| Cloud Functions | ✅ | `claimDailyReward`, `economyTransfer`, `getChatMediaUrl` (منطقة `us-central1`) |
| FCM | ✅ | `AnimeBlackMessagingService` + `PushTokenManager` (التوكن في `users/{uid}/devices/{token}`) + 4 قنوات |
| Crashlytics + Performance | ✅ | `AnimeBlackApplication` و`AnalyticsHelper` والإضافات |
| Analytics | ✅ | `AnalyticsHelper` + `FirebaseModule` |
| Remote Config | ✅ | `FeatureFlags` |
| Installations | ✅ (تبعية) | تستخدمها FCM/Remote Config/Analytics |
| App Check | ✅ | debug: مزوّد تصحيح، release: Play Integrity — **غير مفعّل إلزاميًا** |
| App Distribution | ❌ | غير مستخدم |

## 4) الملفات التي تحتاج تعديلًا

- **الأندرويد: لا شيء** — الترحيل مكتمل في الكود ومُختبَر على CI.
- **نُفِّذ اليوم:** افتراضي قاعدة بيانات الدوال (`functions/src/index.ts`) + تحديث `DEPLOY.md` + هذا التقرير.
- **مستقبلًا (اختياري):** `android/app/google-services.json` فقط — استبداله بنسخة جديدة بعد تسجيل بصمات SHA (ستحوي `oauth_client` من النوع `1`).

---

# القسم ب — تقرير الترحيل النهائي (12 نقطة)

## 1) حالة الترحيل

| المحور | الحالة |
| --- | --- |
| تهيئة Firebase من المشروع الجديد | ✅ مكتملة — `google-services.json` هو المصدر الوحيد بلا بديل |
| `applicationId` | ✅ ثابت `com.animeblack.app` |
| إصدارات Firebase/BoM | ✅ كما هي (BoM `34.19.0`، google-services `4.5.0`) — لا تخفيض |
| قاعدة Firestore | ❌ غير موجودة بعد — **خطوة يدوية** |
| مزوّدو الدخول | ❌ Google/Anonymous/Email معطّلة — **خطوة يدوية** |
| بصمات SHA | ⚠️ بصمة التصحيح موثّقة لكن غير مسجّلة — **خطوة يدوية** |
| Storage | ⚠️ غير مفعّل (غير مصرّح بالفاتورة) — تُرك كما هو بقرارك |
| الدوال السحابية | ⚠️ الافتراضي صار `(default)` اليوم — يبقى النشر (Blaze) خطوة يدوية |
| البناء | ✅ ثلاث دفعات ناجحة على CI (شاملةً APK) + بناء الدوال نجح محليًا اليوم |

## 2) الملفات المتغيّرة

**الدفعات الثلاث السابقة على الفرع الأم `arena/01a0d615-ab`:**

| الدفعة | الرسالة | الملفات |
| --- | --- | --- |
| `6a2299766` | switch Firebase to the new project | `android/app/build.gradle.kts` (تعديل)، `android/app/google-services.json` (إضافة)، `android/scripts/ci-android.mjs` (تعديل)، وإضافة `android/firebase-migration/{AUDIT.md, DEPLOY.md, firebase.json, firestore.indexes.json, firestore.rules, storage.rules}` |
| `881361d2c` | remove old Firebase project references | حذف `android/app/firebase-web-config.json`، تعديل `android/MIGRATION.md` و`README.md` و`AUDIT.md` و`DEPLOY.md` |
| `502ceae` | audit header fix | `android/firebase-migration/AUDIT.md` فقط |

نتائج CI: `36623551659` (15m07s) ✅ — `36625243836` (10m50s) ✅ — `36626532710` (6m47s) ✅

**تعديلات اليوم (هذه الجلسة):** `functions/src/index.ts`، `android/firebase-migration/DEPLOY.md`، `android/firebase-migration/REPORT-AR.md` (إضافة).

## 3) المراجع القديمة: الموجودة / المحذوفة

- **حُذفت سابقًا:** إعداد الويب القديم من مجلد الأندرويد + البديل في `build.gradle.kts` + قراءته في سكربت CI.
- **أُزيلت اليوم:** القيمة الافتراضية للقاعدة المسماة في `functions/src/index.ts` (لم يعد الملف يحوي أي معرّف قديم).
- **النص الكامل للمعرّف القديم** موجود الآن في **3 ملفات فقط**: `firebase-applet-config.json`، `index.html`، `index.html.stories_bak` — كلها ويب/نسخة احتياطية، **مقصودة ومشروحة**. **صفر إشارة داخل `android/` أو `functions/`.** ✅
- تبقى إشارات مختصرة (`ai-studio-…`) في تقارير/سجلات تاريخية (`AUDIT.md`, `FIX-REPORT.md`, `PR2-HARDENING-REPORT.md`) — موثّقة كسجل تاريخي.

## 4) المراجع الجديدة المضافة

- `android/app/google-services.json`: `project_id = animeblackapp-b6223`، `project_number = 233883926464`، `mobilesdk_app_id = 1:233883926464:android:13747ee836356f1bd21225`، `package_name = com.animeblack.app`، عميل ويب `oauth_client client_type 3`.
- `FIRESTORE_DATABASE_ID = "(default)"` في `build.gradle.kts`.
- `functions/src/index.ts`: `DB_ID` الافتراضي = `(default)` مع الإشارة لمشروع الأندرويد الجديد.
- ذُكر المشروع الجديد في: `android/README.md`، `android/MIGRATION.md`، `android/firebase-migration/{AUDIT.md, DEPLOY.md}`، وملف الإعداد.

## 5) حالة المصادقة (Auth)

- ✅ التهيئة من المشروع الجديد عبر `FirebaseApp` — لا معرّف مشروع مكتوب في الكود.
- ✅ تسجيل دخول Google **لم يُعطَّل**؛ `serverClientId` = عميل الويب من الملف الجديد.
- ✅ فحص `getProjectConfig` يرد `projectId = 233883926464` ونطاقات المشروع الجديد.
- ⚠️ **المانع:** لا يوجد عميل Android OAuth (`client_type 1`) → **لا بصمة مسجّلة** → سيفشل الدخول برسالة `google-config` (خطأ 28444 «Developer console»). الحل: تسجيل البصمات ثم تنزيل الملف من جديد واستبداله.
- 🔒 البصمات الموثّقة (مُستخرجة من `android/app/debug.keystore` بـ OpenSSL — **بلا تخمين**):
  - SHA-1: `4E:3D:7B:4F:5E:12:72:8A:C2:AE:21:30:CD:83:E4:9D:6D:58:CE:9F`
  - SHA-256: `5A:52:7E:23:6B:D0:73:1D:85:FD:9A:F4:E4:C0:B3:0F:00:20:3B:93:62:5F:CE:20:62:BA:9E:14:A3:2E:A1:94`
  - بصمات **الإصدار (release): غير قابلة للتحقق** — لا مفتاح إصدار في المشروع.

## 6) حالة Firestore

- ✅ الكود يتصل بـ `(default)` (قاعدة أصلية، Native) مع كاش محلي 100MB.
- ❌ **القاعدة غير موجودة بعد** (فحص مباشر: `404 — does not exist`).
- ✅ قواعد الأمان جاهزة ومفصولة بوضوح للنشر اليدوي — **لم تُنشر ولن أدّعي ذلك**:
  - `android/firebase-migration/firestore.rules` (مطابق بايت-ببايت لقواعد الجذر: `b9d8d0cd…`)، `firestore.indexes.json` (فهرسا `notifications userId+at` و`posts authorId+createdAt`)، و`firebase.json` يستهدف `(default)`.
  - القواعد صارمة: لا `allow read, write: if true`، والكتابة محمية بالملكية/العضوية، مع سقف اقتصاد البداية عند إنشاء المستخدم.
- ملاحظة أمنية قائمة (خطر موثّق مقبول): وثائق `users` قابلة للقراءة العامة وتشمل البريد — يُنصح بنقله لمستند خاص لاحقًا.

## 7) حالة FCM

- ✅ الكود سليم بالكامل: خدمة الاستقبال، حفظ التوكن، 4 قنوات، احترام الإعدادات والمحادثات المكتومة وكتم الإشعارات على الشاشة المفتوحة.
- ✅ روابط التنقّل (deep links) سليمة: `animeblack://` وروابط الويب `/?go=` مع تحقق من المعرّفات.
- ✅ لا خطوة Console للتوكِنات (تُمنح تلقائيًا من المشروع الجديد).
- ⚠️ وصول إشعارات الدردشة/المجموعات يعتمد على نشر الدوال في المشروع الجديد (Blaze) — نفس الدوال الموجودة، بلا كود سيرفر جديد.

## 8) حالة Storage

- 🚫 **لم يُفعَّل ولم يُعدَّل** — التزامًا بعدم ترخيص الفاتورة. `android/firebase-migration/storage.rules` جاهزة (`5a956eb9…`) وغير منشورة.
- ⚠️ الأثر المتوقع: رفع الوسائط يفشل ويُحفظ في قائمة إعادة المحاولة (يظهر في: الإعدادات ← تشخيص المزامنة)؛ الميزات النصية تعمل.
- عند رغبتك لاحقًا: تفعيل Storage (Blaze) ثم `firebase deploy --only storage --project animeblackapp-b6223`.

## 9) حالة البناء والاختبار

- ✅ **CI نجح ثلاث مرات** (بناء debug + APK موقّع بمفتاح التصحيح + 41 اختبار وحدة).
- ✅ **تحقق محلي اليوم:** بناء الدوال `npm install && npm run build` (tsc) نجح — ووظيفة CI مخصّصة للدوال تنفّذ نفس الأمر.
- ✅ فاحصا المشروع عندي: `kt_lint.py` → `OK (194 ملفًا)`، `res_lint.py` → `OK`.
- ⚠️ **لا بناء أندرويد محلي** في بيئتي: لا JDK ولا Android SDK، والشبكة تحجب مستودعات Gradle — التحقق من بناء التطبيق = CI فقط.
- ⚠️ **MANUAL VERIFICATION REQUIRED:** تشغيل التطبيق على جهاز/محاكي والتحقق من الدخول وFirestore والإشعارات ورفع الوسائط.

## 10) خطوات Console اليدوية (بالترتيب)

1. **إنشاء Firestore:** Console ← Firestore Database ← Create database ← **Native** ← **Production mode** ← القاعدة `(default)` في مشروع `animeblackapp-b6223`.
2. **تفعيل المزوّدين:** Authentication ← Sign-in method: **Google** + **Email/Password** + **Anonymous**.
3. **تسجيل البصمات:** Project settings ← تطبيق `com.animeblack.app` ← Add fingerprint: SHA-1 وSHA-256 من النقطة 5 فقط.
4. **تنزيل `google-services.json` من جديد** (سيحوي `client_type 1`) واستبدال `android/app/google-services.json`، ثم إعادة البناء.
5. **نشر القواعد والفهارس** بعد إنشاء القاعدة: `firebase deploy --only firestore:rules,firestore:indexes --project animeblackapp-b6223` (من مجلد `android/firebase-migration`).
6. **الدوال (Blaze):** الافتراضي أصبح `(default)` ✅ — يكفي `cd functions && npm install && npm run deploy` مع `--project animeblackapp-b6223`. الدوال المطلوبة: `claimDailyReward`, `economyTransfer`, `getChatMediaUrl` + إشعارات الدردشة/المجموعات. (لإعادة نشر دوال مشروع الويب القديم لاحقًا: اضبط `FIRESTORE_DB_ID` على قاعدة ذلك المشروع.)
7. **Storage:** لا شيء الآن (غير مصرّح بالفاتورة). لاحقًا: تفعيل + نشر `storage.rules`.
8. **App Check:** لا تفعّل الإلزام قبل تهيئة المزوّدين؛ للتجربة سجّل «توكن التصحيح» من Logcat.
9. **لا تحذف المشروع القديم** حتى تؤكد عمل النسخة المثبّتة على جهاز حقيقي.

## 11) المخاطر المتبقية

1. دخول Google يفشل (`google-config` / 28444) حتى تُسجَّل البصمات ويُستبدل الملف.
2. رفع الوسائط يفشل ويعيد المحاولة حتى يُفعَّل Storage.
3. المكافأة اليومية وتحويل العملات وإشعارات الدردشة تفشل حتى تُنشر الدوال.
4. الويب والأندرويد على مشروعين مختلفين → بيانات منفصلة (مقصود).
5. `users` قابلة للقراءة العامة بما فيها البريد (خطر موثّق مقبول).
6. لا مفتاح إصدار ولا `versionCode` متقدّم (الحالي `1`) — يهمّ عند النشر على Google Play.
7. لا وصول لي إلى Firebase Console ولا gcloud — تنفيذ الخطوات أعلاه عليك.

## 12) المطلوب منك الآن

- نفّذ خطوات Console (1 → 6) — أهمها إنشاء Firestore وتفعيل المزوّدين وتسجيل البصمات.
- بعد تسجيل البصمات: **أرفق `google-services.json` الجديد** لأستبدله وأتحقق منه (التعديل الوحيد المتبقي في كود الأندرويد).
- أخبرني إن أردت لاحقًا: حذف `index.html.stories_bak`، أو تفعيل Storage، أو **ربط سيرفرك الجديد** (`API_BASE_URL` ← `-Panimeblack.apiBaseUrl` أو `ANIMEBLACK_API_BASEURL` وقت البناء؛ سيرفر الوكيل الذكي: `POST /api/gemini/search-agent`).

---

## حدود التحقق (شفافية)

- المصادر: قراءة الكود ساكنًا، فاحصا المستودع، بناء الدوال محليًا (tsc)، تحليل مفتاح التصحيح بـ OpenSSL، فحوص REST مباشرة على مشروع Firebase، وبيانات CI من GitHub.
- **لم أبنِ تطبيق الأندرويد محليًا** (لا JDK/SDK ولا وصول لمستودعات Gradle) ولم أدخل Console ولم أنشر أي شيء.
- كل بند معلَّم بـ ❌/⚠️ = لم يتحقق بعد ويحتاج تنفيذًا يدويًا منك.
