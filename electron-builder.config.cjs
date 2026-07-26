const fs = require('node:fs')
const path = require('node:path')
const { parse } = require('yaml')

const root = __dirname
const baseConfig = parse(fs.readFileSync(path.join(root, 'electron-builder.yml'), 'utf8'))
const brand = require('./src/product/config/brand.json')

module.exports = {
  ...baseConfig,
  appId: brand.appId,
  productName: brand.appName,
  copyright: brand.copyright,
  files: [...baseConfig.files, '!electron-builder.config.cjs'],
  extraMetadata: {
    description: brand.description,
    author: {
      name: brand.companyName
    }
  },
  win: {
    ...baseConfig.win,
    executableName: brand.executableName,
    icon: brand.icon
  },
  nsis: {
    ...baseConfig.nsis,
    artifactName: `${brand.executableName}-\${version}-windows-\${arch}.\${ext}`,
    shortcutName: brand.appName,
    uninstallDisplayName: brand.appName
  },
  publish: null
}
