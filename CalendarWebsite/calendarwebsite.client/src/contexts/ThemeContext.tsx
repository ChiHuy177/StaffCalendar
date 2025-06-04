import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createContext, useContext, useEffect, useState } from "react";


type ThemeContextType = {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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
                
            },common: {
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
                    root:({theme}) => ({
                        borderRadius: '8px',
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.dark,
                            borderWidth: '2px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.dark
                        }
                    })
                }
            }

        },
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}