import { rng, rand, randInt, pick } from "./seed";
import { COUNTRIES } from "./countries";

const CITY_BY_COUNTRY = {
  KR: ["Seoul", "Busan", "Incheon", "Daegu", "Gwangju", "Daejeon", "Suwon", "Ulsan"],
  JP: ["Tokyo", "Osaka", "Nagoya", "Fukuoka", "Sapporo", "Yokohama"],
  CN: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Qingdao"],
  TW: ["Taipei", "Kaohsiung", "Taichung"],
  MN: ["Ulaanbaatar", "Erdenet"],
  VN: ["Hanoi", "Ho Chi Minh", "Da Nang", "Hai Phong"],
  TH: ["Bangkok", "Chiang Mai", "Phuket"],
  ID: ["Jakarta", "Surabaya", "Bandung", "Medan"],
  PH: ["Manila", "Cebu", "Davao"],
  MY: ["Kuala Lumpur", "Penang", "Johor Bahru"],
  SG: ["Singapore Central", "Jurong"],
  IN: ["New Delhi", "Mumbai", "Bengaluru", "Chennai"],
  UZ: ["Tashkent", "Samarkand", "Bukhara", "Andijan"],
  KZ: ["Almaty", "Astana", "Shymkent"],
  US: ["Los Angeles", "New York", "Chicago", "Houston", "Atlanta", "Seattle"],
  CA: ["Toronto", "Vancouver", "Montreal"],
  MX: ["Mexico City", "Guadalajara"],
  BR: ["Sao Paulo", "Rio de Janeiro"],
  AR: ["Buenos Aires", "Cordoba"],
  GB: ["London", "Manchester", "Birmingham"],
  DE: ["Berlin", "Munich", "Frankfurt"],
  FR: ["Paris", "Lyon"],
  RU: ["Moscow", "Saint Petersburg", "Novosibirsk"],
  AU: ["Sydney", "Melbourne", "Brisbane"],
  EG: ["Cairo", "Alexandria"],
  AE: ["Dubai", "Abu Dhabi"],
  ZA: ["Johannesburg", "Cape Town"],
};

const FIRST = ["Min-jun", "Seo-yeon", "Ji-ho", "Ha-eun", "Do-yun", "Soo-ah", "Eun-woo", "Ji-woo", "David", "Maria", "Wei", "Aiman", "Olga", "Carlos", "Yuki", "Anh", "Putri", "James", "Sara", "Tariq"];
const LAST = ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Nguyen", "Tan", "Ivanova", "Garcia", "Sato", "Rahman", "Müller", "Silva", "Khan", "Smith"];

function managerName() {
  return `${pick(FIRST)} ${pick(LAST)}`;
}

// Health score weighting per spec.
export function healthScore({ attendance, lmsActivity, completion, teacherEngagement, studentGrowth }) {
  // studentGrowth can be negative; normalize to 0..100 band centered at 50.
  const growthScore = Math.max(0, Math.min(100, 50 + studentGrowth * 2.5));
  const raw =
    attendance * 0.3 +
    lmsActivity * 0.25 +
    completion * 0.2 +
    teacherEngagement * 0.15 +
    growthScore * 0.1;
  return Math.round(raw);
}

export function healthBand(score) {
  if (score >= 80) return "healthy";
  if (score >= 60) return "attention";
  return "critical";
}

// Sejong Institutes are overseas Korean-language centers — KR hosts only HQ.
// Weights sum to 252 (the real worldwide Sejong Institute count).
const COUNTRY_BRANCH_WEIGHT = {
  KR: 6, CN: 30, JP: 26, UZ: 20, VN: 18, US: 16, ID: 13, IN: 12, RU: 11,
  TH: 10, PH: 9, KZ: 9, MY: 7, TW: 7, MN: 5, GB: 7, DE: 7, AU: 5, FR: 6,
  CA: 5, MX: 4, BR: 5, SG: 3, AR: 3, EG: 3, AE: 3, ZA: 2,
};

const STREETS = ["Sejong-daero", "Gangnam-gu Ave", "Central Plaza", "University Rd", "Main St", "Hangang Blvd", "Education Park", "City Center Tower", "Riverside Ave", "Heritage Square"];

function phoneFor(code, r) {
  const cc = { KR: "+82", JP: "+81", CN: "+86", US: "+1", GB: "+44", DE: "+49", FR: "+33", UZ: "+998", VN: "+84", IN: "+91", RU: "+7", AU: "+61" }[code] ?? "+__";
  const n = () => Math.floor(r() * 900 + 100);
  return `${cc} ${n()} ${n()} ${n()}`;
}

function buildBranches() {
  const list = [];
  let id = 1;
  for (const country of COUNTRIES) {
    const count = COUNTRY_BRANCH_WEIGHT[country.code] ?? 2;
    const cities = CITY_BY_COUNTRY[country.code] ?? [country.name];
    for (let i = 0; i < count; i++) {
      const city = cities[i % cities.length];
      const suffix = i >= cities.length ? ` ${Math.floor(i / cities.length) + 1}` : "";
      const attendance = Math.round(rand(62, 98));
      const lmsActivity = Math.round(rand(48, 97));
      const completion = Math.round(rand(58, 95));
      const teacherEngagement = Math.round(rand(55, 98));
      const studentGrowth = Math.round(rand(-14, 22));
      const students = randInt(60, 620);
      const teachers = Math.max(3, Math.round(students / randInt(14, 24)));
      const score = healthScore({ attendance, lmsActivity, completion, teacherEngagement, studentGrowth });
      const active = rng() > 0.028; // ~7 of 250 inactive
      // per-branch location = city/country coords + small jitter
      const lng = country.coords[0] + rand(-0.6, 0.6);
      const lat = country.coords[1] + rand(-0.5, 0.5);
      const slug = city.toLowerCase().replace(/[^a-z]/g, "");
      list.push({
        id: `BR-${String(id).padStart(4, "0")}`,
        name: `Sejong ${city}${suffix}`,
        city,
        country: country.name,
        countryCode: country.code,
        region: country.region,
        coords: country.coords,
        location: [lng, lat],
        address: `${randInt(1, 280)} ${pick(STREETS)}, ${city}${suffix}, ${country.name}`,
        phone: phoneFor(country.countryCode ?? country.code, rng),
        email: `${slug}${suffix ? "." + suffix.trim() : ""}@sejong-edu.kr`,
        website: "sejong-edu.kr",
        manager: managerName(),
        active,
        students,
        teachers,
        attendance,
        lmsActivity,
        completion,
        teacherEngagement,
        studentGrowth,
        healthScore: score,
        band: healthBand(score),
        // small jitter on map so co-located branches don't fully overlap
        markerOffset: [rand(-3.2, 3.2), rand(-2.4, 2.4)],
      });
      id++;
    }
  }
  return list;
}

export const BRANCHES = buildBranches();

export const TOTAL_BRANCHES = BRANCHES.length;
export const ACTIVE_BRANCHES = BRANCHES.filter((b) => b.active).length;

export function getBranch(id) {
  return BRANCHES.find((b) => b.id === id);
}

export const branchesByCountry = (() => {
  const map = {};
  for (const b of BRANCHES) {
    const c = (map[b.countryCode] ??= {
      code: b.countryCode,
      country: b.country,
      region: b.region,
      coords: b.coords,
      branches: 0,
      students: 0,
      teachers: 0,
      attendanceSum: 0,
      lmsSum: 0,
      critical: 0,
      attention: 0,
      healthy: 0,
    });
    c.branches++;
    c.students += b.students;
    c.teachers += b.teachers;
    c.attendanceSum += b.attendance;
    c.lmsSum += b.lmsActivity;
    c[b.band]++;
  }
  return Object.values(map).map((c) => ({
    ...c,
    attendance: Math.round(c.attendanceSum / c.branches),
    lmsAdoption: Math.round(c.lmsSum / c.branches),
    status: c.critical > 0 && c.critical >= c.healthy ? "critical" : c.attention > c.healthy ? "attention" : "healthy",
  }));
})();
