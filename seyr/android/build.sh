#!/usr/bin/env bash
# Seyr APK derleyicisi. Android SDK gerektirmez; araçları Maven Central'dan indirir.
# Kullanım: KEYSTORE=/yol/anahtar.p12 KEYPASS=sifre ./build.sh [cikti.apk]
set -euo pipefail
cd "$(dirname "$0")"; HERE=$PWD; T=${TOOLS:-$HERE/../../fener/android/.tools}; W=$(mktemp -d); OUT=${1:-$HERE/Seyr.apk}
mkdir -p "$T"
if [ ! -x "$T/aapt2" ]; then
  curl -fsSL -o "$T/apktool-lib.jar" https://repo1.maven.org/maven2/org/apktool/apktool-lib/3.0.3/apktool-lib-3.0.3.jar
  (cd "$T" && unzip -o -q -j apktool-lib.jar prebuilt/linux/aapt2 prebuilt/android-framework.jar && chmod +x aapt2)
  cat > "$T/pom.xml" <<P
<project xmlns="http://maven.apache.org/POM/4.0.0"><modelVersion>4.0.0</modelVersion><groupId>x</groupId><artifactId>x</artifactId><version>1</version><dependencies>
<dependency><groupId>org.smali</groupId><artifactId>smali</artifactId><version>2.5.2</version></dependency>
<dependency><groupId>com.android.tools.build</groupId><artifactId>apksig</artifactId><version>2.3.0</version></dependency></dependencies></project>
P
  (cd "$T" && mvn -q dependency:copy-dependencies -DoutputDirectory=lib)
fi
CP="$T/lib/*"
# 1) oyun dosyaları
mkdir -p "$W/assets" && cp ../index.html ../defter.js ../savas.js ../sesler.js "$W/assets/" && cp -r ../assets "$W/assets/assets"
# 2) simge
python3 icon.py "$W/res"
cp -r res/values "$W/res/"
# 3) kaynaklar + manifest
"$T/aapt2" compile --dir "$W/res" -o "$W/res.zip"
"$T/aapt2" link -o "$W/base.apk" -I "$T/android-framework.jar" --manifest AndroidManifest.xml \
  --min-sdk-version 24 --target-sdk-version 34 --version-code ${VCODE:-1} --version-name ${VNAME:-1.0} -A "$W/assets" "$W/res.zip"
# 4) kod
java -cp "$CP" org.jf.smali.Main assemble --api 24 -o "$W/classes.dex" MainActivity.smali
(cd "$W" && zip -q -j base.apk classes.dex)
# 5) hizala + imzala
python3 align.py "$W/base.apk" "$W/aligned.apk"
javac -cp "$CP" -d "$W" Sign.java
java --add-exports java.base/sun.security.x509=ALL-UNNAMED --add-exports java.base/sun.security.pkcs=ALL-UNNAMED --add-exports java.base/sun.security.util=ALL-UNNAMED -cp "$W:$CP" Sign "$W/aligned.apk" "$OUT" "${KEYSTORE:?KEYSTORE gerekli}" "${KEYPASS:?KEYPASS gerekli}"
rm -rf "$W"; echo "✓ $OUT ($(du -h "$OUT"|cut -f1))"
