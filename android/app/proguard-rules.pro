# Anime Black — R8 rules. Libraries (Firebase, Hilt, Compose, Media3, OkHttp, Coil, kotlinx.serialization)
# ship their own consumer rules; Firestore documents are mapped manually (no reflection).

# Keep readable stack traces for Crashlytics.
-keepattributes SourceFile,LineNumberTable,*Annotation*,Signature,InnerClasses,EnclosingMethod
-renamesourcefileattribute SourceFile
