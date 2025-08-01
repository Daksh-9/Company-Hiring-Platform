# Hiring Platform - React Application

A modern, responsive hiring platform built with React JS featuring login and signup functionality with beautiful UI/UX design.

## Features

- 🎨 **Modern Design**: Clean, professional interface with gradient backgrounds and smooth animations
- 📱 **Responsive**: Fully responsive design that works on desktop, tablet, and mobile devices
- 🔐 **Authentication**: Complete login and signup forms with validation
- 🎯 **User Experience**: Intuitive navigation and smooth transitions
- ♿ **Accessibility**: Proper focus states, semantic HTML, and keyboard navigation
- 🚀 **Performance**: Optimized React components with efficient state management

## Pages

1. **Landing Page** (`/`) - Homepage with hero section and feature highlights
2. **Login Page** (`/login`) - User authentication with email/password and social login options
3. **Signup Page** (`/signup`) - User registration with comprehensive form validation

## Technologies Used

- **React 18** - Modern React with hooks and functional components
- **React Router DOM** - Client-side routing
- **Font Awesome** - Beautiful icons throughout the interface
- **CSS3** - Modern styling with gradients, animations, and responsive design

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository** (if using git):
   ```bash
   git clone <repository-url>
   cd hiring-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)

## Project Structure

```
src/
├── components/
│   ├── LandingPage.js      # Homepage component
│   ├── LoginPage.js        # Login form component
│   └── SignupPage.js       # Signup form component
├── App.js                  # Main app component with routing
├── App.css                 # App-specific styles
├── index.js                # Application entry point
└── index.css               # Global styles and component styles
```

## Form Validation

The signup form includes comprehensive validation:

- **Required Fields**: All mandatory fields are validated
- **Email Format**: Proper email format validation
- **Password Strength**: Minimum 6 characters required
- **Password Confirmation**: Passwords must match
- **Terms Agreement**: Users must agree to terms of service
- **Real-time Validation**: Errors clear as users type

## Customization

### Styling
All styles are in `src/index.css`. The design uses a consistent color scheme:
- Primary: `#667eea` to `#764ba2` (gradient)
- Error: `#e74c3c`
- Text: `#333` (dark), `#666` (medium)

### Adding New Pages
1. Create a new component in `src/components/`
2. Add the route in `src/App.js`
3. Import and use the component

### Backend Integration
The forms are currently set up with placeholder API calls. To integrate with a backend:

1. Replace the `setTimeout` calls in form handlers with actual API calls
2. Add proper error handling for API responses
3. Implement authentication state management (e.g., with Context API or Redux)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized bundle size
- Efficient component rendering
- Smooth animations with CSS transitions
- Responsive images and assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support or questions, please open an issue in the repository or contact the development team.

---

**Happy Coding! 🚀** 