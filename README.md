# Mini ERP + CRM Operations Portal

A full-stack ERP and CRM operations portal built as a Full Stack Developer case study.

The application provides modules for customer management, product and inventory management, sales challans, follow-ups, authentication, and role-based access control.

## Features

### Authentication & Roles
- JWT-based authentication
- Admin, Sales, Warehouse, and Accounts roles
- Protected backend routes
- Role-based authorization middleware

### Customer CRM
- Add customers
- Edit customer information
- Search customers
- View customer details
- Customer types:
  - Retail
  - Wholesale
  - Distributor
- Customer statuses:
  - Lead
  - Active
  - Inactive
- GST and business information
- Follow-up dates and notes
- Customer follow-up management

### Product & Inventory
- Add products
- Edit products
- View product details
- Delete products
- SKU management
- Category and unit price
- Current stock tracking
- Minimum stock level
- Warehouse/location
- Stock IN and OUT movements
- Stock movement history
- Movement reason and created-by tracking
- Prevention of negative stock

### Sales Challans
- Automatic challan number generation
- Select customer
- Add one or more products
- Specify product quantities
- Save challans as drafts
- Confirm challans
- Cancel challans
- Automatic stock deduction when confirmed
- Insufficient-stock validation
- Product snapshot information in challan items
- Total quantity and status tracking

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- HTML
- CSS

### Backend
- Node.js
- Express.js
- TypeScript
- REST APIs
- JWT authentication

### Database
- PostgreSQL
- Prisma ORM

## Project Structure

```text
ERP-CRM/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── prisma.ts
│   │   └── server.ts
│   ├── prisma7.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md