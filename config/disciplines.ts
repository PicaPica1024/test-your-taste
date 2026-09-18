export type DisciplineGroup =
  | "Life Sciences"
  | "Medicine & Health"
  | "Physical Sciences"
  | "Engineering & Computer Science"
  | "Social Sciences";

export type Discipline = {
  slug: string;
  name: string;
  group: DisciplineGroup;
  poolKey: string;
};

const make = (
  group: DisciplineGroup,
  poolKey: string,
  names: string[],
): Discipline[] =>
  names.map((name) => ({
    name,
    group,
    poolKey,
    slug: name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
  }));

export const disciplines: Discipline[] = [
  ...make("Life Sciences", "ecology", [
    "Ecology",
    "Evolutionary Biology",
    "Biodiversity Conservation",
  ]),
  ...make("Life Sciences", "aquatic", [
    "Marine & Freshwater Biology",
    "Limnology",
    "Fisheries",
  ]),
  ...make("Life Sciences", "environment", [
    "Environmental Sciences",
    "Environmental Studies",
  ]),
  ...make("Life Sciences", "organismal", [
    "Plant Sciences",
    "Zoology",
    "Entomology",
    "Ornithology",
  ]),
  ...make("Life Sciences", "molecular", [
    "Microbiology",
    "Biotechnology & Applied Microbiology",
    "Genetics & Heredity",
    "Cell Biology",
    "Biochemistry & Molecular Biology",
    "Physiology",
    "Developmental Biology",
  ]),
  ...make("Life Sciences", "neuroscience", ["Neurosciences"]),
  ...make("Medicine & Health", "general-medicine", [
    "Medicine, General & Internal",
  ]),
  ...make("Medicine & Health", "public-health", [
    "Public, Environmental & Occupational Health",
    "Infectious Diseases",
  ]),
  ...make("Medicine & Health", "biomedicine", [
    "Oncology",
    "Immunology",
    "Endocrinology & Metabolism",
    "Pharmacology & Pharmacy",
  ]),
  ...make("Medicine & Health", "clinical", [
    "Psychiatry",
    "Clinical Neurology",
    "Cardiac & Cardiovascular Systems",
    "Gastroenterology & Hepatology",
    "Respiratory System",
  ]),
  ...make("Physical Sciences", "physics", [
    "Physics, Multidisciplinary",
    "Applied Physics",
  ]),
  ...make("Physical Sciences", "astronomy", ["Astronomy & Astrophysics"]),
  ...make("Physical Sciences", "chemistry", [
    "Chemistry, Multidisciplinary",
    "Physical Chemistry",
    "Analytical Chemistry",
    "Organic Chemistry",
  ]),
  ...make("Physical Sciences", "earth-materials", [
    "Materials Science, Multidisciplinary",
    "Geosciences, Multidisciplinary",
    "Meteorology & Atmospheric Sciences",
    "Oceanography",
  ]),
  ...make("Engineering & Computer Science", "computer-science", [
    "Computer Science, Artificial Intelligence",
    "Computer Science, Information Systems",
    "Computer Science, Theory & Methods",
    "Robotics",
    "Automation & Control Systems",
  ]),
  ...make("Engineering & Computer Science", "engineering", [
    "Engineering, Electrical & Electronic",
    "Engineering, Environmental",
    "Engineering, Biomedical",
    "Mechanical Engineering",
    "Chemical Engineering",
  ]),
  ...make("Social Sciences", "social-science", [
    "Psychology, Multidisciplinary",
    "Psychology, Experimental",
    "Psychology, Social",
    "Sociology",
    "Political Science",
    "Geography",
    "International Relations",
  ]),
  ...make("Social Sciences", "economics-business", [
    "Economics",
    "Business",
    "Management",
  ]),
  ...make("Social Sciences", "education-communication", [
    "Education & Educational Research",
    "Communication",
  ]),
];

export const disciplinesBySlug = new Map(
  disciplines.map((discipline) => [discipline.slug, discipline]),
);

export const disciplineGroups = [
  "Life Sciences",
  "Medicine & Health",
  "Physical Sciences",
  "Engineering & Computer Science",
  "Social Sciences",
] as const;
