export type JournalMeta = {
  name: string;
  prestigeTier: 1 | 2 | 3 | 4;
  established?: number;
};

const j = (
  name: string,
  prestigeTier: JournalMeta["prestigeTier"],
  established?: number,
): JournalMeta => ({ name, prestigeTier, established });

export const journalPools: Record<string, JournalMeta[]> = {
  ecology: [
    j("Nature Ecology & Evolution", 1, 2017), j("Ecology Letters", 1, 1998),
    j("Global Change Biology", 1, 1995), j("Proceedings of the Royal Society B", 1, 1905),
    j("Journal of Ecology", 2, 1913), j("Ecology", 2, 1920),
    j("Functional Ecology", 2, 1987), j("Oikos", 3, 1949),
    j("Ecography", 3, 1978), j("Ecological Applications", 3, 1991),
  ],
  aquatic: [
    j("Limnology and Oceanography", 1, 1956), j("Global Change Biology", 1, 1995),
    j("Marine Ecology Progress Series", 2, 1979), j("Freshwater Biology", 2, 1971),
    j("ICES Journal of Marine Science", 2, 1926), j("Aquatic Sciences", 3, 1939),
    j("Hydrobiologia", 3, 1948), j("Journal of Fish Biology", 3, 1969),
    j("Fisheries Research", 3, 1981), j("Journal of Plankton Research", 3, 1979),
  ],
  environment: [
    j("Nature Climate Change", 1, 2011), j("Environmental Science & Technology", 1, 1967),
    j("Global Environmental Change", 1, 1990), j("Water Research", 1, 1967),
    j("Environmental Research Letters", 2, 2006), j("Journal of Cleaner Production", 2, 1993),
    j("Science of the Total Environment", 2, 1972), j("Environmental Pollution", 2, 1970),
    j("Environmental Management", 3, 1977), j("Ecological Indicators", 3, 2001),
  ],
  organismal: [
    j("New Phytologist", 1, 1902), j("The Plant Journal", 1, 1991),
    j("Molecular Ecology", 1, 1992), j("Journal of Animal Ecology", 2, 1932),
    j("The Auk", 2, 1884), j("Journal of Experimental Botany", 2, 1950),
    j("Entomologia Experimentalis et Applicata", 3, 1958), j("Zoological Journal of the Linnean Society", 3, 1969),
    j("Plant Biology", 3, 1999), j("Journal of Zoology", 3, 1830),
  ],
  molecular: [
    j("Nature Genetics", 1, 1992), j("Molecular Cell", 1, 1997),
    j("The EMBO Journal", 1, 1982), j("Genome Biology", 1, 2000),
    j("Molecular Biology and Evolution", 2, 1983), j("Journal of Biological Chemistry", 2, 1905),
    j("Cellular Microbiology", 2, 1999), j("Microbiology", 3, 1947),
    j("BMC Molecular Biology", 3, 2000), j("Applied Microbiology and Biotechnology", 3, 1975),
  ],
  neuroscience: [
    j("Nature Neuroscience", 1, 1998), j("Neuron", 1, 1988),
    j("Brain", 1, 1878), j("Journal of Neuroscience", 2, 1981),
    j("Cerebral Cortex", 2, 1991), j("NeuroImage", 2, 1992),
    j("European Journal of Neuroscience", 3, 1989), j("Behavioural Brain Research", 3, 1980),
  ],
  "general-medicine": [
    j("The New England Journal of Medicine", 1, 1812), j("The Lancet", 1, 1823),
    j("JAMA", 1, 1883), j("The BMJ", 1, 1840),
    j("Annals of Internal Medicine", 2, 1927), j("PLOS Medicine", 2, 2004),
    j("BMC Medicine", 3, 2003), j("Journal of General Internal Medicine", 3, 1986),
  ],
  "public-health": [
    j("The Lancet Public Health", 1, 2016), j("American Journal of Public Health", 1, 1911),
    j("Epidemiology", 1, 1990), j("International Journal of Epidemiology", 1, 1972),
    j("Clinical Infectious Diseases", 2, 1979), j("Emerging Infectious Diseases", 2, 1995),
    j("BMC Public Health", 3, 2001), j("Journal of Occupational Health", 3, 1960),
  ],
  biomedicine: [
    j("Cancer Cell", 1, 2002), j("Journal of Clinical Oncology", 1, 1983),
    j("Nature Immunology", 1, 2000), j("Clinical Cancer Research", 2, 1995),
    j("Diabetes", 2, 1952), j("British Journal of Pharmacology", 2, 1946),
    j("Cancer Research", 2, 1941), j("European Journal of Immunology", 3, 1971),
    j("Clinical Pharmacology & Therapeutics", 3, 1960), j("Endocrine", 3, 1993),
  ],
  clinical: [
    j("The Lancet Neurology", 1, 2002), j("Circulation", 1, 1950),
    j("Gut", 1, 1960), j("American Journal of Respiratory and Critical Care Medicine", 1, 1917),
    j("American Journal of Psychiatry", 1, 1844), j("Neurology", 2, 1951),
    j("European Heart Journal", 2, 1980), j("Chest", 2, 1935),
    j("Journal of Hepatology", 2, 1985), j("Psychological Medicine", 3, 1970),
  ],
  physics: [
    j("Physical Review Letters", 1, 1958), j("Nature Physics", 1, 2005),
    j("Reviews of Modern Physics", 1, 1929), j("Applied Physics Letters", 2, 1962),
    j("Physical Review A", 2, 1970), j("Physical Review B", 2, 1970),
    j("Journal of Applied Physics", 3, 1931), j("European Physical Journal B", 3, 1998),
  ],
  astronomy: [
    j("The Astrophysical Journal", 1, 1895), j("Monthly Notices of the Royal Astronomical Society", 1, 1827),
    j("Astronomy & Astrophysics", 1, 1969), j("The Astronomical Journal", 2, 1849),
    j("Publications of the Astronomical Society of the Pacific", 2, 1889), j("Solar Physics", 3, 1967),
    j("Astrophysics and Space Science", 3, 1968), j("New Astronomy", 3, 1996),
  ],
  chemistry: [
    j("Journal of the American Chemical Society", 1, 1879), j("Angewandte Chemie International Edition", 1, 1962),
    j("Chemical Science", 1, 2010), j("Analytical Chemistry", 2, 1929),
    j("The Journal of Physical Chemistry", 2, 1896), j("Organic Letters", 2, 1999),
    j("Journal of Organic Chemistry", 2, 1936), j("Analytica Chimica Acta", 3, 1947),
    j("Physical Chemistry Chemical Physics", 3, 1999), j("Tetrahedron", 3, 1957),
  ],
  "earth-materials": [
    j("Nature Materials", 1, 2002), j("Geology", 1, 1973),
    j("Journal of Climate", 1, 1988), j("Geophysical Research Letters", 1, 1974),
    j("Earth and Planetary Science Letters", 2, 1966), j("Journal of Geophysical Research", 2, 1896),
    j("Materials Science and Engineering A", 2, 1988), j("Deep Sea Research Part I", 3, 1993),
    j("Atmospheric Environment", 3, 1967), j("Marine Geology", 3, 1964),
  ],
  "computer-science": [
    j("Journal of Machine Learning Research", 1, 2000), j("Artificial Intelligence", 1, 1970),
    j("IEEE Transactions on Pattern Analysis and Machine Intelligence", 1, 1979),
    j("ACM Computing Surveys", 1, 1969), j("Machine Learning", 2, 1986),
    j("IEEE Transactions on Automatic Control", 2, 1956), j("Information Systems", 2, 1975),
    j("Autonomous Robots", 3, 1994), j("Theoretical Computer Science", 3, 1975),
    j("Robotics and Autonomous Systems", 3, 1988),
  ],
  engineering: [
    j("IEEE Transactions on Industrial Electronics", 1, 1953), j("Journal of Membrane Science", 1, 1976),
    j("Biomaterials", 1, 1980), j("IEEE Transactions on Biomedical Engineering", 2, 1953),
    j("Chemical Engineering Science", 2, 1951), j("Mechanical Systems and Signal Processing", 2, 1987),
    j("Environmental Engineering Science", 3, 1984), j("Journal of Mechanical Engineering Science", 3, 1959),
    j("Biomedical Engineering Online", 3, 2002), j("Electric Power Systems Research", 3, 1977),
  ],
  "social-science": [
    j("American Psychologist", 1, 1946), j("American Sociological Review", 1, 1936),
    j("American Political Science Review", 1, 1906), j("Psychological Science", 1, 1990),
    j("Journal of Personality and Social Psychology", 1, 1965), j("Social Forces", 2, 1922),
    j("Political Geography", 2, 1982), j("European Journal of International Relations", 2, 1995),
    j("British Journal of Psychology", 3, 1904), j("Social Science Research", 3, 1972),
  ],
  "economics-business": [
    j("American Economic Review", 1, 1911), j("Quarterly Journal of Economics", 1, 1886),
    j("Academy of Management Journal", 1, 1958), j("Strategic Management Journal", 1, 1980),
    j("Journal of Finance", 1, 1946), j("Management Science", 2, 1954),
    j("Journal of Business Research", 3, 1973), j("Applied Economics", 3, 1969),
    j("Economics Letters", 3, 1978), j("Long Range Planning", 3, 1968),
  ],
  "education-communication": [
    j("Review of Educational Research", 1, 1931), j("Journal of Communication", 1, 1951),
    j("Learning and Instruction", 1, 1991), j("Communication Research", 2, 1974),
    j("Educational Researcher", 2, 1972), j("Computers & Education", 2, 1976),
    j("Teaching and Teacher Education", 3, 1985), j("Media, Culture & Society", 3, 1979),
    j("Educational Technology Research and Development", 3, 1953), j("Communication Education", 3, 1952),
  ],
};
