# Database Schemas

## Users

```typescript
{
  id: string (UUID)
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  name: string (computed: firstName + lastName)
  phone?: string
  role: "user" | "driver" | "admin"
  avatar?: string
  preferences: {
    language: string
    notifications: boolean
    theme: "light" | "dark"
  }
  walletBalance: number (default: 0)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Drivers

```typescript
{
  id: string (UUID)
  userId: string (FK -> Users.id)
  licenseNumber: string (unique)
  status: "active" | "inactive"
  lineId?: string (FK -> Lines.id)
  tier: "Bronze" | "Silver" | "Gold" | "Platinum"
  performanceScore: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Lines

```typescript
{
  id: string (UUID)
  number: string (unique)
  name: string
  color: string (hex)
  schedule: string
  status: "active" | "inactive"
  estimatedDuration: number (minutes)
  distance: number (km)
  price: number
  operatingHours: {
    start: string (HH:MM)
    end: string (HH:MM)
    days: string[]
  }
  frequency: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Stations

```typescript
{
  id: string (UUID)
  name: string
  coordinates: [number, number] (lat, lng)
  address: string
  type: "station" | "stop" | "terminal"
  facilities: string[]
  platform?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

## LineStations (Junction Table)

```typescript
{
  id: string (UUID)
  lineId: string (FK -> Lines.id)
  stationId: string (FK -> Stations.id)
  order: number
  estimatedArrival?: string (HH:MM)
  createdAt: timestamp
}
```

## Vehicles

```typescript
{
  id: string (UUID)
  number: string (unique)
  type: string
  capacity: number
  features: string[]
  status: "available" | "assigned" | "maintenance"
  assignedDriverId?: string (FK -> Drivers.id)
  assignedLineId?: string (FK -> Lines.id)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Trips

```typescript
{
  id: string (UUID)
  lineId: string (FK -> Lines.id)
  vehicleId: string (FK -> Vehicles.id)
  driverId: string (FK -> Drivers.id)
  date: date
  scheduledStartTime: timestamp
  scheduledEndTime: timestamp
  actualStartTime?: timestamp
  actualEndTime?: timestamp
  status: "scheduled" | "boarding" | "in-transit" | "completed" | "cancelled"
  delay: number (minutes, default: 0)
  passengerCount: number (default: 0)
  distance: number (km)
  duration: number (minutes)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## TripStations (Junction Table)

```typescript
{
  id: string (UUID)
  tripId: string (FK -> Trips.id)
  stationId: string (FK -> Stations.id)
  order: number
  scheduledArrival: timestamp
  scheduledDeparture: timestamp
  actualArrival?: timestamp
  actualDeparture?: timestamp
  delay: number (minutes, default: 0)
  passengerCount: number
  createdAt: timestamp
}
```

## Bookings

```typescript
{
  id: string (UUID)
  userId: string (FK -> Users.id)
  tripId: string (FK -> Trips.id)
  date: date
  passengers: number
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled"
  expiresAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Tickets

```typescript
{
  id: string (UUID)
  bookingId: string (FK -> Bookings.id)
  bookingReference: string (unique)
  userId: string (FK -> Users.id)
  tripId: string (FK -> Trips.id)
  departureStation: string
  arrivalStation: string
  departureTime: timestamp
  arrivalTime: timestamp
  date: date
  price: number
  passengers: number
  qrCodeUrl: string
  qrCodeData: string
  qrCodeExpiresAt?: timestamp
  exchangesRemaining: number (default: 1)
  status: "active" | "exchanged" | "used" | "cancelled"
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Payments

```typescript
{
  id: string (UUID)
  bookingId: string (FK -> Bookings.id)
  userId: string (FK -> Users.id)
  amount: number
  paymentMethod: "card" | "mobile" | "bank" | "wallet"
  paymentDetails: {
    cardNumber?: string (last 4 digits only)
    cardName?: string
    phoneNumber?: string
    provider?: "orange" | "inwi" | "iam"
    bankAccount?: string
  }
  status: "pending" | "completed" | "failed" | "refunded"
  paymentIntentId?: string
  transactionId?: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Incidents

```typescript
{
  id: string (UUID)
  tripId: string (FK -> Trips.id)
  driverId: string (FK -> Drivers.id)
  reportedBy: string (FK -> Users.id)
  type: "mechanical" | "accident" | "passenger" | "traffic" | "other"
  description: string
  location: {
    coordinates: [number, number]
    address: string
  }
  priority: "low" | "medium" | "high"
  status: "open" | "investigating" | "resolved"
  adminNotes?: string
  assignedTo?: string (FK -> Users.id, admin)
  resolvedAt?: timestamp
  attachments: string[] (URLs)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Subscriptions

```typescript
{
  id: string (UUID)
  userId: string (FK -> Users.id)
  planId: string (FK -> SubscriptionPlans.id)
  status: "active" | "cancelled" | "expired"
  startDate: date
  endDate: date
  nextBillingDate?: date
  autoRenew: boolean (default: true)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## SubscriptionPlans

```typescript
{
  id: string (UUID)
  name: string
  price: number
  currency: "USD" | "DH"
  period: "month" | "year"
  features: string[]
  popular: boolean (default: false)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## UserSearches

```typescript
{
  id: string (UUID)
  userId: string (FK -> Users.id)
  from: string
  to: string
  fromCoords: [number, number]
  toCoords: [number, number]
  date: date
  searchedAt: timestamp
}
```

## UserLocations

```typescript
{
  id: string (UUID)
  userId: string (FK -> Users.id)
  type: "home" | "work" | "favorite"
  name: string
  coordinates: [number, number]
  address: string
  createdAt: timestamp
  updatedAt: timestamp
}
```

## Telemetry

```typescript
{
  id: string (UUID)
  tripId: string (FK -> Trips.id)
  vehicleId: string (FK -> Vehicles.id)
  coordinates: [number, number]
  speed: number (km/h)
  heading: number (degrees)
  fuelLevel: number (percentage)
  engineStatus: "Good" | "Warning" | "Critical"
  temperature: number (celsius)
  timestamp: timestamp
}
```

## Locations (Search Cache)

```typescript
{
  id: string (UUID)
  name: string
  type: "station" | "landmark" | "address"
  coordinates: [number, number]
  address: string
  searchCount: number (default: 0)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## ExchangeHistory

```typescript
{
  id: string (UUID)
  ticketId: string (FK -> Tickets.id)
  originalTripId: string (FK -> Trips.id)
  newTripId: string (FK -> Trips.id)
  exchangedAt: timestamp
}
```

## TicketValidations

```typescript
{
  id: string (UUID)
  ticketId: string (FK -> Tickets.id)
  validatedAt: timestamp
  validatedBy?: string (FK -> Users.id, driver/admin)
  location?: {
    coordinates: [number, number]
    address: string
  }
  valid: boolean
  reason?: string
}
```

## Notes

- All timestamps are in ISO 8601 format
- All monetary values are in DH (Moroccan Dirham) unless specified
- Coordinates are stored as [latitude, longitude]
- Foreign keys use UUID format
- Soft deletes recommended for Users, Drivers, Lines (use status field)
- Indexes recommended on: email, bookingReference, tripId, userId, driverId, lineId, status fields

