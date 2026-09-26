import { NextRequest, NextResponse } from "next/server";
import { normalizeDistrictName } from "@/lib/location-normalization";

export const dynamic = "force-dynamic";

const DATASET_URL = "https://raw.githubusercontent.com/HedaetShahriar/bangladesh-locations-dataset/main/data/bd_locations.json";
const SECONDARY_UPAZILAS_URL = "https://raw.githubusercontent.com/aktarulahsan/Bangladesh-geolocation/main/upazilas/upazilas.json";
const SECONDARY_UNIONS_URL = "https://raw.githubusercontent.com/aktarulahsan/Bangladesh-geolocation/main/unions/unions.json";
const BENGALI_SOURCE_URLS = [
  "https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/divisions/divisions.json",
  "https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/districts/districts.json",
  "https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/upazilas/upazilas.json",
  "https://raw.githubusercontent.com/nuhil/bangladesh-geocode/master/unions/unions.json",
];

type LocationNode = {
  id?: number | string;
  name?: string;
  districts?: LocationNode[];
  upazilas?: LocationNode[];
  areas?: LocationNode[];
  unions?: LocationNode[];
};

type LocationDataset = { divisions?: LocationNode[] };

let datasetPromise: Promise<LocationDataset> | null = null;
let bengaliLabelsPromise: Promise<Map<string, string>> | null = null;

const FALLBACK_DIVISIONS: LocationNode[] = [
  { name: "Barishal", districts: [{ name: "Barguna" }, { name: "Barishal" }, { name: "Bhola" }, { name: "Jhalokati" }, { name: "Patuakhali" }, { name: "Pirojpur" }] },
  { name: "Chattogram", districts: [{ name: "Bandarban" }, { name: "Brahmanbaria" }, { name: "Chandpur" }, { name: "Chattogram" }, { name: "Cumilla" }, { name: "Cox's Bazar" }, { name: "Feni" }, { name: "Khagrachhari" }, { name: "Lakshmipur" }, { name: "Noakhali" }, { name: "Rangamati" }] },
  { name: "Dhaka", districts: [{ name: "Dhaka" }, { name: "Faridpur" }, { name: "Gazipur" }, { name: "Gopalganj" }, { name: "Kishoreganj" }, { name: "Madaripur" }, { name: "Manikganj" }, { name: "Munshiganj" }, { name: "Narayanganj" }, { name: "Narsingdi" }, { name: "Rajbari" }, { name: "Shariatpur" }, { name: "Tangail" }] },
  { name: "Khulna", districts: [{ name: "Bagherhat" }, { name: "Chuadanga" }, { name: "Jashore" }, { name: "Jhenaidah" }, { name: "Khulna" }, { name: "Kushtia" }, { name: "Magura" }, { name: "Meherpur" }, { name: "Narail" }, { name: "Satkhira" }] },
  { name: "Mymensingh", districts: [{ name: "Jamalpur" }, { name: "Mymensingh" }, { name: "Netrokona" }, { name: "Sherpur" }] },
  { name: "Rajshahi", districts: [{ name: "Bogura" }, { name: "Chapai Nawabganj" }, { name: "Joypurhat" }, { name: "Naogaon" }, { name: "Natore" }, { name: "Pabna" }, { name: "Rajshahi" }, { name: "Sirajganj" }] },
  { name: "Rangpur", districts: [{ name: "Dinajpur" }, { name: "Gaibandha" }, { name: "Kurigram" }, { name: "Lalmonirhat" }, { name: "Nilphamari" }, { name: "Panchagarh" }, { name: "Rangpur" }, { name: "Thakurgaon" }] },
  { name: "Sylhet", districts: [{ name: "Habiganj" }, { name: "Moulvibazar" }, { name: "Sunamganj" }, { name: "Sylhet" }] },
];

const FALLBACK_DATASET: LocationDataset = { divisions: FALLBACK_DIVISIONS };
const FALLBACK_BENGALI_LABELS = new Map<string, string>([
  ["barishal", "বরিশাল"],
  ["chattogram", "চট্টগ্রাম"],
  ["dhaka", "ঢাকা"],
  ["khulna", "খুলনা"],
  ["mymensingh", "ময়মনসিংহ"],
  ["rajshahi", "রাজশাহী"],
  ["rangpur", "রংপুর"],
  ["sylhet", "সিলেট"],
]);

const SECONDARY_UNION_CACHE = new Map<string, Promise<string[]>>();

type SecondaryRecord = { id?: string; upazilla_id?: string; name?: string };

type SecondaryExport = { type?: string; data?: SecondaryRecord[] };
type BengaliLocationRecord = { name?: string; bn_name?: string };
type BengaliLocationExport = { type?: string; data?: BengaliLocationRecord[] };

function names(nodes: LocationNode[] | undefined): string[] {
  return (nodes || [])
    .map((node) => normalizeDistrictName(node.name))
    .filter((name): name is string => Boolean(name));
}

async function safeJsonFetch<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getCachedDataset(): Promise<LocationDataset> {
  if (!datasetPromise) {
    datasetPromise = (async () => {
      const dataset = await safeJsonFetch<LocationDataset>(DATASET_URL);
      if (dataset && dataset.divisions?.length) return dataset;
      return FALLBACK_DATASET;
    })();
  }

  return datasetPromise;
}

async function getBengaliLabels(): Promise<Map<string, string>> {
  if (!bengaliLabelsPromise) {
    bengaliLabelsPromise = (async () => {
      const labels = new Map<string, string>();
      const responses = await Promise.all(BENGALI_SOURCE_URLS.map((url) => safeJsonFetch<BengaliLocationExport[]>(url)));

      for (const exportData of responses) {
        if (!exportData) continue;
        const records = exportData.find((item) => item.type === "table")?.data || [];
        for (const record of records) {
          if (record.name && record.bn_name) labels.set(normalized(record.name), record.bn_name);
        }
      }

      return labels.size ? labels : FALLBACK_BENGALI_LABELS;
    })();
  }

  return bengaliLabelsPromise;
}

function displayName(value: string, bengaliLabels: Map<string, string>): string {
  return bengaliLabels.get(normalized(value)) || normalizeDistrictName(value);
}

function locationPayload(options: string[], bengaliLabels: Map<string, string>) {
  return {
    options,
    labels: Object.fromEntries(options.map((option) => [option, displayName(option, bengaliLabels)])),
  };
}

function normalized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findByName(nodes: LocationNode[] | undefined, name: string | null): LocationNode | undefined {
  if (!name) return undefined;
  return nodes?.find((node) => node.name && normalized(node.name) === normalized(name));
}

async function getSecondaryUnionOptions(thanaName: string): Promise<string[]> {
  const cacheKey = normalized(thanaName);
  const cached = SECONDARY_UNION_CACHE.get(cacheKey);
  if (cached) return cached;

  const task = (async () => {
    const [upazilaResponse, unionResponse] = await Promise.all([
      fetch(SECONDARY_UPAZILAS_URL, { cache: "force-cache" }),
      fetch(SECONDARY_UNIONS_URL, { cache: "force-cache" }),
    ]);
    if (!upazilaResponse.ok || !unionResponse.ok) return [];

    const upazilaExport = (await upazilaResponse.json()) as SecondaryExport[];
    const unionExport = (await unionResponse.json()) as SecondaryExport[];
    const upazilas = upazilaExport.find((item) => item.type === "table")?.data || [];
    const unions = unionExport.find((item) => item.type === "table")?.data || [];
    const upazila = upazilas.find((item) => item.name && normalized(item.name) === normalized(thanaName));
    let upazilaId = upazila?.id;

    // Newer upazilas may not yet have their own union rows in the legacy source.
    // Reuse the source's same-name union parent group in that case.
    if (upazilaId && !unions.some((item) => item.upazilla_id === upazilaId)) {
      upazilaId = unions.find(
        (item) => item.name && normalized(item.name) === normalized(thanaName)
      )?.upazilla_id;
    }

    if (!upazilaId) return [];
    return unions
      .filter((item) => item.upazilla_id === upazilaId && item.name)
      .map((item) => normalizeDistrictName(item.name as string));
  })();

  SECONDARY_UNION_CACHE.set(cacheKey, task);
  return task;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const divisionName = searchParams.get("division");
    const districtName = searchParams.get("district");
    const thanaName = searchParams.get("thana");

    if (!level || !["labels", "divisions", "districts", "thanas", "unions"].includes(level)) {
      return NextResponse.json({ error: "A valid location level is required." }, { status: 400 });
    }

    const dataset = await getCachedDataset();
    const divisions = dataset.divisions || [];
    const bengaliLabels = await getBengaliLabels();

    if (level === "labels") {
      return NextResponse.json({
        labels: Object.fromEntries(bengaliLabels.entries()),
      });
    }

    if (level === "divisions") {
      return NextResponse.json(locationPayload(names(divisions), bengaliLabels));
    }

    const division = findByName(divisions, divisionName);
    if (!division) return NextResponse.json({ options: [] });

    if (level === "districts") {
      return NextResponse.json(locationPayload(names(division.districts), bengaliLabels));
    }

    const district = findByName(division.districts, districtName);
    if (!district) return NextResponse.json({ options: [] });

    if (level === "thanas") {
      return NextResponse.json(locationPayload(names(district.upazilas), bengaliLabels));
    }

    const thana = findByName(district.upazilas, thanaName);
    let unionOptions = names(thana?.areas || thana?.unions);

    if (!unionOptions.length && districtName && thanaName) {
      const directFileUrl = `https://raw.githubusercontent.com/HedaetShahriar/bangladesh-locations-dataset/main/data/upazilas/${normalized(districtName)}-${normalized(thanaName)}.json`;
      const directResponse = await fetch(directFileUrl, { next: { revalidate: 86400 } });
      if (directResponse.ok) {
        const directData = (await directResponse.json()) as LocationNode;
        unionOptions = names(directData.areas || directData.unions);
      }
    }

    if (!unionOptions.length && thanaName) {
      unionOptions = await getSecondaryUnionOptions(thanaName);
    }

    return NextResponse.json(locationPayload(unionOptions, bengaliLabels));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Location lookup failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
