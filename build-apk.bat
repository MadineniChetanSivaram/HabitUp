@echo off
echo ========================================================
echo   Building HabitUp Android APK Locally (No Cloud/EAS)
echo ========================================================
echo.

:: Ensure local.properties has Android SDK path
if not exist "android\local.properties" (
    echo sdk.dir=C:\\Users\\%USERNAME%\\AppData\\Local\\Android\\Sdk > android\local.properties
)

echo [1/2] Compiling Android APK with Gradle...
cd android
call gradlew.bat assembleRelease --no-daemon
cd ..

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ? Build failed! Check the Gradle errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Locating APK Output...
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    copy "android\app\build\outputs\apk\release\app-release.apk" "HabitUp-release.apk" >nul
    echo ? APK Build Succeeded!
    echo.
    echo ?? Output File: %CD%\HabitUp-release.apk
    echo.
) else (
    echo ? Build finished. Check android\app\build\outputs\apk\
)

pause
