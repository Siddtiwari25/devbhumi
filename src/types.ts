export interface Vehicle {
  id: string;
  category: string;
  models: string[];
  baseRatePerKm: number;
  seating: string;
  features: string[];
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
}

export interface TourPackage {
  id: string;
  title: string;
  category: string;
  duration: string;
  route: string;
  highlights: string[];
  startingPrice: number;
  rating: number;
  spotsLeft: number;
  image: string;
  description: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  vehicleType: string;
  bookingType: string;
  specialNotes: string;
  estimatedFare: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  driverName?: string;
  driverPhone?: string;
  driverVerified?: boolean;
  createdDate: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
  verifiedTrip?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  route: string;
  activities: string[];
  insiderTip: string;
}

export interface AIItinerary {
  routeName: string;
  totalEstimatedFuelFare: string;
  recommendedVehicle: string;
  geographicalAlerts: string;
  itinerary: ItineraryDay[];
}

export interface AIFareBreakdown {
  route: string;
  distanceKm: number;
  vehicle: string;
  baseFareBreakdown: string;
  hillTaxes: number;
  statePermitTax: number;
  driverAllowance: number;
  estimatedTotalFare: number;
  tripDurationHrs: string;
}
