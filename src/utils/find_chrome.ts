const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')
const newLineRegex = /\r?\n/

function darwin(canary): string {
  const LSREGISTER =
    '/System/Library/Frameworks/CoreServices.framework' +
    '/Versions/A/Frameworks/LaunchServices.framework' +
    '/Versions/A/Support/lsregister'
  const grepexpr = canary ? 'google chrome canary' : 'google chrome'
  const result = childProcess.execSync(
    `${LSREGISTER} -dump  | grep -i '${grepexpr}\\?.app$' | awk '{$1=""; print $0}'`
  )
  const paths = result
    .toString()
    .split(newLineRegex)
    .filter((a) => a)
    .map((a) => a.trim())
  paths.unshift(
    canary ? '/Applications/Google Chrome Canary.app' : '/Applications/Google Chrome.app'
  )
  for (const p of paths) {
    if (p.startsWith('/Volumes')) {
      continue
    }
    const inst = path.join(
      p,
      canary ? '/Contents/MacOS/Google Chrome Canary' : '/Contents/MacOS/Google Chrome'
    )
    if (canAccess(inst)) {
      return inst
    }
  }
  return ''
}

function linux(): string {
  let installations: string[] = []
  const desktopInstallationFolders = [
    path.join(require('os').homedir(), '.local/share/applications/'),
    '/usr/share/applications/'
  ]
  desktopInstallationFolders.forEach((folder) => {
    installations = installations.concat(findChromeExecutables(folder))
  })
  const executables = ['google-chrome-stable', 'google-chrome', 'chromium-browser', 'chromium']
  executables.forEach((executable) => {
    try {
      const chromePath = childProcess
        .execFileSync('which', [executable], { stdio: 'pipe' })
        .toString()
        .split(newLineRegex)[0]
      if (canAccess(chromePath)) {
        installations.push(chromePath)
      }
    } catch (e) {
      // Not installed.
    }
  })
  if (!installations.length) {
    throw new Error(
      'The environment variable CHROME_PATH must be set to executable of a build of Chromium version 54.0 or later.'
    )
  }
  const priorities = [
    { regex: /chrome-wrapper$/, weight: 51 },
    { regex: /google-chrome-stable$/, weight: 50 },
    { regex: /google-chrome$/, weight: 49 },
    { regex: /chromium-browser$/, weight: 48 },
    { regex: /chromium$/, weight: 47 }
  ]
  if (process.env.CHROME_PATH) {
    priorities.unshift({ regex: new RegExp(`${process.env.CHROME_PATH}`), weight: 101 })
  }
  return sort(uniq(installations.filter(Boolean)), priorities)[0]
}

function win32(canary): string {
  const suffix = canary
    ? `${path.sep}Google${path.sep}Chrome SxS${path.sep}Application${path.sep}chrome.exe`
    : `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`
  const prefixes = [
    process.env.LOCALAPPDATA || '',
    process.env.PROGRAMFILES || '',
    process.env['PROGRAMFILES(X86)'] || ''
  ].filter(Boolean)
  let result
  prefixes.forEach((prefix) => {
    const chromePath = path.join(prefix, suffix)
    if (canAccess(chromePath)) {
      result = chromePath
    }
  })
  return result
}

function sort(installations, priorities): string[] {
  const defaultPriority = 10
  return (
    installations
      // assign priorities
      .map((inst) => {
        for (const pair of priorities) {
          if (pair.regex.test(inst)) return { path: inst, weight: pair.weight }
        }
        return { path: inst, weight: defaultPriority }
      })
      // sort based on priorities
      .sort((a, b) => b.weight - a.weight)
      // remove priority flag
      .map((pair) => pair.path)
  )
}

function canAccess(file: string): boolean {
  if (!file) {
    return false
  }
  try {
    fs.accessSync(file)
    return true
  } catch (e) {
    return false
  }
}

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr))
}

function findChromeExecutables(folder: string): string[] {
  const argumentsRegex = /(^[^ ]+).*/ // Take everything up to the first space
  const chromeExecRegex = '^Exec=/.*/(google-chrome|chrome|chromium)-.*'
  const installations: string[] = []
  if (canAccess(folder)) {
    // Output of the grep & print looks like:
    //    /opt/google/chrome/google-chrome --profile-directory
    //    /home/user/Downloads/chrome-linux/chrome-wrapper %U
    let execPaths

    // Some systems do not support grep -R so fallback to -r.
    // See https://github.com/GoogleChrome/chrome-launcher/issues/46 for more context.
    try {
      execPaths = childProcess.execSync(
        `grep -ER "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`
      )
    } catch (e) {
      execPaths = childProcess.execSync(
        `grep -Er "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`
      )
    }
    execPaths = execPaths
      .toString()
      .split(newLineRegex)
      .map((execPath) => execPath.replace(argumentsRegex, '$1'))

    execPaths.forEach((execPath) => canAccess(execPath) && installations.push(execPath))
  }
  return installations
}

/**
 * @return {!Promise<?string>}
 */

/*async function downloadChromium(
  options,
  targetRevision?
): Promise<{ executablePath: string; revision: string }> {
  const browserFetcher = puppeteer.createBrowserFetcher({ path: options.localDataDir })
  const revision =
    targetRevision || require('puppeteer-core/package.json').puppeteer.chromium_revision
  const revisionInfo = browserFetcher.revisionInfo(revision)
  if (revisionInfo.local) {
    return revisionInfo
  }
  // Override current environment proxy settings with npm configuration, if any.
  try {
    console.log(`Downloading Chromium r${revision}...`)
    const newRevisionInfo = await browserFetcher.download(revisionInfo.revision)
    console.log('Chromium downloaded to ' + newRevisionInfo.folderPath)
    let localRevisions = await browserFetcher.localRevisions()
    localRevisions = localRevisions.filter((revision) => revision !== revisionInfo.revision)
    // Remove previous chromium revisions.
    const cleanupOldVersions = localRevisions.map((revision) => browserFetcher.remove(revision))
    await Promise.all(cleanupOldVersions)
    return newRevisionInfo
  } catch (error) {
    console.error(`ERROR: Failed to download Chromium r${revision}!`)
    console.error(error)
    return null
  }
}*/

async function findChrome(options?): Promise<{ executablePath: string; type: string }> {
  if (typeof options !== 'undefined' && options.executablePath) {
    return { executablePath: options.executablePath, type: 'user' }
  }
  const config: Set<string> = new Set(options?.channel || ['stable'])
  let executablePath
  // Always prefer canary.
  if (config.has('canary') || config.has('*')) {
    if (process.platform === 'linux') {
      executablePath = linux()
    } else if (process.platform === 'win32') {
      executablePath = win32(true)
    } else if (process.platform === 'darwin') {
      executablePath = darwin(true)
    }
    if (executablePath) {
      return { executablePath, type: 'canary' }
    }
  }
  if (config.has('stable') || config.has('*')) {
    if (process.platform === 'linux') {
      executablePath = linux()
    } else if (process.platform === 'win32') {
      executablePath = win32(false)
    } else if (process.platform === 'darwin') {
      executablePath = darwin(false)
    }
    if (executablePath) {
      return { executablePath, type: 'stable' }
    }
  }
  /*if (config.has('chromium') || config.has('*')) {
    const revisionInfo = await downloadChromium(options)
    return { executablePath: revisionInfo.executablePath, type: revisionInfo.revision }
  }
  for (const item of config) {
    if (!item.startsWith('r')) {
      continue
    }
    const revisionInfo = await downloadChromium(options, item.substring(1))
    return { executablePath: revisionInfo.executablePath, type: revisionInfo.revision }
  }*/
  return { executablePath: '', type: '' }
}

export default findChrome
