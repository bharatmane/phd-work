@echo off
set "ROOT=phd-work"

rem Create root folder
mkdir %ROOT%
cd %ROOT%

rem Create main folders and subfolders with .gitkeep
call :CreateFolder docs\papers
call :CreateFolder docs\thesis
call :CreateFolder docs\thesis\chapters
call :CreateFolder docs\presentations

call :CreateFolder src\python
call :CreateFolder src\python\analysis
call :CreateFolder src\python\modeling
call :CreateFolder src\notebooks

call :CreateFolder data\raw
call :CreateFolder data\processed
call :CreateFolder data\external

call :CreateFolder models

call :CreateFolder surveys\questionnaires
call :CreateFolder surveys\responses
call :CreateFolder surveys\analysis

call :CreateFolder experiments\experiment_01
call :CreateFolder experiments\experiment_02

call :CreateFolder references\papers
call :CreateFolder references\notes

call :CreateFolder figures\charts
call :CreateFolder figures\diagrams

call :CreateFolder utils

rem Create base files
echo # PhD Workspace > README.md
echo *.pyc > .gitignore
echo Please add license info here. > LICENSE

echo Folder structure with .gitkeep files created under %ROOT%
goto :eof

:CreateFolder
mkdir %1
echo.>%1\.gitkeep
exit /b
