import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DATASET_URL = "https://raw.githubusercontent.com/HedaetShahriar/bangladesh-locations-dataset/main/data/bd_locations.json";
const SECONDARY_UPAZILAS_URL = "https://raw.githubusercontent.com/aktarulahsan/Bangladesh-geolocation/main/upazilas/upazilas.json";
const SECONDARY_UNIONS_URL = "https://raw.githubusercontent.com/aktarulahsan/Bangladesh-geolocation/main/unions/unions.json";

type LocationNode = {
  id?: number | string;
  name?: string;
  districts?: LocationNode[];
  upazilas?: LocationNode[];
  areas?: LocationNode[];
  unions?: LocationNode[];
};

type LocationDataset = { divisions?: LocationNode[] };

type SecondaryRecord = { id?: string; upazilla_id?: string; name?: string };

type SecondaryExport = { type?: string; data?: SecondaryRecord[] };

function names(nodes: LocationNode[] | undefined): string[] {
  return (nodes || [])
    .map((node) => node.name?.trim())
    .filter((name): name is string => Boolean(name));
}

function normalized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findByName(nodes: LocationNode[] | undefined, name: string | null): LocationNode | undefined {
  if (!name) return undefined;
  return nodes?.find((node) => node.name && normalized(node.name) === normalized(name));
}

async function getSecondaryUnionOptions(thanaName: string): Promise<string[]> {
  const [upazilaResponse, unionResponse] = await Promise.all([
    fetch(SECONDARY_UPAZILAS_URL, { next: { revalidate: 86400 } }),
    fetch(SECONDARY_UNIONS_URL, { next: { revalidate: 86400 } }),
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
    .map((item) => item.name as string);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const divisionName = searchParams.get("division");
    const districtName = searchParams.get("district");
    const thanaName = searchParams.get("thana");

    if (!level || !["divisions", "districts", "thanas", "unions"].includes(level)) {
      return NextResponse.json({ error: "A valid location level is required." }, { status: 400 });
    }

    const response = await fetch(DATASET_URL, { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error("Location dataset unavailable.");
    const dataset = (await response.json()) as LocationDataset;
    const divisions = dataset.divisions || [];

    if (level === "divisions") {
      return NextResponse.json({ options: names(divisions) });
    }

    const division = findByName(divisions, divisionName);
    if (!division) return NextResponse.json({ options: [] });

    if (level === "districts") {
      return NextResponse.json({ options: names(division.districts) });
    }

    const district = findByName(division.districts, districtName);
    if (!district) return NextResponse.json({ options: [] });

    if (level === "thanas") {
      return NextResponse.json({ options: names(district.upazilas) });
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

    return NextResponse.json({ options: unionOptions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Location lookup failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
