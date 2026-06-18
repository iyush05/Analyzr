const esbuild = require('esbuild');

const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2018'],
};

// UMD-style IIFE build for <script> tag usage
esbuild.build({
  ...shared,
  outfile: 'dist/tracker.umd.js',
  format: 'iife',
  globalName: 'UserAnalytics',
  footer: {
    js: '// Auto-init if data attributes present\n' +
        'if(typeof document!=="undefined"){' +
        'var s=document.currentScript;' +
        'if(s&&s.dataset.endpoint&&s.dataset.siteid){' +
        'UserAnalytics.init({endpoint:s.dataset.endpoint,siteId:s.dataset.siteid,debug:!!s.dataset.debug});' +
        '}}',
  },
}).then(() => console.log('✅ UMD build complete'));

// ESM build for npm imports
esbuild.build({
  ...shared,
  outfile: 'dist/tracker.esm.js',
  format: 'esm',
}).then(() => console.log('✅ ESM build complete'));

// CommonJS build for Node/Webpack requires
esbuild.build({
  ...shared,
  outfile: 'dist/tracker.cjs.js',
  format: 'cjs',
}).then(() => console.log('✅ CJS build complete'));
