import React from 'react';
import { Button, Menu, MenuItem, Avatar } from '@mui/material';
import i18n from '../i18n';

const languages = [
  { code: 'en', label: 'English', flag: '/united-states.png' },
  { code: 'vi', label: 'Tiếng Việt', flag: '/vietnam.png' },
];

const LanguageSwitcherButton: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [currentLang, setCurrentLang] = React.useState<string>(() => {
    return localStorage.getItem('language') || i18n.language || 'en';
  });

  React.useEffect(() => {
    i18n.changeLanguage(currentLang);
    localStorage.setItem('language', currentLang);
  }, [currentLang]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    handleMenuClose();
  };

  const currentLangObj = languages.find(lang => lang.code === currentLang);

  return (
    <>
      <Button
        onClick={handleMenuOpen}
        className="bg-[#0D2463] hover:bg-[#0D2463] cursor-pointer p-1"
      >
        <Avatar
          src={currentLangObj?.flag}
          alt={currentLangObj?.label}
          sx={{ width: 32, height: 32 }}
        />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {languages.map(lang => (
          <MenuItem
            key={lang.code}
            selected={lang.code === currentLang}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <Avatar src={lang.flag} alt={lang.label} sx={{ width: 24, height: 24, marginRight: 1 }} />
            {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcherButton;
