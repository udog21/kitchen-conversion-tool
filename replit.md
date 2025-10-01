# Kitchen Conversion App

## Overview

A mobile-first web application designed to help users convert between different cooking measurements and units. The app features three main conversion types: Imperial ↔ Metric conversions, Volume ↔ Weight conversions, and ingredient substitutions. Built with a focus on utility and ease of use, similar to calculator apps, with an intuitive tabbed interface and interactive wheel-based input controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: TanStack Query for server state management and caching
- **Styling**: Tailwind CSS with custom design system supporting light/dark themes

### Backend Architecture
- **Server**: Express.js with TypeScript
- **API Design**: RESTful endpoints for conversion ratios and ingredient data
- **Development Server**: Vite integration for hot module replacement in development
- **Build Process**: ESBuild for production server bundling

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Five main tables - users, conversion_ratios, ingredients, tab_visits, and conversion_events
- **Storage Interface**: Abstracted storage layer supporting both in-memory (development) and PostgreSQL (production) implementations
- **Migrations**: Drizzle Kit for database schema management

### Analytics System
- **Purpose**: Tracks user interactions for usage insights and conversion patterns
- **Debouncing**: 2.5-second delay prevents event floods while maintaining responsiveness
- **Session Tracking**: Client-generated session IDs (timestamp + random string) track user journeys
- **Tab Visits**: Logged when users switch tabs, includes session context
- **Conversion Events**: Tracks actual conversions with JSONB-stored input/output parameters
- **Implementation**: useAnalytics and useDebouncedConversionTracking React hooks with proper memoization
- **Database Tables**: 
  - `tab_visits`: Stores tab navigation events with session IDs
  - `conversion_events`: Stores conversion operations with JSONB payloads for flexible data capture

### Component Design System
- **Design Philosophy**: Reference-based approach inspired by utility apps like iOS Calculator
- **Interactive Controls**: Custom wheel components for unit selection and fraction input
- **Input Methods**: Decimal keypad for precise numeric entry
- **Tab System**: File folder-style tabs with visual hierarchy
- **Theme Support**: Comprehensive light/dark mode with CSS custom properties
- **Typography**: Inter font family with tabular numbers for conversion displays

### Mobile-First Architecture
- **Responsive Design**: Mobile-optimized with touch-friendly interfaces (minimum 48px touch targets)
- **Viewport Configuration**: Prevents zooming on mobile devices
- **Touch Interactions**: Custom wheel components support both scroll and touch gestures
- **Performance**: Optimized bundle sizes and lazy loading for mobile networks

### Conversion Logic
- **Unit System**: Centralized conversion ratios stored in database with fallback constants
- **Base Units**: Milliliters for volume, grams for weight conversions
- **Ingredient Density**: Database-driven ingredient-specific density values for volume-to-weight conversions
- **Fraction Support**: Built-in fraction parsing and display for cooking measurements

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver for database connectivity
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **@tanstack/react-query**: Server state management and caching
- **express**: Node.js web application framework

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives (accordion, dialog, select, etc.)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Icon library for consistent iconography

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **eslint & prettier**: Code linting and formatting
- **drizzle-kit**: Database schema management and migrations

### Fonts and Assets
- **Google Fonts**: Inter font family loaded via CDN
- **Font variants**: Multiple font families configured (Architects Daughter, DM Sans, Fira Code, Geist Mono)

### Build and Deployment
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development server
- **postcss**: CSS processing with autoprefixer plugin