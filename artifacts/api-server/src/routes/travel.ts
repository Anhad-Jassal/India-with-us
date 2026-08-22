import { Router, type IRouter, type Request } from "express";
import crypto from "node:crypto";
import { pool } from "@workspace/db";
import {
  CreateCustomPlanBody,
  CreateOrderBody,
  GenerateCustomPlanBody,
  ListDestinationsQueryParams,
  ListToursQueryParams,
  LoginBody,
  RegisterBody,
  SendContactMessageBody,
} from "@workspace/api-zod";

type Destination = {
  id: number;
  name: string;
  state: string;
  region: string;
  description: string;
  image: string;
  attractions: string[];
  startingPrice: number;
};
type ItineraryDay = { day: number; title: string; details: string };
type Tour = {
  id: number;
  title: string;
  description: string;
  destinations: string[];
  days: number;
  nights: number;
  price: number;
  style: string;
  image: string;
  rating: number;
  reviews: number;
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  accommodation: string;
  transportation: string;
};
type User = { id: number; name: string; email: string; phone?: string; role: "customer" | "admin" };
type Order = {
  id: number;
  orderNumber: string;
  tourId: number;
  tourTitle: string;
  travelDate: string;
  travelers: number;
  amount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
};
type CustomPlan = {
  id: number;
  destinations: string[];
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  style: string;
  interests: string[];
  accommodation: string;
  transportation: string;
  estimatedBudget: number;
  itinerary: ItineraryDay[];
  status: string;
};

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

const destinations: Destination[] = [
  { id: 1, name: "Jaipur", state: "Rajasthan", region: "West India", description: "Rose-hued palaces, craft markets, and a generous royal welcome.", image: image("photo-1477587458883-47145ed94245"), attractions: ["Amber Fort", "City Palace", "Hawa Mahal"], startingPrice: 12999 },
  { id: 2, name: "Goa", state: "Goa", region: "West India", description: "Slow beach mornings, spice-scented lanes, and golden sunsets.", image: image("photo-1512343879784-a960bf40e7f2"), attractions: ["Palolem Beach", "Old Goa", "Fontainhas"], startingPrice: 14999 },
  { id: 3, name: "Kerala", state: "Kerala", region: "South India", description: "Palm-fringed backwaters and a softer pace of travel.", image: image("photo-1602216056096-3b40cc0c9944"), attractions: ["Alleppey Backwaters", "Munnar", "Fort Kochi"], startingPrice: 18999 },
  { id: 4, name: "Kashmir", state: "Jammu & Kashmir", region: "North India", description: "Mirror lakes, cedar valleys, and mountain air.", image: image("photo-1566837497312-7be4d6e4c1e3"), attractions: ["Dal Lake", "Gulmarg", "Pahalgam"], startingPrice: 22999 },
  { id: 5, name: "Varanasi", state: "Uttar Pradesh", region: "North India", description: "A city of river light, ancient lanes, and living ritual.", image: image("photo-1561361058-c24cecae35ca"), attractions: ["Ganga Aarti", "Sarnath", "Old City Ghats"], startingPrice: 9999 },
  { id: 6, name: "Ladakh", state: "Ladakh", region: "North India", description: "High-altitude roads, clear skies, and vast quiet landscapes.", image: image("photo-1548013146-72479768bada"), attractions: ["Pangong Lake", "Leh Palace", "Nubra Valley"], startingPrice: 24999 },
  { id: 7, name: "Agra", state: "Uttar Pradesh", region: "North India", description: "The Taj at sunrise, riverside walks, and Mughal history.", image: image("photo-1564507592333-c60657eea523"), attractions: ["Taj Mahal", "Agra Fort", "Mehtab Bagh"], startingPrice: 7999 },
  { id: 8, name: "Amritsar", state: "Punjab", region: "North India", description: "Golden serenity, hearty food, and a city with soul.", image: image("photo-1588096344356-9b6f3e2d5c47"), attractions: ["Golden Temple", "Jallianwala Bagh", "Wagah Border"], startingPrice: 8999 },
  { id: 9, name: "Rishikesh", state: "Uttarakhand", region: "North India", description: "River mornings, temple bells, and a little more courage.", image: image("photo-1605649487212-47bdab064df7"), attractions: ["Laxman Jhula", "Ganga Aarti", "River Rafting"], startingPrice: 10999 },
  { id: 10, name: "Darjeeling", state: "West Bengal", region: "East India", description: "Tea-scented hills and sunrise views of Kanchenjunga.", image: image("photo-1548013146-72479768bada"), attractions: ["Tiger Hill", "Toy Train", "Tea Estates"], startingPrice: 15999 },
  { id: 11, name: "Mumbai", state: "Maharashtra", region: "West India", description: "Sea-facing energy, art deco streets, and late-night stories.", image: image("photo-1566552881560-0be862a7c445"), attractions: ["Gateway of India", "Colaba", "Marine Drive"], startingPrice: 11999 },
  { id: 12, name: "Andaman", state: "Andaman & Nicobar Islands", region: "Islands", description: "Clear water, coral gardens, and barefoot island days.", image: image("photo-1518509562904-e7ef99cdcc86"), attractions: ["Radhanagar Beach", "Cellular Jail", "Elephant Beach"], startingPrice: 26999 },
];

const tours: Tour[] = [
  { id: 1, title: "The Golden Triangle, Unhurried", description: "A beautifully paced first taste of north India, from Delhi's old lanes to Jaipur's painted palaces.", destinations: ["Delhi", "Agra", "Jaipur"], days: 7, nights: 6, price: 28999, style: "Cultural", image: image("photo-1548013146-72479768bada"), rating: 4.9, reviews: 128, itinerary: [{ day: 1, title: "Arrive in Delhi", details: "Settle in, then wander through the atmospheric lanes of Old Delhi." }, { day: 2, title: "Delhi, layered", details: "India Gate, Humayun's Tomb, and a sunset walk in Lodhi Garden." }, { day: 3, title: "Agra by golden hour", details: "Drive to Agra and visit the Taj Mahal at sunset." }, { day: 4, title: "On to Jaipur", details: "Travel to the Pink City with a stop at the Abhaneri stepwell." }, { day: 5, title: "Palaces and bazaars", details: "Amber Fort, City Palace, and an evening market walk." }, { day: 6, title: "A royal finale", details: "Hawa Mahal at dawn, block-print studios, and a rooftop dinner." }, { day: 7, title: "Goodbyes", details: "A relaxed breakfast and departure." }], inclusions: ["Boutique stays", "Daily breakfast", "Private air-conditioned car", "Local experiences"], exclusions: ["Flights", "Personal shopping", "Travel insurance"], accommodation: "Handpicked 3 and 4-star boutique hotels", transportation: "Private car with an experienced local driver" },
  { id: 2, title: "Kerala, in a quieter key", description: "Tea hills, warm coastlines, and one dreamy night on the backwaters.", destinations: ["Kochi", "Munnar", "Alleppey"], days: 6, nights: 5, price: 24999, style: "Couple", image: image("photo-1602216056096-3b40cc0c9944"), rating: 4.8, reviews: 94, itinerary: [{ day: 1, title: "Hello, Kochi", details: "Fort Kochi streets, local galleries, and a sunset by the water." }, { day: 2, title: "Into the hills", details: "A scenic drive to Munnar through spice country." }, { day: 3, title: "Munnar slow day", details: "Tea gardens, misty viewpoints, and a cooking experience." }, { day: 4, title: "Down to the water", details: "Transfer to Alleppey and board a private houseboat." }, { day: 5, title: "Backwater morning", details: "Drift past village life before returning to Kochi." }, { day: 6, title: "Depart", details: "A last South Indian breakfast before your flight." }], inclusions: ["Breakfast", "Houseboat stay", "Private transfers", "Spice garden visit"], exclusions: ["Flights", "Lunch and dinner", "Tips"], accommodation: "Heritage stay, hill resort, and private houseboat", transportation: "Private car and houseboat" },
  { id: 3, title: "Kashmir: valleys & still water", description: "A soft adventure through Srinagar, Gulmarg, and Pahalgam.", destinations: ["Srinagar", "Gulmarg", "Pahalgam"], days: 6, nights: 5, price: 31999, style: "Mountains", image: image("photo-1566837497312-7be4d6e4c1e3"), rating: 4.9, reviews: 76, itinerary: [{ day: 1, title: "Houseboat welcome", details: "Check in to a houseboat and take a shikara ride on Dal Lake." }, { day: 2, title: "Srinagar stories", details: "Mughal gardens, old city lanes, and a saffron tea tasting." }, { day: 3, title: "Gulmarg", details: "Ride the gondola or enjoy a meadow walk." }, { day: 4, title: "Pahalgam", details: "Drive through pine forests to the Lidder Valley." }, { day: 5, title: "A slower valley day", details: "Choose a short hike, pony ride, or riverside picnic." }, { day: 6, title: "Depart", details: "Transfer to the airport with mountain memories." }], inclusions: ["Houseboat and hotel stays", "Breakfast", "Private transport", "Shikara ride"], exclusions: ["Flights", "Gondola tickets", "Personal expenses"], accommodation: "Lake houseboat and mountain hotels", transportation: "Private SUV" },
  { id: 4, title: "Goa, beyond the beach", description: "A sunlit weekend with spice, architecture, and enough room to do nothing.", destinations: ["Panaji", "South Goa"], days: 4, nights: 3, price: 15999, style: "Beach", image: image("photo-1512343879784-a960bf40e7f2"), rating: 4.7, reviews: 112, itinerary: [{ day: 1, title: "A slow arrival", details: "Check in, explore Fontainhas, and catch the Mandovi sunset." }, { day: 2, title: "South Goa", details: "Palolem, a spice farm lunch, and a beachside evening." }, { day: 3, title: "Old Goa", details: "Churches, local cafés, and a free afternoon by the water." }, { day: 4, title: "One last swim", details: "Breakfast, a final swim, and departure." }], inclusions: ["Boutique stay", "Breakfast", "Airport transfers", "Spice farm experience"], exclusions: ["Flights", "Water sports", "Dinner"], accommodation: "Characterful boutique hotel", transportation: "Private transfers" },
  { id: 5, title: "Ladakh, edge of sky", description: "A considered high-altitude circuit for big landscapes and quiet roads.", destinations: ["Leh", "Nubra", "Pangong"], days: 8, nights: 7, price: 42999, style: "Adventure", image: image("photo-1548013146-72479768bada"), rating: 4.8, reviews: 61, itinerary: [{ day: 1, title: "Arrive in Leh", details: "Rest and acclimatize at your hotel." }, { day: 2, title: "Leh at ease", details: "Explore the palace, market, and nearby monasteries." }, { day: 3, title: "To Nubra", details: "Cross Khardung La for a desert valley night." }, { day: 4, title: "Nubra morning", details: "Dunes, monasteries, and a village walk." }, { day: 5, title: "Pangong blue", details: "Drive to the lake through changing mountain light." }, { day: 6, title: "A lake day", details: "A slow morning beside the water." }, { day: 7, title: "Back to Leh", details: "Return via quiet roads and photo stops." }, { day: 8, title: "Depart", details: "Transfer to the airport." }], inclusions: ["Hotels", "Breakfast", "Permits", "Private SUV"], exclusions: ["Flights", "Lunch and dinner", "Adventure activities"], accommodation: "Comfortable mountain stays and camps", transportation: "Private SUV with local driver" },
  { id: 6, title: "Sacred river, open heart", description: "A thoughtful journey through Varanasi, Sarnath, and Rishikesh.", destinations: ["Varanasi", "Rishikesh"], days: 6, nights: 5, price: 22999, style: "Spiritual", image: image("photo-1561361058-c24cecae35ca"), rating: 4.8, reviews: 52, itinerary: [{ day: 1, title: "Arrive by the Ganga", details: "Evening boat ride and Ganga Aarti." }, { day: 2, title: "Varanasi at dawn", details: "Walk the ghats with a local storyteller." }, { day: 3, title: "Sarnath", details: "Visit Sarnath and travel onward." }, { day: 4, title: "Rishikesh", details: "Riverside cafés and evening yoga." }, { day: 5, title: "River and forest", details: "Choose rafting or a quiet forest walk." }, { day: 6, title: "Depart", details: "Breakfast and onward travel." }], inclusions: ["Hotels", "Breakfast", "Boat ride", "Local guide"], exclusions: ["Flights", "Rafting", "Personal expenses"], accommodation: "Heritage and riverside stays", transportation: "Private transfers" },
];

const sessions = new Map<string, number>();
const adminReady = pool.query(
  `INSERT INTO users (name, email, role, password_hash)
   VALUES ($1, $2, 'admin', $3)
   ON CONFLICT (email) DO UPDATE SET role = 'admin'`,
  ["Anhad Jassal", "anhadjassal2013@gmail.com", "d3afd5512a6adea84c1fdbac6c10cabf38afe9415e667f3d63eb763a95160d18"],
);

const getUser = async (req: Request) => {
  const session = req.headers.cookie?.match(/iwu_session=([^;]+)/)?.[1];
  const id = session ? sessions.get(session) : undefined;
  if (!id) return null;
  const result = await pool.query<User & { passwordHash: string }>(
    "SELECT id, name, email, phone, role, password_hash AS \"passwordHash\" FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
};
const requireAdmin = async (req: Request, res: { status: (code: number) => { json: (body: object) => void } }) => {
  const user = await getUser(req);
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Admin access is required." });
    return null;
  }
  return user;
};
const hashPassword = (password: string) => crypto.scryptSync(password, "india-with-us", 32).toString("hex");
const publicUser = (user: User & { passwordHash: string }): User => ({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role });
const setSession = (res: { cookie: (name: string, value: string, options: object) => void }, userId: number) => {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, userId);
  res.cookie("iwu_session", token, { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 30 });
};
const durationBetween = (start: string, end: string) => Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) || 1);

const router: IRouter = Router();

router.get("/destinations", (req, res) => {
  const parsed = ListDestinationsQueryParams.safeParse(req.query);
  const query = parsed.success ? parsed.data : {};
  const search = query.search?.toLowerCase();
  res.json(destinations.filter((destination) => (!search || `${destination.name} ${destination.state} ${destination.region}`.toLowerCase().includes(search)) && (!query.region || destination.region === query.region)));
});
router.get("/destinations/:id", (req, res) => {
  const destination = destinations.find((item) => item.id === Number(req.params.id));
  if (!destination) {
    res.status(404).json({ error: "Destination not found" });
    return;
  }
  res.json(destination);
});
router.get("/tours", (req, res) => {
  const parsed = ListToursQueryParams.safeParse(req.query);
  const query = parsed.success ? parsed.data : {};
  const search = query.search?.toLowerCase();
  const result = tours.filter((tour) => (!search || `${tour.title} ${tour.description} ${tour.destinations.join(" ")}`.toLowerCase().includes(search)) && (!query.style || tour.style === query.style) && (!query.maxPrice || tour.price <= query.maxPrice));
  if (query.sort === "price-low") result.sort((a, b) => a.price - b.price);
  if (query.sort === "price-high") result.sort((a, b) => b.price - a.price);
  if (query.sort === "popular") result.sort((a, b) => b.rating - a.rating);
  res.json(result);
});
router.get("/tours/:id", (req, res) => {
  const tour = tours.find((item) => item.id === Number(req.params.id));
  if (!tour) {
    res.status(404).json({ error: "Tour not found" });
    return;
  }
  res.json(tour);
});
router.post("/auth/register", (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please check your details and try again." });
    return;
  }
  adminReady.then(async () => {
    try {
      const result = await pool.query<User & { passwordHash: string }>(
        `INSERT INTO users (name, email, phone, role, password_hash)
         VALUES ($1, $2, $3, 'customer', $4)
         RETURNING id, name, email, phone, role, password_hash AS "passwordHash"`,
        [parsed.data.name, parsed.data.email, parsed.data.phone || null, hashPassword(parsed.data.password)],
      );
      const user = result.rows[0];
      setSession(res, user.id);
      res.status(201).json(publicUser(user));
    } catch (error: any) {
      if (error?.code === "23505") res.status(409).json({ error: "An account with that email already exists." });
      else res.status(500).json({ error: "Could not create your account." });
    }
  });
});
router.post("/auth/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  await adminReady;
  const result = await pool.query<User & { passwordHash: string }>(
    `SELECT id, name, email, phone, role, password_hash AS "passwordHash" FROM users WHERE email = $1`,
    [parsed.data.email],
  );
  const user = result.rows[0];
  if (!user || user.passwordHash !== hashPassword(parsed.data.password)) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  setSession(res, user.id);
  res.json(publicUser(user));
});
router.post("/auth/logout", (req, res) => {
  const session = req.headers.cookie?.match(/iwu_session=([^;]+)/)?.[1];
  if (session) sessions.delete(session);
  res.clearCookie("iwu_session");
  res.status(204).send();
});
router.get("/account", async (req, res) => {
  await adminReady;
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "Please log in to view your account." });
    return;
  }
  const [ordersResult, plansResult] = await Promise.all([
    pool.query<Order>("SELECT id, order_number AS \"orderNumber\", tour_id AS \"tourId\", tour_title AS \"tourTitle\", travel_date AS \"travelDate\", travelers, amount, payment_status AS \"paymentStatus\", booking_status AS \"bookingStatus\", created_at AS \"createdAt\" FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [user.id]),
    pool.query<CustomPlan>("SELECT id, destinations, start_date AS \"startDate\", end_date AS \"endDate\", duration, travelers, style, interests, accommodation, transportation, estimated_budget AS \"estimatedBudget\", itinerary, status FROM custom_plans WHERE user_id = $1 ORDER BY created_at DESC", [user.id]),
  ]);
  res.json({ user: publicUser(user), orders: ordersResult.rows, customPlans: plansResult.rows, savedTourIds: [] });
});
router.get("/orders", async (req, res) => {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "Please log in to view orders." });
    return;
  }
  const result = await pool.query<Order>("SELECT id, order_number AS \"orderNumber\", tour_id AS \"tourId\", tour_title AS \"tourTitle\", travel_date AS \"travelDate\", travelers, amount, payment_status AS \"paymentStatus\", booking_status AS \"bookingStatus\", created_at AS \"createdAt\" FROM orders WHERE user_id = $1 ORDER BY created_at DESC", [user.id]);
  res.json(result.rows);
});
router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete all checkout details." });
    return;
  }
  const tour = tours.find((item) => item.id === parsed.data.tourId);
  if (!tour) {
    res.status(404).json({ error: "Tour not found." });
    return;
  }
  const user = await getUser(req);
  const count = await pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM orders");
  const orderNumber = `IWU-${String(Number(count.rows[0].count) + 1).padStart(5, "0")}`;
  const result = await pool.query<Order>(
    `INSERT INTO orders (user_id, order_number, tour_id, tour_title, travel_date, travelers, amount, payment_status, booking_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'Demo paid', 'Confirmed')
     RETURNING id, order_number AS "orderNumber", tour_id AS "tourId", tour_title AS "tourTitle", travel_date AS "travelDate", travelers, amount, payment_status AS "paymentStatus", booking_status AS "bookingStatus", created_at AS "createdAt"`,
    [user?.id || null, orderNumber, tour.id, tour.title, parsed.data.travelDate, parsed.data.travelers, tour.price * parsed.data.travelers],
  );
  res.status(201).json(result.rows[0]);
});
const buildPlan = (input: { destinations: string[]; startDate: string; endDate: string; adults: number; children: number; style: string; interests: string[]; accommodation: string; transportation: string }): CustomPlan => {
  const duration = durationBetween(input.startDate, input.endDate);
  const travelers = input.adults + input.children;
  const multiplier = input.accommodation === "Luxury" || input.accommodation === "5 Star" ? 1.9 : input.accommodation === "4 Star" ? 1.5 : input.accommodation === "3 Star" ? 1.2 : 0.9;
  const base = 3800 * travelers * duration * multiplier;
  return { id: 0, destinations: input.destinations, startDate: input.startDate, endDate: input.endDate, duration, travelers, style: input.style, interests: input.interests, accommodation: input.accommodation, transportation: input.transportation, estimatedBudget: Math.round(base), status: "Draft", itinerary: Array.from({ length: Math.min(duration, 8) }, (_, index) => ({ day: index + 1, title: `${input.destinations[index % input.destinations.length]} · day ${index + 1}`, details: `${input.interests.slice(0, 2).join(" and ") || "local discovery"} with a ${input.style.toLowerCase()} pace, traveling by ${input.transportation.toLowerCase()}.` })) };
};
router.post("/planner/generate", (req, res) => {
  const parsed = GenerateCustomPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete the planner steps." });
    return;
  }
  res.json(buildPlan(parsed.data));
});
router.get("/custom-plans", async (req, res) => {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "Please log in to view saved plans." });
    return;
  }
  const result = await pool.query<CustomPlan>("SELECT id, destinations, start_date AS \"startDate\", end_date AS \"endDate\", duration, travelers, style, interests, accommodation, transportation, estimated_budget AS \"estimatedBudget\", itinerary, status FROM custom_plans WHERE user_id = $1 ORDER BY created_at DESC", [user.id]);
  res.json(result.rows);
});
router.post("/custom-plans", async (req, res) => {
  const parsed = CreateCustomPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete the planner steps." });
    return;
  }
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ error: "Please log in to save a custom plan." });
    return;
  }
  const plan = buildPlan({ ...parsed.data, destinations: parsed.data.destinations });
  const result = await pool.query<CustomPlan>(
    `INSERT INTO custom_plans (user_id, destinations, start_date, end_date, duration, travelers, style, interests, accommodation, transportation, estimated_budget, itinerary, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id, destinations, start_date AS "startDate", end_date AS "endDate", duration, travelers, style, interests, accommodation, transportation, estimated_budget AS "estimatedBudget", itinerary, status`,
    [user.id, JSON.stringify(plan.destinations), plan.startDate, plan.endDate, plan.duration, plan.travelers, plan.style, JSON.stringify(plan.interests), plan.accommodation, plan.transportation, plan.estimatedBudget, JSON.stringify(plan.itinerary), plan.status],
  );
  res.status(201).json(result.rows[0]);
});
router.post("/contact", (req, res) => {
  const parsed = SendContactMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please complete the contact form." });
    return;
  }
  res.status(201).json({ message: "Thanks — our travel team will be in touch shortly." });
});
router.get("/admin/summary", async (req, res) => {
  if (!(await requireAdmin(req, res))) return;
  const [usersResult, ordersResult, plansResult, revenueResult, recentResult] = await Promise.all([
    pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM users"),
    pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM orders"),
    pool.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM custom_plans"),
    pool.query<{ revenue: string }>("SELECT COALESCE(SUM(amount), 0)::text AS revenue FROM orders"),
    pool.query<Order>("SELECT id, order_number AS \"orderNumber\", tour_id AS \"tourId\", tour_title AS \"tourTitle\", travel_date AS \"travelDate\", travelers, amount, payment_status AS \"paymentStatus\", booking_status AS \"bookingStatus\", created_at AS \"createdAt\" FROM orders ORDER BY created_at DESC LIMIT 5"),
  ]);
  res.json({ totalUsers: Number(usersResult.rows[0].count), totalTours: tours.length, totalOrders: Number(ordersResult.rows[0].count), totalPlans: Number(plansResult.rows[0].count), revenue: Number(revenueResult.rows[0].revenue), recentOrders: recentResult.rows });
});

export default router;