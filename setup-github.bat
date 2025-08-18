@echo off
echo Setting up GitHub repository for Gina-Therapy-App...
echo.

echo Step 1: Initializing Git repository...
git init

echo.
echo Step 2: Adding all files...
git add .

echo.
echo Step 3: Creating initial commit...
git commit -m "@author: fatima bashir - Initial commit: Gina-Therapy-App - Mental health support application with AI chat, journaling, and mindfulness features"

echo.
echo Step 4: Setting up remote repository...
git branch -M main
git remote add origin https://github.com/Fatima-Bashir/Gina-Therapy-App.git

echo.
echo Step 5: Pushing to GitHub...
git push -u origin main

echo.
echo Success! Your project has been uploaded to GitHub.
echo You can view it at: https://github.com/Fatima-Bashir/Gina-Therapy-App
echo.
pause

