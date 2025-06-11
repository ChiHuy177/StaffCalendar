import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeContextType = {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDarkMode: false,
    toggleTheme: () => { }
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const theme = createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
            primary: {
                main: '#ffffff',
                light: '#1E40AF',
                dark: '#1E3A8A',
            },
            background: {
                default: isDarkMode ? '#0F172A' : '#F3F4F6',
                paper: isDarkMode ? '#1E293B' : '#FFFFFF',
            },
            text: {
                primary: isDarkMode ? '#FFFFFF' : '#1F2937',
                secondary: isDarkMode ? '#94A3B8' : '#4B5563',

            }, common: {
                black: isDarkMode ? '#FFFFFF' : '#94A3B8',
            }
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        transition: 'background-color 0.3s ease-in-out',
                    },

                },
            },
            MuiSelect: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : '#2563EB',
                        },
                        '& .MuiSelect-icon': {
                            color: isDarkMode ? 'white' : 'black',
                        }

                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                        transition: 'background-color 0.3s ease-in-out',
                        '&.MuiCard-root': {
                            backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                        },
                        '&.MuiPopover-paper': {
                            backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                        },
                        '&.MuiDialog-paper': {
                            backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                        }
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                        transition: 'background-color 0.3s ease-in-out',
                        color: isDarkMode ? '#FFFFFF' : '#1F2937',
                    },
                },
            },
            MuiAutocomplete: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            color: isDarkMode ? '#1F2937' : '#1F2937',
                            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                        },
                        '& .MuiInputLabel-root': {
                            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                            '&.Mui-focused': {
                                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                            }
                        },

                    }
                }
            },

            MuiOutlinedInput: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        '& .MuiInputLabel-root': {
                            color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                            '&.Mui-focused': {
                                color: theme.palette.primary.dark,
                            },
                        },
                    }),
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: theme.palette.background.paper,
                            '& fieldset': {
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                            },
                            '&:hover fieldset': {
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: theme.palette.primary.dark,
                            },
                        },
                        '& .MuiInputLabel-root': {
                            color: theme.palette.text.primary,
                            '&.Mui-focused': {
                                color: theme.palette.text.primary,
                            },
                        },
                        '& .MuiInputBase-input': {
                            color: theme.palette.text.primary
                        },
                    }),
                },
            },
            MuiRadio: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        '&.Mui-checked': {
                            color: theme.palette.text.primary,
                        },
                        '& .MuiSvgIcon-root': {
                            fontSize: 20,
                        },
                    }),
                },
            },
        },
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return React.createElement(
        MuiThemeProvider,
        { theme },
        React.createElement(
            ThemeContext.Provider,
            { value: { isDarkMode, toggleTheme } },
            React.createElement(CssBaseline),
            children
        )
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}