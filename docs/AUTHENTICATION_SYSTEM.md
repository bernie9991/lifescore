# Authentication System Documentation

## Overview

The LifeScore authentication system provides secure user registration, login, and session management using Supabase as the backend service. The system includes comprehensive error handling, input validation, performance monitoring, and security measures.

## Architecture

### Core Components

1. **useAuth Hook** (`src/hooks/useAuth.ts`)
   - Central authentication state management
   - Handles login, signup, logout operations
   - Manages user session and data loading
   - Provides error handling and loading states

2. **AuthForm Component** (`src/components/auth/AuthForm.tsx`)
   - User interface for login and signup
   - Form validation and user feedback
   - Responsive design with loading states

3. **Database Schema** (`supabase/migrations/`)
   - User profiles and related data tables
   - Row Level Security (RLS) policies
   - Proper indexing for performance

## Features

### Authentication Flow

#### Sign Up Process
1. **Input Validation**
   - Email format validation
   - Password strength requirements (6-128 characters)
   - Name validation (2-100 characters)
   - Real-time form validation

2. **Account Creation**
   - Supabase Auth user creation
   - Session establishment with retry logic
   - Database profile initialization
   - Default badge assignment

3. **Data Initialization**
   - Profile creation with user details
   - Wealth data initialization
   - Knowledge data setup
   - Asset tracking preparation

#### Sign In Process
1. **Credential Validation**
   - Email format checking
   - Password requirements
   - Admin login support

2. **Authentication**
   - Supabase Auth verification
   - Session management
   - User data loading

3. **Session Management**
   - Automatic token refresh
   - Session persistence
   - Logout handling

### Security Features

1. **Input Validation**
   - Email format validation using regex
   - Password length and complexity requirements
   - Name length and character validation
   - SQL injection prevention through parameterized queries

2. **Data Protection**
   - Row Level Security (RLS) on all tables
   - User data isolation
   - Secure password hashing (handled by Supabase)

3. **Error Handling**
   - Comprehensive error categorization
   - User-friendly error messages
   - Security-conscious error disclosure

### Performance Optimizations

1. **Timeout Management**
   - Different timeouts for different operations
   - Auth operations: 15 seconds
   - Database queries: 10 seconds
   - User creation: 20 seconds
   - Session checks: 5 seconds

2. **Parallel Data Loading**
   - Concurrent database queries using Promise.allSettled
   - Graceful handling of partial failures
   - Optimized user data assembly

3. **Caching Strategy**
   - Session persistence
   - User data caching
   - Efficient re-authentication

## Error Handling

### Error Types

```typescript
enum AuthErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR', 
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### Error Messages

- **Invalid Credentials**: "Invalid email or password. Please check your credentials and try again."
- **Timeout**: "Operation timed out. Please check your connection and try again."
- **Existing Account**: "An account with this email already exists. Please try logging in instead."
- **Validation Errors**: Specific field-level validation messages

## Testing

### Test Categories

1. **Login Tests**
   - Valid login scenarios
   - Invalid credential handling
   - Admin login functionality
   - Empty field validation

2. **Signup Tests**
   - Successful account creation
   - Password mismatch handling
   - Existing email detection
   - Input validation

3. **Error Handling Tests**
   - Network timeout scenarios
   - Database connection failures
   - Session expiry handling

4. **Performance Tests**
   - Response time measurements
   - Concurrent user handling
   - Load testing scenarios

5. **Security Tests**
   - SQL injection prevention
   - XSS protection
   - Password security

### Running Tests

```typescript
import { runAllTests } from './src/utils/authTestCases';

// Run all authentication tests
const results = await runAllTests();
console.log(`Tests completed: ${results.passed} passed, ${results.failed} failed`);
```

## Configuration

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Timeout Configuration

```typescript
const TIMEOUT_CONFIG = {
  AUTH_OPERATIONS: 15000,    // 15 seconds for auth operations
  DATABASE_QUERIES: 10000,   // 10 seconds for database queries
  USER_CREATION: 20000,      // 20 seconds for user creation
  SESSION_CHECK: 5000        // 5 seconds for session checks
};
```

## Database Schema

### Tables

1. **profiles** - User profile information
2. **wealth_data** - Financial information
3. **knowledge_data** - Education and skills
4. **assets** - User assets and possessions
5. **user_badges** - Achievement badges
6. **friendships** - Social connections

### Security Policies

All tables implement Row Level Security (RLS) with policies ensuring users can only access their own data while allowing public read access for certain profile information.

## Monitoring and Logging

### Performance Monitoring

```typescript
const startTime = measureAuthPerformance.startTimer();
// ... perform operation
const duration = measureAuthPerformance.endTimer(startTime);
measureAuthPerformance.logPerformance('login', duration);
```

### Error Tracking

```typescript
trackAuthError(error, 'login_attempt');
```

## Best Practices

1. **Always validate input** on both client and server side
2. **Use proper error handling** with user-friendly messages
3. **Implement timeouts** for all network operations
4. **Log errors** for debugging while protecting sensitive information
5. **Test thoroughly** including edge cases and error scenarios
6. **Monitor performance** and optimize slow operations
7. **Keep security updated** with latest best practices

## Troubleshooting

### Common Issues

1. **Timeout Errors**
   - Check network connection
   - Verify Supabase service status
   - Increase timeout values if necessary

2. **Database Errors**
   - Verify RLS policies are correct
   - Check table permissions
   - Ensure proper foreign key relationships

3. **Session Issues**
   - Clear browser storage
   - Check token expiration
   - Verify auth state management

### Debug Mode

Enable debug logging in development:

```typescript
if (import.meta.env.DEV) {
  console.debug('AUTH DEBUG:', message, data);
}
```

## Future Enhancements

1. **Multi-factor Authentication (MFA)**
2. **Social login providers**
3. **Password reset functionality**
4. **Account verification via email**
5. **Advanced session management**
6. **Audit logging**
7. **Rate limiting**
8. **Advanced security headers**