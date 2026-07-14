// pnpm hook configuration for security and consistency

module.exports = {
  hooks: {
    readPackage(pkg, context) {
      // Ensure consistent peer dependencies
      if (pkg.name === 'express') {
        pkg.peerDependencies = pkg.peerDependencies || {}
      }
      return pkg
    }
  }
}
