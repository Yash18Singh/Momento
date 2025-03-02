const Colors = {
    // Primary & Secondary Colors
    primary: '#FF6F61', // Coral (Quirky and vibrant)
    secondary: '#6B5B95', // Muted Purple (Modern and balanced)
    
    // Backgrounds
    background: '#fdffe7', // White
    secondaryBackground: '#F5E2A9', // Light Beige
    cardBackground: '#F9F9F9', // Light Gray
    
    // Text Colors
    textPrimary: '#1C1C1E', // Dark Gray
    textSecondary: '#636366', // Medium Gray
    textTertiary: '#8E8E93', // Light Gray (for less important text)
    
    // Borders & Dividers
    border: '#E5E5EA', // Light Gray
    borderDark: '#D1D1D6', // Slightly darker border
    
    // Status & Feedback Colors
    error: '#FF3B30', // Red (Danger)
    success: '#34C759', // Green (Success)
    warning: '#FFCC00', // Yellow (Warning)
    info: '#007AFF', // Blue (Informational)
    
    // Interactive Elements
    like: '#FF2D55', // Pink (Heart reactions)
    notificationDot: '#FF9500', // Orange (Unread notifications)
    link: '#007AFF', // Blue (Links)
    
    // Quirky Accent Colors
    quirky1: '#FF6F61', // Coral
    quirky2: '#6B5B95', // Muted Purple
    quirky3: '#88B04B', // Sage Green
    quirky4: '#FFD662', // Bright Yellow
    quirky5: '#92A8D1', // Soft Blue
};
export default Colors;

export const QuirkyColors = [
    '#FFB6C1', // Light Pink (Soft and playful)
    '#FFD1DC', // Pastel Pink (Subtle and fun)
    '#FFA07A', // Light Salmon (Warm and quirky)
    '#FFDAB9', // Peach (Soft and inviting)
    '#87CEEB', // Sky Blue (Calm and light)
    '#B0E0E6', // Powder Blue (Subtle and fresh)
    '#DDA0DD', // Plum (Soft and vibrant)
    '#E6E6FA', // Lavender (Light and quirky)
    '#98FB98', // Pale Green (Earthy and fresh)
    '#AFEEEE', // Pale Turquoise (Calm and modern)
    '#F0E68C', // Khaki (Soft and quirky)
    '#FFE4B5', // Moccasin (Warm and light)
    '#ff9494',
    '#fffb9a',
    '#b7fa6a',
    '#7aff8c',
    '#7cffe3',
    '#9fdcff',
    '#bbbeff',
    '#e1b9ff',
    '#ffabee',
    'rgb(249, 249, 249)',
    'rgb(177, 255, 158)',
    'rgb(147, 255, 192)',
    'rgba(0, 247, 255, 0.53)'
];

export const getRandomQuirkyColor = () => {
    return QuirkyColors[Math.floor(Math.random() * QuirkyColors.length)];
};