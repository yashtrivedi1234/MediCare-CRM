# MediCare - Medical Clinic CRM System

A comprehensive, secure, and scalable medical clinic management system built with React, TypeScript, and Supabase. Designed for clinics, polyclinics, and small hospitals.

## Features

### 🔐 Authentication & Security
- Secure JWT-based authentication with Supabase Auth
- Role-based access control (Admin, Doctor, Nurse, Receptionist, Lab Staff, Patient)
- Protected routes with permission validation
- Encrypted sensitive data in database
- Row-level security (RLS) policies for data protection

### 👥 User Roles & Permissions
- **Admin**: Full system access, analytics, staff management
- **Doctor**: Patient management, appointments, prescriptions, clinical records
- **Nurse**: Patient support, appointment scheduling, clinical documentation
- **Receptionist**: Appointment booking, patient registration, billing
- **Lab Staff**: Lab orders, test results, report verification
- **Patient**: Personal health records, appointments, prescriptions, lab reports

### 🧑‍⚕️ Patient Management
- Comprehensive patient profiles with medical history
- Emergency contact information
- Allergy and chronic condition tracking
- Insurance details management
- Patient MRN (Medical Record Number) generation
- Medical document storage and management

### 📅 Appointment Management
- Online appointment booking
- Doctor availability scheduling
- Queue and token management
- Appointment reminders (Email/SMS/WhatsApp ready)
- OPD/IPD appointment types
- Walk-in and follow-up tracking

### 🩺 Clinical Records
- Doctor consultation notes
- Physical examination records
- Vital signs tracking
- Diagnosis management
- Treatment planning

### 💊 Prescription Management
- Digital prescription generation
- Medicine dosage tracking
- Prescription validity management
- Prescription status tracking (Active, Filled, Completed, Cancelled)
- PDF prescription generation

### 🧪 Laboratory Management
- Lab test order creation
- Sample tracking
- Test result entry
- Report verification workflow
- Abnormality flagging
- Patient and doctor report access

### 💊 Pharmacy Management
- Medicine inventory tracking
- Stock level monitoring with reorder alerts
- Expiry date tracking
- Batch number management
- Medicine pricing and GST calculation

### 💳 Billing & Payments
- Unified billing system for all services
- Consultation, lab, pharmacy, and IPD billing
- Multiple payment methods (Cash, Card, UPI, Bank Transfer, Insurance)
- Invoice generation
- Payment status tracking
- Insurance integration support

### 📊 Analytics & Reporting
- Daily OPD statistics
- Revenue reports and trends
- Doctor performance metrics
- Patient visit analytics
- Department-wise performance tracking

### 📱 Responsive Design
- Mobile-friendly interface
- Tablet optimization
- Desktop-first approach with mobile adaptation
- Touch-friendly buttons and controls

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React Icons
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth with JWT
- **State Management**: React Context API
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Database**: PostgreSQL with Row Level Security

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Header.tsx      # Top navigation header
│   ├── Sidebar.tsx     # Side navigation menu
│   └── ProtectedRoute.tsx  # Route protection HOC
├── context/            # React Context providers
│   └── AuthContext.tsx # Authentication context
├── lib/               # Utility functions
│   └── supabase.ts   # Supabase client setup
├── pages/            # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Patients.tsx
│   ├── Appointments.tsx
│   ├── Doctors.tsx
│   ├── Lab.tsx
│   ├── Pharmacy.tsx
│   ├── Billing.tsx
│   ├── Analytics.tsx
│   ├── Prescriptions.tsx
│   ├── MedicalRecords.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
├── types/            # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main app component with routing
├── main.tsx         # Application entry point
└── index.css        # Global styles

supabase/
├── migrations/      # Database migrations
│   ├── 001_create_core_tables.sql
│   ├── 002_create_appointment_tables.sql
│   ├── 003_create_clinical_records.sql
│   ├── 004_create_lab_tables.sql
│   └── 005_create_pharmacy_billing.sql
└── functions/      # Edge functions (serverless)
```

## Database Schema

### Core Tables
- **users**: Staff members with roles and credentials
- **patients**: Patient profiles with contact and medical info
- **departments**: Hospital departments
- **specializations**: Doctor specializations

### Appointment System
- **doctor_schedules**: Doctor availability
- **appointments**: Patient appointments
- **appointment_reminders**: Reminder tracking

### Clinical Records
- **clinical_records**: Consultation notes
- **diagnoses**: Patient diagnoses
- **prescriptions**: Medicine prescriptions
- **prescription_items**: Individual medicines

### Laboratory
- **lab_test_types**: Available tests
- **lab_orders**: Test orders
- **lab_reports**: Test results

### Pharmacy & Billing
- **medicines**: Medicine inventory
- **medicine_stock**: Stock tracking
- **bills**: Patient invoices
- **bill_items**: Line items
- **medical_documents**: Uploaded documents

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (database already provisioned)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck
```

## Environment Variables

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

The database migrations have been applied automatically. The schema includes:
- 5 major migration files creating all necessary tables
- Row Level Security (RLS) policies for data protection
- Indexes for optimal query performance
- Foreign key constraints for data integrity

## Security Features

### Authentication
- Secure password hashing with bcrypt
- JWT-based session management
- Refresh token rotation
- Session timeout handling

### Authorization
- Role-based access control (RBAC)
- Row Level Security (RLS) on all tables
- Resource-level permissions

### Data Protection
- Encryption for sensitive fields
- Audit logs for critical actions
- Activity tracking
- HIPAA-compliant data handling

### Validation
- Client-side form validation
- Server-side data validation
- SQL injection prevention
- XSS protection through React

## API Endpoints

All API calls are made through Supabase client SDK. No REST API server needed:

- Patient management
- Appointment scheduling
- Clinical records
- Prescription management
- Lab order handling
- Billing operations
- Analytics queries

## User Roles & Features

### Admin Dashboard
- System-wide analytics
- Staff management
- Department management
- Billing overview
- Revenue reports
- System monitoring

### Doctor Dashboard
- My appointments
- Patient list
- Prescription management
- Lab orders
- Clinical records
- Medical history access

### Nurse Dashboard
- Patient management
- Appointment scheduling
- Lab coordination
- Clinical support

### Receptionist Dashboard
- Appointment booking
- Patient registration
- Billing & payments
- Report generation

### Lab Staff Dashboard
- Lab orders
- Test result entry
- Report verification
- Patient reports

### Patient Dashboard
- My appointments
- Medical records
- Prescriptions
- Lab reports
- Billing history

## Testing the System

### Default Credentials
```
Email: admin@clinic.com
Password: password
Role: Admin
```

You can create additional test accounts during registration.

## Development Workflow

1. Create a feature branch
2. Make changes to components and pages
3. Test thoroughly
4. Run `npm run build` to verify
5. Commit changes

## Performance Optimization

- Code splitting with React Router
- Lazy loading of components
- Optimized database queries with indexes
- Caching strategies for API calls
- Minimal bundle size with Tailwind CSS

## Compliance & Regulations

- HIPAA-compliant data handling
- Patient privacy protection
- Secure data transmission (HTTPS)
- Regular security updates
- Audit trail logging

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Authentication Issues
- Check Supabase credentials in `.env`
- Verify email/password combination
- Check browser cookies and storage

### Database Connection
- Verify Supabase URL is correct
- Check network connectivity
- Review RLS policies if data is not visible

### Build Issues
- Clear `node_modules` and reinstall
- Check Node.js version compatibility
- Review TypeScript errors with `npm run typecheck`

## Future Enhancements

- SMS/WhatsApp integration for reminders
- Telemedicine video consultation
- Mobile app (React Native)
- Advanced analytics with charts
- Patient appointment feedback system
- Prescription refill automation
- Insurance claim management
- Electronic health records (EHR) export
- Multi-location support
- Advanced reporting tools

## Support & Contact

For issues or questions, please create an issue in the project repository.

## License

This project is proprietary and intended for medical clinic use.

---

**Version**: 1.0.0
**Last Updated**: 2026-01-06
**Status**: Production Ready
