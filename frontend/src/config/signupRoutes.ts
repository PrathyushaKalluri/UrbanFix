import type { SignupRoutes } from '../types/auth'

export const signupRoutes: SignupRoutes = {
  USER: {
    route: '/signup/user',
    endpoint: '/api/auth/register/user',
    eyebrow: 'Customer signup',
    title: 'Create a user account',
    description: 'Sign up as a customer to raise home service requests and track your bookings.',
    button: 'Create user account',
  },
  EXPERT: {
    route: '/signup/expert',
    endpoint: '/api/auth/register/expert',
    eyebrow: 'Expert signup',
    title: 'Create an expert account',
    description: 'Sign up as a technician to receive jobs and manage service requests.',
    button: 'Create expert account',
  },
}
