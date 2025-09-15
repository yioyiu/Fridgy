const fs = require('fs');
const path = require('path');

function readJson(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
}

function writeJson(filePath, data) {
    const json = JSON.stringify(data, null, 2) + '\n';
    fs.writeFileSync(filePath, json, 'utf8');
}

function incrementBuildNumberString(value) {
    // iOS buildNumber must be a string, but often numeric; increment numeric parts.
    if (value == null || value === '') return '1';
    const num = Number(value);
    if (Number.isFinite(num)) return String(num + 1);
    // If non-numeric (e.g., "1.0.1(5)"), fallback: append timestamp suffix
    const ts = Date.now().toString().slice(-6);
    return `${value}-${ts}`;
}

function main() {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    if (!fs.existsSync(appJsonPath)) {
        console.error('app.json not found');
        process.exit(1);
    }

    const appJson = readJson(appJsonPath);
    if (!appJson.expo) {
        console.error('Invalid app.json: missing expo root');
        process.exit(1);
    }

    appJson.expo.ios = appJson.expo.ios || {};
    const prev = appJson.expo.ios.buildNumber;
    const next = incrementBuildNumberString(prev);
    appJson.expo.ios.buildNumber = next;

    writeJson(appJsonPath, appJson);
    console.log(`iOS buildNumber bumped: ${prev ?? '(none)'} -> ${next}`);
}

main();


