import { $ } from 'bun';

const targets = ['node_modules', 'package-lock.json', 'bun.lockb', 'bun.lock', 'dist', '.angular'];

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function clean() {
  console.log('🧹 Starting cleanup...');

  for (const target of targets) {
    let attempts = 0;
    while (attempts < 5) {
      try {
        // Use rm -rf from Bun Shell
        // quiet: true suppresses output from the command itself unless it fails
        await $`rm -rf ${target}`.quiet();
        break; // Success
      } catch (error) {
        attempts++;
        if (attempts === 5) {
          console.error(`❌ Failed to delete ${target} after ${attempts} attempts.`);
          console.error(error);
          process.exit(1);
        }
        console.warn(`⚠️  Locked: ${target}. Retrying in 1s... (${attempts}/5)`);
        await delay(1000);
      }
    }
    console.log(`✅ Deleted: ${target}`);
  }

  console.log('✨ Cleaned up successfully!');
}

clean();
