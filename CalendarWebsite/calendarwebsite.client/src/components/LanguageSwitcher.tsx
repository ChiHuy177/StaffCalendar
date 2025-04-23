
import React from 'react';
import { Button } from '@mui/material';
import i18n from '../i18n';

const LanguageSwitcherButton: React.FC = () => {
  const [currentLang, setCurrentLang] = React.useState<string>(() => {
    return localStorage.getItem('language') || i18n.language || 'en';
  });

  React.useEffect(() => {
    i18n.changeLanguage(currentLang);            
    localStorage.setItem('language', currentLang); // lưu lựa chọn vào localStorage
  }, [currentLang]);

  const nextLang = currentLang === 'en' ? 'vi' : 'en';
  const flagSrc = nextLang === 'en' ? '/united-states.png' : '/vietnam.png';
  const altText = nextLang === 'en' ? 'English' : 'Tiếng Việt';

  const handleClick = () => {
    setCurrentLang(nextLang);
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-[#0D2463] hover:bg-[#0D2463] cursor-pointer p-1"
    >
      <img src={flagSrc} alt={altText} className="w-8 h-8" />
    </Button>
  );
};

export default LanguageSwitcherButton;
