import { selectProjects } from "../db/index.js";

const MAP_API_TOKEN = process.env.MAP_API_TOKEN!;

type ProjectsType = Awaited<ReturnType<typeof selectProjects>>["projects"];
type FlattenedLocation = NonNullable<
  ProjectsType[number]["locations"]
>[number] & {
  projectIndex: number;
  locationIndex: number;
};

export const getBatchLocationData = async ({
  projects,
}: {
  projects: ProjectsType;
}): Promise<ProjectsType> => {
  const locations = projects.reduce<FlattenedLocation[]>(
    (total, current, projectIndex) =>
      current.locations
        ? [
            ...total,
            ...(current.locations ?? []).map((location, locationIndex) => ({
              ...location,
              projectIndex,
              locationIndex,
            })),
          ]
        : total,
    [],
  );

  if (locations.length === 0) {
    return projects;
  }

  const response = await fetch(
    `https://api.mapbox.com/search/geocode/v6/batch?access_token=${MAP_API_TOKEN}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        locations.map((r) => ({
          longitude: r.longitude,
          latitude: r.latitude,
          types: [r.type],
          limit: 1,
        })),
      ),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mapbox Batch Error: ${error}`);
  }

  const data = await response.json();

  const enrichedProjects: ProjectsType = JSON.parse(JSON.stringify(projects));

  locations.forEach(
    ({ projectIndex, locationIndex, ...restLocation }, index) => {
      const mapboxResult = data.batch[index];

      if (
        mapboxResult &&
        mapboxResult.features &&
        mapboxResult.features.length > 0
      ) {
        enrichedProjects[projectIndex].locations[locationIndex] = {
          ...restLocation,
          ...mapboxResult.features[0].properties,
        };
      }
    },
  );

  return enrichedProjects;
};
