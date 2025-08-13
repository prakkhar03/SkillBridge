# SkillBridge Frontend

A React-based frontend application for the SkillBridge platform, built with Vite and Tailwind CSS.

## Features

### 🎨 **UI Components**
- **Responsive Navbar**: Custom navigation with hamburger menu and overlay
- **Authentication Forms**: Registration and login forms with validation
- **Modern Design**: Clean, responsive design using Tailwind CSS
- **Color Theme**: Consistent color scheme (#DFE0E2, #B8BCC3, #787A84)

### 🔐 **Authentication System**
- **User Registration**: Email, password, role selection (freelancer/client)
- **User Login**: Secure authentication with JWT tokens
- **Form Validation**: Client-side validation with error handling
- **Token Management**: Automatic JWT storage and management
- **Context API**: Global authentication state management

### 🚀 **Technical Stack**
- **React 19**: Latest React with hooks and modern patterns
- **Vite**: Fast build tool and development server
- **Tailwind CSS 4**: Utility-first CSS framework
- **JWT Authentication**: Secure token-based authentication
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
cd frontend
npm install
npm install react-icons
```

### Development
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthContainer.jsx    # Authentication container
│   ├── LoginForm.jsx        # Login form component
│   ├── RegisterForm.jsx     # Registration form component
│   └── ...
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication context
├── services/           # API services
│   └── api.js         # Backend API integration
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## Authentication Flow

### 1. **Registration**
- User fills out registration form
- Form validates email, password, and role
- Backend creates user account
- Verification email sent (if configured)
- JWT tokens stored locally

### 2. **Login**
- User enters email and password
- Backend validates credentials
- JWT tokens issued and stored
- User redirected to dashboard/profile

### 3. **Token Management**
- Access tokens stored in localStorage
- Automatic token inclusion in API requests
- Token refresh handling (to be implemented)
- Secure logout with token cleanup

## API Integration

The frontend connects to the Django backend at `http://localhost:8000/api/`:

- **POST** `/accounts/register/` - User registration
- **POST** `/accounts/login/` - User authentication
- **POST** `/accounts/logout/` - User logout
- **GET** `/accounts/profile/` - Get user profile
- **PUT/PATCH** `/accounts/profile/update/` - Update profile

## Customization

### Colors
Update the color scheme in components:
```javascript
const colors = {
  background: '#DFE0E2',
  muted: '#B8BCC3',
  accent: '#787A84',
};
```

### Styling
- Uses Tailwind CSS utility classes
- Custom CSS in `src/index.css`
- Responsive breakpoints: `sm:`, `md:`, `lg:`

## Development Notes

- **Form Validation**: Client-side validation with real-time error clearing
- **Loading States**: Proper loading indicators during API calls
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA labels and semantic HTML

## Next Steps

1. **Profile Management**: Build profile setup and editing forms
2. **Dashboard**: Create user dashboard after authentication
3. **Email Verification**: Implement verification flow
4. **Protected Routes**: Add route protection for authenticated users
5. **Token Refresh**: Implement automatic token refresh logic

## Contributing

1. Follow the existing code structure
2. Use consistent naming conventions
3. Add proper error handling
4. Test on multiple devices/screen sizes
5. Update documentation as needed
