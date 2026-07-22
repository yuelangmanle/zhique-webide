#!/bin/bash
export JAVA_HOME=/root/.local/share/mise/installs/java/17.0.2
export ANDROID_HOME=/tmp/android-sdk
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH

cd /workspace/mobile-web-ide/android

echo "Starting build at $(date)" > /tmp/build-debug.log
gradle assembleDebug --no-daemon --stacktrace >> /tmp/build-debug.log 2>&1
echo "Build finished at $(date)" >> /tmp/build-debug.log
echo "Exit code: $?" >> /tmp/build-debug.log
