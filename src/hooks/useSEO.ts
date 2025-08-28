import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function useDocumentTitle() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Update document language
    document.documentElement.lang = i18n.language;
    
    // Update document title
    document.title = t('auth:title');
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('auth:subtitle'));
    }
  }, [i18n.language, t]);
}

export function useSEOLocalization(titleKey: string, descriptionKey: string, namespace = 'common') {
  const { t, i18n } = useTranslation(namespace);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = t(titleKey);
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t(descriptionKey));
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    
    if (ogTitle) ogTitle.setAttribute('content', t(titleKey));
    if (ogDescription) ogDescription.setAttribute('content', t(descriptionKey));
    
  }, [i18n.language, t, titleKey, descriptionKey]);
}