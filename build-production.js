const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// Helper function to log with color
const log = (message, color = '') => {
  console.log(`${color}${message}${colors.reset}`);
};

// Helper function to run shell commands
const runCommand = (command, cwd = process.cwd()) => {
  try {
    log(`Running: ${command}`, colors.dim);
    execSync(command, { stdio: 'inherit', cwd });
    return true;
  } catch (error) {
    log(`Error executing command: ${command}`, colors.red);
    log(error.message, colors.red);
    return false;
  }
};

// Main build function
const buildProduction = async () => {
  log('🚀 Starting MsgXone Production Build', colors.bright);
  log('==================================', colors.bright);

  // 1. Check Node.js version
  log('\n🔍 Checking Node.js version...', colors.cyan);
  const nodeVersion = process.versions.node.split('.')[0];
  if (parseInt(nodeVersion) < 18) {
    log(`❌ Node.js 18 or higher is required. Current version: ${process.version}`, colors.red);
    process.exit(1);
  }
  log(`✅ Using Node.js ${process.version}`, colors.green);

  // 2. Install dependencies
  log('\n📦 Installing dependencies...', colors.cyan);
  if (!runCommand('npm ci --production')) {
    log('❌ Failed to install dependencies', colors.red);
    process.exit(1);
  }
  log('✅ Dependencies installed successfully', colors.green);

  // 3. Create production environment file if it doesn't exist
  log('\n⚙️  Checking environment configuration...', colors.cyan);
  const envProdPath = path.join(process.cwd(), '.env.production');
  const envSamplePath = path.join(process.cwd(), 'production.env.example');
  
  if (!fs.existsSync(envProdPath)) {
    if (fs.existsSync(envSamplePath)) {
      fs.copyFileSync(envSamplePath, envProdPath);
      log('ℹ️  Created .env.production from example file', colors.yellow);
      log('⚠️  Please review and update .env.production with your production settings', colors.yellow);
    } else {
      log('❌ Missing .env.production and production.env.example', colors.red);
      process.exit(1);
    }
  } else {
    log('✅ Found existing .env.production', colors.green);
  }

  // 4. Build Next.js application
  log('\n🔨 Building Next.js application...', colors.cyan);
  if (!runCommand('npm run build')) {
    log('❌ Failed to build Next.js application', colors.red);
    process.exit(1);
  }
  log('✅ Next.js application built successfully', colors.green);

  // 5. Build server (if using TypeScript)
  if (fs.existsSync(path.join(process.cwd(), 'tsconfig.server.json'))) {
    log('\n🔨 Building server code...', colors.cyan);
    if (!runCommand('npx tsc --project tsconfig.server.json')) {
      log('❌ Failed to build server code', colors.red);
      process.exit(1);
    }
    log('✅ Server code built successfully', colors.green);
  }

  // 6. Set file permissions
  log('\n🔒 Setting file permissions...', colors.cyan);
  try {
    // Make server files executable
    const serverFiles = ['server.js', 'server/index.mjs', 'server/index.js'];
    serverFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        fs.chmodSync(filePath, '755');
      }
    });
    log('✅ File permissions set', colors.green);
  } catch (error) {
    log(`⚠️  Warning: Failed to set file permissions: ${error.message}`, colors.yellow);
  }

  // 7. Create necessary directories
  log('\n📂 Creating required directories...', colors.cyan);
  const dirs = ['logs', 'public/uploads'];
  dirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`✅ Created directory: ${dir}`, colors.green);
    }
  });

  // 8. Generate build info
  const buildInfo = {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: execSync('npm -v').toString().trim(),
    gitCommit: execSync('git rev-parse HEAD').toString().trim(),
    gitBranch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), 'build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );

  // 9. Display next steps
  log('\n✨ Build completed successfully!', colors.bright + colors.green);
  log('\nNext steps:', colors.cyan);
  log('1. Review your .env.production configuration', colors.cyan);
  log('2. Start the production server with:', colors.cyan);
  log('   npm run start:prod', colors.bright);
  log('\nOr deploy using PM2:', colors.cyan);
  log('   npm install -g pm2', colors.bright);
  log('   pm2 start ecosystem.config.js', colors.bright);
  log('   pm2 save', colors.bright);
  log('   pm2 startup', colors.bright);
  log('\nFor more details, see DEPLOYMENT.md', colors.dim);
};

// Run the build process
buildProduction().catch(error => {
  log(`\n❌ Build failed: ${error.message}`, colors.red);
  process.exit(1);
});
