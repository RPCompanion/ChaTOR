@echo off

REM Deleting the directory if it exists
if exist "chator" rmdir /s /q "chator"

REM Creating the directory
mkdir "chator"

REM Copying the directories and files
xcopy ".\sql" "chator\sql" /E /I

copy ".\ChaTOR.exe" "chator\ChaTOR.exe"
copy ".\swtor_chat_capture.dll" "chator\swtor_chat_capture.dll"
copy ".\blauncher.exe" "chator\blauncher.exe"
copy ".\.itch.toml" "chator\.itch.toml"

REM Check if argument is provided and run butler command
if not "%~1"=="" (
	butler push "%~dp0\chator" dakstrum/"ChaTOR":win-64 --userversion=%1
)

echo Done!
pause
