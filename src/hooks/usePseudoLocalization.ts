import { useTranslation } from 'react-i18next';

export function usePseudoLocalization() {
  const { i18n } = useTranslation();
  
  const enablePseudoLocalization = () => {
    // Add pseudo locale
    i18n.addResourceBundle('pseudo', 'common', {
      // Transform keys to pseudo text for testing
      navigation: {
        overview: '[Øṽéŕṽíéẃ]',
        about: '[Àḅöûẗ]',
        help: '[Ḧéļṗ]',
        manual: '[Màñúàļ]',
        login: '[Ļöğíñ]'
      },
      loading: '[Ļöàðíñğ...]',
      // Add more pseudo translations as needed
    });
    
    i18n.changeLanguage('pseudo');
  };
  
  const disablePseudoLocalization = () => {
    i18n.changeLanguage('es'); // Return to default
  };
  
  return { enablePseudoLocalization, disablePseudoLocalization };
}