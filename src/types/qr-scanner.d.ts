// Type declarations to allow importing the minified subpath and vendored build while keeping typings
declare module 'qr-scanner/qr-scanner.min.js' {
  import QrScanner from 'qr-scanner';
  export default QrScanner;
}

declare module '@/lib/vendor/qr-scanner.min.js' {
  import QrScanner from 'qr-scanner';
  export default QrScanner;
}

