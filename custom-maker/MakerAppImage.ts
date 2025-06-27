// makers/MakerAppImage.ts
import { MakerBase, MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import * as path from 'path';
import * as fs from 'fs-extra';
import { execSync } from 'child_process';

export interface MakerAppImageConfig {
  options?: {
    name?: string;
    productName?: string;
    genericName?: string;
    description?: string;
    categories?: string[];
    icon?: string;
    bin?: string;
    homepage?: string;
    version?: string;
  };
}

export class MakerAppImage extends MakerBase<MakerAppImageConfig> {
  name = 'appimage';
  defaultPlatforms: ForgePlatform[] = ['linux'];

  isSupportedOnCurrentPlatform(): boolean {
    return process.platform === 'linux';
  }

  async make({
    dir,
    makeDir,
    targetArch,
    packageJSON,
  }: MakerOptions): Promise<string[]> {
    const { options = {} } = this.config;

    const appName = options.name || packageJSON.name;
    const productName = options.productName || packageJSON.productName || appName;
    const version = options.version || packageJSON.version;
    const description = options.description || packageJSON.description;
    const homepage = options.homepage || packageJSON.homepage;
    const binName = options.bin || appName;

    // Create appimage directory structure similar to other forge makers
    const appImageDir = path.join(makeDir, 'appimage');
    await fs.ensureDir(appImageDir);

    const appImageName = `${productName}-${version}-${targetArch}.AppImage`;
    const appImagePath = path.join(appImageDir, appImageName);

    // Create AppDir structure in a temporary location
    const tempDir = path.join(makeDir, 'temp');
    const appDir = path.join(tempDir, `${productName}.AppDir`);
    await fs.ensureDir(appDir);
    await fs.ensureDir(path.join(appDir, 'usr', 'bin'));
    await fs.ensureDir(path.join(appDir, 'usr', 'lib'));
    await fs.ensureDir(path.join(appDir, 'usr', 'share', 'applications'));
    await fs.ensureDir(path.join(appDir, 'usr', 'share', 'icons', 'hicolor', '256x256', 'apps'));

    // Copy application files
    await fs.copy(dir, path.join(appDir, 'usr', 'lib', appName));

    // Copy icon to the location where createWindow expects it
    if (options.icon) {
      const iconPath = path.resolve(options.icon);
      if (await fs.pathExists(iconPath)) {
        // Ensure icons directory exists in the app directory
        const appIconsDir = path.join(appDir, 'usr', 'lib', appName, 'icons');
        await fs.ensureDir(appIconsDir);

        // Copy icon to where createWindow expects it (./icons/icon.png relative to app directory)
        await fs.copy(iconPath, path.join(appIconsDir, 'icon.png'));

        // Also copy for AppImage structure
        await fs.copy(iconPath, path.join(appDir, `${appName}.png`));
        await fs.copy(iconPath, path.join(appDir, 'usr', 'share', 'icons', 'hicolor', '256x256', 'apps', `${appName}.png`));
      }
    }

    // Create AppRun script
    const appRunContent = `#!/bin/bash
    SELF=$(readlink -f "$0")
    HERE=\${SELF%/*}
    export PATH="\${HERE}/usr/bin/:\${PATH}"
    export LD_LIBRARY_PATH="\${HERE}/usr/lib/:\${LD_LIBRARY_PATH}"
    cd "\${HERE}/usr/lib/${appName}"
    exec "./${binName}" "$@"`;

    await fs.writeFile(path.join(appDir, 'AppRun'), appRunContent);
    await fs.chmod(path.join(appDir, 'AppRun'), 0o755);

    // Create desktop file
    const desktopContent = `[Desktop Entry]
    Name=${productName}
    Exec=${binName}
    Icon=${appName}
    Type=Application
    Categories=${(options.categories || ['Utility']).join(';')};
    Comment=${description || ''}
    GenericName=${options.genericName || productName}
    StartupNotify=true${homepage ? `\nX-AppImage-Homepage=${homepage}` : ''}`;

    await fs.writeFile(
      path.join(appDir, `${appName}.desktop`),
      desktopContent
    );

    await fs.writeFile(
      path.join(appDir, 'usr', 'share', 'applications', `${appName}.desktop`),
      desktopContent
    );

    // Download appimagetool if not exists
    const toolsDir = path.join(process.cwd(), '.appimage-tools');
    const appimagetoolPath = path.join(toolsDir, 'appimagetool');

    if (!await fs.pathExists(appimagetoolPath)) {
      await fs.ensureDir(toolsDir);
      console.log('Downloading appimagetool...');

      const downloadUrl = targetArch === 'ia32'
        ? 'https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-i686.AppImage'
        : 'https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage';

      try {
        execSync(`wget -O "${appimagetoolPath}" "${downloadUrl}"`);
        await fs.chmod(appimagetoolPath, 0o755);
      } catch (error) {
        throw new Error(`Failed to download appimagetool: ${error.message}`);
      }
    }

    // Create AppImage
    console.log(`Creating AppImage: ${appImageName}`);
    try {
      execSync(`"${appimagetoolPath}" "${appDir}" "${appImagePath}"`, {
        stdio: 'inherit',
        env: { ...process.env, ARCH: targetArch === 'ia32' ? 'i386' : 'x86_64' }
      });
    } catch (error) {
      throw new Error(`Failed to create AppImage: ${error.message}`);
    }

    // Clean up temporary files
    await fs.remove(tempDir);

    return [appImagePath];
  }
}