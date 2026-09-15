@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   Building HabitUp Android APK Locally (No Cloud/EAS)
echo ========================================================
echo.

:: 1. Ensure ANDROID_HOME is set
if "%ANDROID_HOME%"=="" (
    set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
)

:: 2. Create virtual drive X: to bypass Windows 260-character path limit
subst X: /d 2>nul
subst X: "%CD%"
if errorlevel 1 (
    echo [INFO] Building directly from current directory...
    set "WORK_DIR=%CD%"
) else (
    set "WORK_DIR=X:"
    echo [INFO] Mapped build directory to X:\ to prevent Windows path limits.
)

:: Ensure local.properties exists
echo sdk.dir=%ANDROID_HOME:\=\\%> "%WORK_DIR%\android\local.properties"

echo [1/2] Compiling Android Release APK with Gradle...
pushd "%WORK_DIR%\android"
call gradlew.bat assembleRelease --no-daemon -x lint -x test
set BUILD_ERR=%ERRORLEVEL%
popd

:: Clean up virtual drive
if "%WORK_DIR%"=="X:" (
    subst X: /d 2>nul
)

if %BUILD_ERR% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Check the Gradle errors above.
    pause
    exit /b %BUILD_ERR%
)

echo.
echo [2/2] Locating APK Output...
mkdir build-output 2>nul
if exist "android\app\build\outputs\apk\release\app-release.apk" (
    copy "android\app\build\outputs\apk\release\app-release.apk" "build-output\HabitUp-release.apk" >nul
    copy "android\app\build\outputs\apk\release\app-release.apk" "HabitUp.apk" >nul
    echo ========================================================
    echo  [SUCCESS] APK Built Successfully!
    echo.
    echo  Location 1: %CD%\build-output\HabitUp-release.apk
    echo  Location 2: %CD%\HabitUp.apk
    echo ========================================================
) else (
    echo [INFO] Check android\app\build\outputs\apk\ for output files.
)

pause
