# Installation Guide for Allure Reporting

This guide provides step-by-step instructions to install all dependencies needed for Allure visual test reports.

## Prerequisites

- Node.js 20.x installed
- npm or yarn package manager
- PowerShell 7+ (Windows) or Bash (Linux/Mac)

## 1. Install Allure Command-Line Tool

### Option A: NPM Global Installation (Recommended)

```powershell
npm install -g allure-commandline
```

Verify installation:
```powershell
allure --version
```

Should output something like: `2.30.0`

### Option B: Package Manager (Alternative)

**Windows (Scoop):**
```powershell
scoop install allure
```

**macOS (Homebrew):**
```bash
brew install allure
```

**Linux (APT):**
```bash
sudo apt-add-repository ppa:qameta/allure
sudo apt-get update
sudo apt-get install allure
```

## 2. Install Backend (Jest) Dependencies

Navigate to functions directory:
```powershell
cd functions
```

Install jest-allure reporter:
```powershell
npm install --save-dev jest-allure
```

Expected version: `jest-allure@0.1.3` or higher

## 3. Install Frontend (Vitest) Dependencies

Navigate to frontend directory:
```powershell
cd ../frontend
```

Install allure-vitest reporter:
```powershell
npm install --save-dev allure-vitest
```

Expected version: `allure-vitest@3.0.8` or higher

## 4. Install Root-Level Dependencies

Navigate to project root:
```powershell
cd ..
```

Install rimraf for cleanup scripts:
```powershell
npm install --save-dev rimraf
```

## 5. Verify Installations

### Check Node Modules

```powershell
# Backend
ls functions/node_modules/jest-allure

# Frontend
ls frontend/node_modules/allure-vitest
```

### Run Test to Generate Allure Results

```powershell
# Backend tests
cd functions
npm run test:unit

# Frontend tests
cd ../frontend
npm run test:run
```

### Check if Allure Results Were Generated

```powershell
# Should see JSON files in these directories
ls ../allure/allure-results/backend
ls ../allure/allure-results/frontend
```

## 6. Generate First Allure Report

From project root:

```powershell
# Generate report
npm run allure:generate

# Open report in browser
npm run allure:open
```

## Troubleshooting

### Error: `allure: command not found`

**Cause**: Allure CLI not installed globally or not in PATH

**Solution**:
1. Install globally: `npm install -g allure-commandline`
2. Restart terminal to refresh PATH
3. Verify: `allure --version`

### Error: `Cannot find module 'jest-allure'`

**Cause**: jest-allure not installed in functions directory

**Solution**:
```powershell
cd functions
npm install --save-dev jest-allure
```

### Error: `Cannot find module 'allure-vitest/reporter'`

**Cause**: allure-vitest not installed in frontend directory

**Solution**:
```powershell
cd frontend
npm install --save-dev allure-vitest
```

### Error: Allure report is empty

**Cause**: Tests didn't run or reporters not configured correctly

**Solution**:
1. Verify configurations in `jest.config.js` and `vite.config.ts`
2. Run tests manually: `npm run test:unit` (backend) and `npm run test:run` (frontend)
3. Check for JSON files in `allure/allure-results/backend` and `allure/allure-results/frontend`

### Error: `ENOENT: no such file or directory, scandir 'allure/allure-results'`

**Cause**: Directory doesn't exist

**Solution**:
```powershell
mkdir -p allure/allure-results/backend
mkdir -p allure/allure-results/frontend
```

## Package Versions

Ensure these versions or higher are installed:

| Package | Version | Location |
|---------|---------|----------|
| allure-commandline | ^2.30.0 | Global |
| jest-allure | ^0.1.3 | functions/ |
| allure-vitest | ^3.0.8 | frontend/ |
| rimraf | ^6.0.1 | Root |

## Verify Complete Setup

Run this comprehensive check:

```powershell
# 1. Check Allure CLI
allure --version

# 2. Check backend dependencies
cd functions
npm list jest-allure

# 3. Check frontend dependencies
cd ../frontend
npm list allure-vitest

# 4. Run all tests
cd ..
npm run test:all

# 5. Generate report
npm run allure:generate

# 6. Open report
npm run allure:open
```

If all commands succeed, your Allure setup is complete! 🎉

## Next Steps

1. **Configure CI/CD**: The GitHub Actions workflow is already configured in `.github/workflows/ci.yml`
2. **Add Metadata to Tests**: See `allure/README.md` for examples of using `allure.feature()`, `allure.story()`, etc.
3. **Set Up History**: Configure trend tracking by preserving the `history/` folder between runs

## References

- [Allure Documentation](https://docs.qameta.io/allure/)
- [jest-allure NPM](https://www.npmjs.com/package/jest-allure)
- [allure-vitest NPM](https://www.npmjs.com/package/allure-vitest)
- [Allure GitHub](https://github.com/allure-framework)
