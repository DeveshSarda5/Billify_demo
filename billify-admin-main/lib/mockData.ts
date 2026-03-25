// Mock data for products
export interface Product {
  id: number;
  name: string;
  brand: string;
  barcode: string;
  costPrice: number;
  price: number;
  stock: number;
}

export interface Bill {
  id: string;
  customer: string;
  date: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}

export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Apple",
    brand: "Fresh Farms",
    barcode: "1234567890123",
    costPrice: 80,
    price: 120,
    stock: 150,
  },
  {
    id: 2,
    name: "Banana",
    brand: "Tropical Fruits",
    barcode: "1234567890124",
    costPrice: 25,
    price: 45,
    stock: 200,
  },
  {
    id: 3,
    name: "Orange",
    brand: "Citrus Co",
    barcode: "1234567890125",
    costPrice: 60,
    price: 90,
    stock: 120,
  },
  {
    id: 4,
    name: "Milk",
    brand: "Dairy Plus",
    barcode: "1234567890126",
    costPrice: 50,
    price: 80,
    stock: 80,
  },
  {
    id: 5,
    name: "Bread",
    brand: "Bakery Fresh",
    barcode: "1234567890127",
    costPrice: 40,
    price: 60,
    stock: 45,
  },
  {
    id: 6,
    name: "Cheese",
    brand: "Dairy Plus",
    barcode: "1234567890128",
    costPrice: 100,
    price: 150,
    stock: 60,
  },
  {
    id: 7,
    name: "Yogurt",
    brand: "Dairy Plus",
    barcode: "1234567890129",
    costPrice: 70,
    price: 100,
    stock: 95,
  },
  {
    id: 8,
    name: "Coffee",
    brand: "Bean Masters",
    barcode: "1234567890130",
    costPrice: 200,
    price: 280,
    stock: 40,
  },
];

export const mockBills: Bill[] = [
  {
    id: "BILL-001",
    customer: "John Doe",
    date: "2026-03-08 10:30 AM",
    items: [
      { name: "Apple", quantity: 2, price: 120 },
      { name: "Milk", quantity: 1, price: 80 },
    ],
    totalAmount: 320,
  },
  {
    id: "BILL-002",
    customer: "Sarah Smith",
    date: "2026-03-08 11:15 AM",
    items: [
      { name: "Bread", quantity: 1, price: 60 },
      { name: "Cheese", quantity: 2, price: 150 },
    ],
    totalAmount: 360,
  },
  {
    id: "BILL-003",
    customer: "Michael Johnson",
    date: "2026-03-08 12:00 PM",
    items: [
      { name: "Coffee", quantity: 1, price: 280 },
      { name: "Banana", quantity: 3, price: 45 },
      { name: "Yogurt", quantity: 2, price: 100 },
    ],
    totalAmount: 755,
  },
  {
    id: "BILL-004",
    customer: "Emma Wilson",
    date: "2026-03-08 01:45 PM",
    items: [
      { name: "Orange", quantity: 4, price: 90 },
      { name: "Milk", quantity: 1, price: 80 },
    ],
    totalAmount: 440,
  },
  {
    id: "BILL-005",
    customer: "James Brown",
    date: "2026-03-08 02:30 PM",
    items: [
      { name: "Cheese", quantity: 1, price: 150 },
      { name: "Bread", quantity: 2, price: 60 },
      { name: "Coffee", quantity: 1, price: 280 },
    ],
    totalAmount: 590,
  },
];

// Calculate dashboard stats
export function getDashboardStats() {
  const totalProducts = mockProducts.length;
  const totalSalesCount = mockBills.length;
  const totalRevenue = mockBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

  return {
    totalProducts,
    totalSalesCount,
    totalRevenue: totalRevenue.toFixed(2),
  };
}

// Customer data
export interface Customer {
  id: number;
  name: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  lastPurchaseDate: string;
  loyaltyStatus: "Gold" | "Silver" | "Bronze" | "New";
  joinDate: string;
  isReturning: boolean;
}

export const mockCustomers: Customer[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    totalOrders: 25,
    totalSpend: 8500,
    lastPurchaseDate: "2026-03-10",
    loyaltyStatus: "Gold",
    joinDate: "2025-01-15",
    isReturning: true,
  },
  {
    id: 2,
    name: "Sarah Smith",
    email: "sarah@example.com",
    totalOrders: 18,
    totalSpend: 6200,
    lastPurchaseDate: "2026-03-09",
    loyaltyStatus: "Silver",
    joinDate: "2025-02-20",
    isReturning: true,
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael@example.com",
    totalOrders: 45,
    totalSpend: 15800,
    lastPurchaseDate: "2026-03-11",
    loyaltyStatus: "Gold",
    joinDate: "2024-12-01",
    isReturning: true,
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@example.com",
    totalOrders: 8,
    totalSpend: 2400,
    lastPurchaseDate: "2026-03-08",
    loyaltyStatus: "Bronze",
    joinDate: "2025-03-01",
    isReturning: true,
  },
  {
    id: 5,
    name: "James Brown",
    email: "james@example.com",
    totalOrders: 32,
    totalSpend: 11200,
    lastPurchaseDate: "2026-03-07",
    loyaltyStatus: "Silver",
    joinDate: "2025-01-05",
    isReturning: true,
  },
  {
    id: 6,
    name: "Lisa Anderson",
    email: "lisa@example.com",
    totalOrders: 1,
    totalSpend: 890,
    lastPurchaseDate: "2026-03-11",
    loyaltyStatus: "New",
    joinDate: "2026-03-11",
    isReturning: false,
  },
  {
    id: 7,
    name: "Robert Taylor",
    email: "robert@example.com",
    totalOrders: 55,
    totalSpend: 19500,
    lastPurchaseDate: "2026-03-10",
    loyaltyStatus: "Gold",
    joinDate: "2024-11-15",
    isReturning: true,
  },
  {
    id: 8,
    name: "Jennifer Garcia",
    email: "jennifer@example.com",
    totalOrders: 12,
    totalSpend: 4100,
    lastPurchaseDate: "2026-03-06",
    loyaltyStatus: "Bronze",
    joinDate: "2025-02-10",
    isReturning: true,
  },
];

// Customer growth data (monthly)
export const customerGrowthData = [
  { month: "Jan", totalCustomers: 45, newCustomers: 12 },
  { month: "Feb", totalCustomers: 58, newCustomers: 13 },
  { month: "Mar", totalCustomers: 73, newCustomers: 15 },
];

// Customer segmentation data
export const customerSegmentationData = [
  { name: "New Customers", value: 15, color: "#2563eb" },
  { name: "Returning Customers", value: 58, color: "#10b981" },
];

// Offer data
export interface Offer {
  id: number;
  name: string;
  discountType: "percentage" | "fixed" | "bogo";
  discountValue: number;
  applicableProducts: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Expired";
  maxUsage: number;
  currentUsage: number;
}

export const mockOffers: Offer[] = [
  {
    id: 1,
    name: "Spring Sale 2026",
    discountType: "percentage",
    discountValue: 20,
    applicableProducts: "All Products",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    status: "Active",
    maxUsage: 1000,
    currentUsage: 342,
  },
  {
    id: 2,
    name: "Milk Discount",
    discountType: "fixed",
    discountValue: 10,
    applicableProducts: "Milk",
    startDate: "2026-03-10",
    endDate: "2026-03-25",
    status: "Active",
    maxUsage: 500,
    currentUsage: 127,
  },
  {
    id: 3,
    name: "Buy Bread Get Butter Free",
    discountType: "bogo",
    discountValue: 60,
    applicableProducts: "Bread & Butter",
    startDate: "2026-03-15",
    endDate: "2026-04-15",
    status: "Scheduled",
    maxUsage: 2000,
    currentUsage: 0,
  },
  {
    id: 4,
    name: "Coffee Lover Bundle",
    discountType: "percentage",
    discountValue: 15,
    applicableProducts: "Coffee, Sugar",
    startDate: "2026-02-01",
    endDate: "2026-03-10",
    status: "Expired",
    maxUsage: 800,
    currentUsage: 765,
  },
  {
    id: 5,
    name: "Weekend Special",
    discountType: "fixed",
    discountValue: 50,
    applicableProducts: "Groceries",
    startDate: "2026-03-12",
    endDate: "2026-03-14",
    status: "Scheduled",
    maxUsage: 300,
    currentUsage: 0,
  },
];

// Message data
export interface Message {
  id: number;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: "Query" | "Conflict Resolution" | "Feedback" | "Other";
  status: "Unread" | "Read" | "Resolved";
  timestamp: string;
  priority: "High" | "Medium" | "Low";
}

export const mockMessages: Message[] = [
  {
    id: 1,
    userName: "John Doe",
    userEmail: "john@example.com",
    subject: "Issue with recent order",
    message: "I received damaged products in my last order. Please help me with a replacement or refund.",
    category: "Conflict Resolution",
    status: "Unread",
    timestamp: "2026-03-19 10:30 AM",
    priority: "High",
  },
  {
    id: 2,
    userName: "Sarah Smith",
    userEmail: "sarah@example.com",
    subject: "Delivery delay inquiry",
    message: "When will my order be delivered? It was supposed to arrive yesterday.",
    category: "Query",
    status: "Unread",
    timestamp: "2026-03-19 09:15 AM",
    priority: "High",
  },
  {
    id: 3,
    userName: "Michael Johnson",
    userEmail: "michael@example.com",
    subject: "Excellent service!",
    message: "Just wanted to say thank you for the quick delivery and quality products. Keep it up!",
    category: "Feedback",
    status: "Read",
    timestamp: "2026-03-18 02:45 PM",
    priority: "Low",
  },
  {
    id: 4,
    userName: "Emma Wilson",
    userEmail: "emma@example.com",
    subject: "Refund status",
    message: "What is the status of my refund request filed 3 days ago?",
    category: "Query",
    status: "Unread",
    timestamp: "2026-03-19 08:20 AM",
    priority: "Medium",
  },
  {
    id: 5,
    userName: "James Brown",
    userEmail: "james@example.com",
    subject: "Price mismatch",
    message: "The price shown on the app is different from what I was charged. Please explain.",
    category: "Conflict Resolution",
    status: "Read",
    timestamp: "2026-03-17 11:00 AM",
    priority: "High",
  },
  {
    id: 6,
    userName: "Lisa Anderson",
    userEmail: "lisa@example.com",
    subject: "Product availability",
    message: "Are the organic apples back in stock? When will they be available?",
    category: "Query",
    status: "Read",
    timestamp: "2026-03-16 03:30 PM",
    priority: "Low",
  },
  {
    id: 7,
    userName: "Robert Taylor",
    userEmail: "robert@example.com",
    subject: "Bulk order inquiry",
    message: "I need to order 50 units of milk for my cafe. Can you provide a quote?",
    category: "Query",
    status: "Unread",
    timestamp: "2026-03-19 07:45 AM",
    priority: "Medium",
  },
  {
    id: 8,
    userName: "Jennifer Garcia",
    userEmail: "jennifer@example.com",
    subject: "Payment issue",
    message: "I was charged twice for the same order. Please refund the duplicate charge immediately.",
    category: "Conflict Resolution",
    status: "Read",
    timestamp: "2026-03-15 06:20 PM",
    priority: "High",
  },
];
