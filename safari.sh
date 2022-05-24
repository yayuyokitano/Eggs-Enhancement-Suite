rm -r build/safari
npm run build:firefox
mkdir -p -- build/chrome
mkdir build/safari
cd build/safari
xcrun safari-web-extension-converter ../firefox --no-open
xcodebuild -workspace "./Eggs Enhancement Suite/Eggs Enhancement Suite.xcodeproj/project.xcworkspace" -scheme "Eggs Enhancement Suite (macOS)" build
