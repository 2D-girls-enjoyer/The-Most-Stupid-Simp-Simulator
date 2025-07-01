import type { ForgeConfig } from '@electron-forge/shared-types';

import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';
import path from 'path';

const getMakers = () => {
  const target = process.env.BUILD_TARGET;
  const makers: any[] = [];

  const addMaker = (makerName: string, createMaker: () => any) => {
    try {
      makers.push(createMaker());
    } catch (error) {
      console.warn(`Could not load ${makerName}:`, error.message);
    }
  };

  switch (target) {
    case 'squirrel':
      addMaker('squirrel', () => {
        const { MakerSquirrel } = require('@electron-forge/maker-squirrel');
        return new MakerSquirrel({
            name: 'TheMostStupidSimpSimulator',
            authors: '2D Girl Enjoyer',
            description: 'Headpat and treat who you simp for',
            exe: 'TheMostStupidSimpSimulator.exe',
            setupIcon: path.resolve(__dirname, 'icons', 'icon.ico'),
            iconUrl: `file://${path.resolve(__dirname, 'icons', 'icon.ico')}`,
            noMsi: true,
            setupExe: 'TheMostStupidSimpSimulatorSetup.exe',
            skipUpdateIcon: false,
        });
      });
      break;

    case 'deb':
      addMaker('deb', () => {
        const { MakerDeb } = require('@electron-forge/maker-deb');
        return new MakerDeb({
          options: {
            name: 'themoststupidsimpsimulator',
            productName: 'TheMostStupidSimpSimulator',
            genericName: 'Simp Simulator',
            description: 'Headpat and treat who you simp for',
            version: '0.0.1',
            section: 'games',
            priority: 'optional',
            maintainer: '2D Girl Enjoyer <anisaucecontents@gmail.com>',
            homepage: 'https://github.com/2D-girls-enjoyer/The-Most-Stupid-Simp-Simulator',
            depends: [
              'libnss3',
              'libgtk-3-0 | libgtk2.0-0',
              'libasound2',
              'libxss1'
            ],
            categories: [
              'Game'
            ],
            mimeType: [],
            bin: 'TheMostStupidSimpSimulator',
            icon: 'icons/icon.png'
          }
        });
      });
      break;

      case 'appimage':
        addMaker('appimage', () => {
          const { MakerAppImage } = require('./custom-maker/MakerAppImage');
          return new MakerAppImage({
            options: {
              name: 'themoststupidsimpsimulator',
              productName: 'TheMostStupidSimpSimulator',
              genericName: 'Simp Simulator',
              description: 'Headpat and treat who you simp for',
              categories: ['Game'],
              icon: 'icons/icon.png',
              bin: 'TheMostStupidSimpSimulator',
              homepage: 'https://github.com/2D-girls-enjoyer/The-Most-Stupid-Simp-Simulator',
              version: '0.0.1',
              appId: 'io.github.2d-girls-enjoyer.TheMostStupidSimpSimulator',
              installSystemIntegration: true
            }
          });
        });
      break;

    case 'flatpak':
      addMaker('flatpak', () => {
        const { MakerFlatpak } = require('@electron-forge/maker-flatpak');
        return new MakerFlatpak({
          options: {
            id: 'io.github._2D_girls_enjoyer.TheMostStupidSimpSimulator',
            bin: '/app/lib/io.github._2D_girls_enjoyer.TheMostStupidSimpSimulator/TheMostStupidSimpSimulator',
            branch: 'stable',
            runtime: 'org.freedesktop.Platform',
            runtimeVersion: '23.08',
            sdk: 'org.freedesktop.Sdk',
            modules: [
              {
                name: 'zypak',
                sources: [
                  {
                    type: 'git',
                    url: 'https://github.com/refi64/zypak',
                    tag: 'v2022.03'
                  }
                ]
              }
            ],
            productName: 'TheMostStupidSimpSimulator',
            description: 'Headpat and treat who you simp for',
            categories: ['Game'],
            finishArgs: [
              '--share=ipc',
              '--share=network',
              '--socket=x11',
              '--socket=wayland',
              '--socket=pulseaudio',
              '--device=dri',
              '--device=all',
              '--filesystem=home',
              '--filesystem=xdg-documents',
              '--filesystem=xdg-pictures:ro',
              '--filesystem=xdg-download',
              '--persist=TheMostStupidSimpSimulator',
              '--talk-name=org.freedesktop.FileManager1',
              '--talk-name=org.freedesktop.portal.FileChooser',
              '--talk-name=org.freedesktop.portal.Desktop',
              '--env=TMPDIR=/var/tmp'
            ],
            files: [
              ['flatpak-assets/io.github._2D_girls_enjoyer.TheMostStupidSimpSimulator.appdata.xml', '/share/metainfo/io.github._2D_girls_enjoyer.TheMostStupidSimpSimulator.appdata.xml'],
              ['icons/icon-512.png', '/share/icons/hicolor/512x512/apps/io.github._2D_girls_enjoyer.TheMostStupidSimpSimulator.png'],
              ['flatpak-assets/io.github._2D_girls_enjoyer.TheMostStupidSimpSimulator.desktop', '/share/applications/io.github._2D_girls_enjoyer.TheMostStupidSimpSimulator.desktop']
            ],
          },
        });
      });
      break;

    case 'darwin':
      addMaker('zip', () => {
        const { MakerZIP } = require('@electron-forge/maker-zip');
        return new MakerZIP({}, ['darwin']);
      });
      break;

    default:
      console.log('No valid maker found');
  }

  return makers;
};

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './icons/icon',
    extraResource: [
      'assets',
      'characters'
    ],
  },
  rebuildConfig: {},
  makers: getMakers(),
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './index.html',
            js: './src/src-electron/renderer.ts',
            name: 'main_window',
            preload: {
              js: './src/src-electron/preload.ts',
            },
          },
        ],
      },
    }),

    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;