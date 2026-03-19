// SDG Goals — full targets from UN 2030 Agenda + indicators from SDR 2025 codebook
// Source: A/RES/70/1 Transforming our world: the 2030 Agenda for Sustainable Development

export interface SDGIndicator {
  code: string;
  label: string;
  unit: string;
  direction: 'higher_better' | 'lower_better';
  sdr_code?: string; // maps to SDR 2025 indicator code
}

export interface SDGTarget {
  code: string;
  description: string;
  indicators: SDGIndicator[];
}

export interface SDGGoal {
  goal: number;
  title: string;
  short: string;
  color: string;
  icon: string;
  description: string;
  targets: SDGTarget[];
}

export const SDG_FULL_DATA: SDGGoal[] = [
  {
    goal: 1, title: "No Poverty", short: "No Poverty", color: "#E5243B", icon: "🏚",
    description: "End poverty in all its forms everywhere by 2030. More than 700 million people still live in extreme poverty — surviving on less than $2.15 per day — and lack access to education, health services, adequate sanitation, and clean water. Poverty is not just a lack of income; it is a multidimensional challenge involving food insecurity, social exclusion, vulnerability to climate shocks, and lack of political voice. SDG 1 calls for universal social protection systems, equal rights to economic resources, and resilience-building in climate-vulnerable communities. Achieving SDG 1 requires political will, inclusive institutions, and international cooperation to ensure no one is left behind.",
    targets: [
      { code: "1.1", description: "Eradicate extreme poverty (people living on less than $2.15/day)", indicators: [
        { code: "1.1.1", label: "Poverty headcount ratio at $2.15/day (%)", unit: "%", direction: "lower_better", sdr_code: "sdg1_wpc" },
        { code: "1.1.2", label: "Poverty headcount ratio at $3.65/day (%)", unit: "%", direction: "lower_better", sdr_code: "sdg1_lmicpov" },
      ]},
      { code: "1.2", description: "Reduce at least by half the proportion living in poverty in all dimensions", indicators: [
        { code: "1.2.1", label: "Poverty rate after taxes and transfers (%)", unit: "%", direction: "lower_better", sdr_code: "sdg1_oecdpov" },
      ]},
      { code: "1.3", description: "Implement social protection systems and achieve substantial coverage of the poor", indicators: [] },
      { code: "1.4", description: "Ensure equal rights to economic resources, basic services, land, and financial services", indicators: [] },
      { code: "1.5", description: "Build the resilience of the poor to climate-related extreme events", indicators: [] },
      { code: "1.a", description: "Mobilize resources to provide adequate means for developing countries to end poverty", indicators: [] },
      { code: "1.b", description: "Create pro-poor and gender-sensitive policy frameworks to support investment in poverty eradication", indicators: [] },
    ],
  },
  {
    goal: 2, title: "Zero Hunger", short: "Zero Hunger", color: "#DDA63A", icon: "🌾",
    description: "End hunger, achieve food security and improved nutrition, and promote sustainable agriculture by 2030. Today, more than 820 million people go hungry every day, while 2 billion suffer from micronutrient deficiencies. Climate change, conflict, and economic shocks are pushing millions more into food insecurity. SDG 2 calls for ending all forms of malnutrition, doubling agricultural productivity of small-scale food producers, ensuring sustainable food systems, and maintaining genetic diversity of seeds and livestock. Achieving Zero Hunger requires massive investment in rural infrastructure, equitable land rights, and international trade reform.",
    targets: [
      { code: "2.1", description: "End hunger and ensure access to safe, nutritious and sufficient food all year round", indicators: [
        { code: "2.1.1", label: "Prevalence of undernourishment (%)", unit: "%", direction: "lower_better", sdr_code: "sdg2_undernsh" },
      ]},
      { code: "2.2", description: "End all forms of malnutrition, including stunting and wasting in children under 5", indicators: [
        { code: "2.2.1", label: "Prevalence of stunting in children under 5 (%)", unit: "%", direction: "lower_better", sdr_code: "sdg2_stunting" },
        { code: "2.2.2", label: "Prevalence of wasting in children under 5 (%)", unit: "%", direction: "lower_better", sdr_code: "sdg2_wasting" },
        { code: "2.2.3", label: "Minimum dietary diversity among children 6–23 months (%)", unit: "%", direction: "higher_better", sdr_code: "sdg2_mdd" },
        { code: "2.2.4", label: "Prevalence of obesity, BMI ≥ 30 (% adults)", unit: "%", direction: "lower_better", sdr_code: "sdg2_obesity" },
      ]},
      { code: "2.3", description: "Double agricultural productivity and incomes of small-scale food producers", indicators: [
        { code: "2.3.1", label: "Human Trophic Level (2 best, 3 worst)", unit: "index", direction: "lower_better", sdr_code: "sdg2_trophic" },
      ]},
      { code: "2.4", description: "Ensure sustainable food production systems and resilient agricultural practices", indicators: [
        { code: "2.4.1", label: "Cereal yield (tonnes per hectare)", unit: "t/ha", direction: "higher_better", sdr_code: "sdg2_crlyld" },
        { code: "2.4.2", label: "Sustainable Nitrogen Management Index (0 best, 1.41 worst)", unit: "index", direction: "lower_better", sdr_code: "sdg2_snmi" },
        { code: "2.4.3", label: "Yield gap closure (% of potential yield)", unit: "%", direction: "higher_better", sdr_code: "sdg2_yieldgap" },
      ]},
      { code: "2.5", description: "Maintain genetic diversity of seeds, cultivated plants and farmed animals", indicators: [] },
      { code: "2.a", description: "Increase investment in rural infrastructure and agricultural research", indicators: [
        { code: "2.a.1", label: "Exports of hazardous pesticides (tonnes per million population)", unit: "t/Mpop", direction: "lower_better", sdr_code: "sdg2_pestexp" },
      ]},
      { code: "2.b", description: "Correct and prevent trade restrictions in world agricultural markets", indicators: [] },
      { code: "2.c", description: "Adopt measures to ensure proper functioning of food commodity markets", indicators: [] },
    ],
  },
  {
    goal: 3, title: "Good Health and Well-Being", short: "Good Health", color: "#4C9F38", icon: "❤️",
    description: "Ensure healthy lives and promote well-being for all at all ages. Despite enormous global progress — child mortality has halved since 1990 and HIV infections have fallen — billions still lack access to basic healthcare. Preventable diseases, maternal mortality, mental health crises, and the growing burden of non-communicable diseases demand urgent action. SDG 3 sets targets to end preventable deaths, achieve universal health coverage, combat epidemics including HIV, tuberculosis and malaria, and reduce deaths from road accidents, substance abuse and environmental pollution. Health is foundational to all 17 goals.",
    targets: [
      { code: "3.1", description: "Reduce global maternal mortality ratio to less than 70 per 100,000 live births", indicators: [
        { code: "3.1.1", label: "Maternal mortality ratio (per 100,000 live births)", unit: "/100k", direction: "lower_better", sdr_code: "sdg3_matmort" },
      ]},
      { code: "3.2", description: "End preventable deaths of newborns and children under 5", indicators: [
        { code: "3.2.1", label: "Neonatal mortality rate (per 1,000 live births)", unit: "/1k", direction: "lower_better", sdr_code: "sdg3_neonat" },
        { code: "3.2.2", label: "Mortality rate, under-5 (per 1,000 live births)", unit: "/1k", direction: "lower_better", sdr_code: "sdg3_u5mort" },
      ]},
      { code: "3.3", description: "End epidemics of AIDS, tuberculosis, malaria and neglected tropical diseases", indicators: [
        { code: "3.3.1", label: "Incidence of tuberculosis (per 100,000 population)", unit: "/100k", direction: "lower_better", sdr_code: "sdg3_tb" },
        { code: "3.3.2", label: "New HIV infections (per 1,000 uninfected population)", unit: "/1k", direction: "lower_better", sdr_code: "sdg3_hiv" },
      ]},
      { code: "3.4", description: "Reduce premature mortality from non-communicable diseases by one third", indicators: [
        { code: "3.4.1", label: "Age-standardized death rate: cardiovascular, cancer, diabetes, respiratory (ages 30–70)", unit: "/100k", direction: "lower_better", sdr_code: "sdg3_ncds" },
        { code: "3.4.2", label: "Age-standardized death rate from air pollution", unit: "/100k", direction: "lower_better", sdr_code: "sdg3_pollmort" },
      ]},
      { code: "3.5", description: "Strengthen prevention and treatment of substance abuse", indicators: [] },
      { code: "3.6", description: "Halve the number of global deaths and injuries from road traffic accidents", indicators: [
        { code: "3.6.1", label: "Traffic deaths (per 100,000 population)", unit: "/100k", direction: "lower_better", sdr_code: "sdg3_traffic" },
      ]},
      { code: "3.7", description: "Ensure universal access to sexual and reproductive health-care services", indicators: [
        { code: "3.7.1", label: "Adolescent fertility rate (births per 1,000 females aged 15–19)", unit: "/1k", direction: "lower_better", sdr_code: "sdg3_fertility" },
      ]},
      { code: "3.8", description: "Achieve universal health coverage (UHC)", indicators: [
        { code: "3.8.1", label: "Births attended by skilled health personnel (%)", unit: "%", direction: "higher_better", sdr_code: "sdg3_births" },
        { code: "3.8.2", label: "Surviving infants who received 2 WHO-recommended vaccines (%)", unit: "%", direction: "higher_better", sdr_code: "sdg3_vac" },
        { code: "3.8.3", label: "UHC index of service coverage (0–100)", unit: "index", direction: "higher_better", sdr_code: "sdg3_uhc" },
      ]},
      { code: "3.9", description: "Reduce deaths and illnesses from hazardous chemicals and pollution", indicators: [] },
      { code: "3.a", description: "Strengthen implementation of WHO Framework Convention on Tobacco Control", indicators: [
        { code: "3.a.1", label: "Daily smokers (% of population aged 15+)", unit: "%", direction: "lower_better", sdr_code: "sdg3_smoke" },
      ]},
      { code: "3.b", description: "Support R&D of vaccines and medicines for developing countries", indicators: [] },
      { code: "3.c", description: "Substantially increase health financing and health workforce in developing countries", indicators: [] },
      { code: "3.d", description: "Strengthen capacity for early warning and management of health risks", indicators: [
        { code: "3.d.1", label: "Life expectancy at birth (years)", unit: "years", direction: "higher_better", sdr_code: "sdg3_lifee" },
        { code: "3.d.2", label: "Subjective well-being (ladder score, 0–10)", unit: "score", direction: "higher_better", sdr_code: "sdg3_swb" },
      ]},
    ],
  },
  {
    goal: 4, title: "Quality Education", short: "Education", color: "#C5192D", icon: "📚",
    description: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all. Education is the most powerful driver of sustainable development, yet 244 million children are out of school and 617 million youth lack basic literacy. SDG 4 goes beyond access to demand quality learning outcomes: functional literacy and numeracy, technical skills, global citizenship education, and learning across all life stages. It emphasises eliminating gender disparities, expanding higher education, and ensuring all teachers are trained. Quality education multiplies the impact of every other SDG.",
    targets: [
      { code: "4.1", description: "Ensure all girls and boys complete free, equitable and quality primary and secondary education", indicators: [
        { code: "4.1.1", label: "Net primary enrollment rate (%)", unit: "%", direction: "higher_better", sdr_code: "sdg4_primary" },
        { code: "4.1.2", label: "Lower secondary completion rate (%)", unit: "%", direction: "higher_better", sdr_code: "sdg4_second" },
        { code: "4.1.3", label: "PISA score (0–600)", unit: "score", direction: "higher_better", sdr_code: "sdg4_pisa" },
      ]},
      { code: "4.2", description: "Ensure all children have access to quality early childhood development and pre-primary education", indicators: [
        { code: "4.2.1", label: "Participation rate in pre-primary organized learning (% aged 4–6)", unit: "%", direction: "higher_better", sdr_code: "sdg4_preprim" },
      ]},
      { code: "4.3", description: "Ensure equal access for all to affordable quality technical, vocational and tertiary education", indicators: [
        { code: "4.3.1", label: "Tertiary educational attainment (% aged 25–34)", unit: "%", direction: "higher_better", sdr_code: "sdg4_tertiary" },
      ]},
      { code: "4.4", description: "Substantially increase youth and adults with relevant skills for employment", indicators: [] },
      { code: "4.5", description: "Eliminate gender disparities in education — equal access for all", indicators: [
        { code: "4.5.1", label: "Variation in maths performance explained by socioeconomic status (%)", unit: "%", direction: "lower_better", sdr_code: "sdg4_socioec" },
        { code: "4.5.2", label: "Underachievers in mathematics (% of 15-year-olds)", unit: "%", direction: "lower_better", sdr_code: "sdg4_underach" },
      ]},
      { code: "4.6", description: "Ensure all youth and a substantial proportion of adults achieve literacy and numeracy", indicators: [
        { code: "4.6.1", label: "Literacy rate (% of population aged 15–24)", unit: "%", direction: "higher_better", sdr_code: "sdg4_literacy" },
      ]},
      { code: "4.7", description: "Ensure all learners acquire knowledge and skills needed to promote sustainable development", indicators: [] },
      { code: "4.a", description: "Build and upgrade inclusive and effective learning environments for all", indicators: [] },
      { code: "4.b", description: "Expand scholarships available to developing countries for higher education by 2020", indicators: [] },
      { code: "4.c", description: "Substantially increase qualified teachers in developing countries by 2030", indicators: [] },
    ],
  },
  {
    goal: 5, title: "Gender Equality", short: "Gender Equality", color: "#FF3A21", icon: "⚧",
    description: "Achieve gender equality and empower all women and girls. Women and girls continue to face systemic discrimination, violence, and exclusion from political, economic and social power worldwide. SDG 5 addresses gender-based violence, child marriage, female genital mutilation, and unpaid care work. It calls for equal rights to economic resources, reproductive health and rights, and equal representation in leadership at all levels. Gender equality is not merely a goal in itself — it is a prerequisite for achieving poverty eradication, food security, quality education, and peace.",
    targets: [
      { code: "5.1", description: "End all forms of discrimination against all women and girls everywhere", indicators: [] },
      { code: "5.2", description: "Eliminate all forms of violence against all women and girls", indicators: [] },
      { code: "5.3", description: "Eliminate harmful practices such as child marriage and female genital mutilation", indicators: [] },
      { code: "5.4", description: "Recognize and value unpaid care and domestic work", indicators: [] },
      { code: "5.5", description: "Ensure women's full and effective participation and equal leadership opportunities", indicators: [
        { code: "5.5.1", label: "Demand for family planning satisfied by modern methods (% females 15–49)", unit: "%", direction: "higher_better", sdr_code: "sdg5_familypl" },
        { code: "5.5.2", label: "Ratio of female-to-male mean years of education (%)", unit: "%", direction: "higher_better", sdr_code: "sdg5_edat" },
        { code: "5.5.3", label: "Ratio of female-to-male labor force participation (%)", unit: "%", direction: "higher_better", sdr_code: "sdg5_lfpr" },
        { code: "5.5.4", label: "Seats held by women in national parliament (%)", unit: "%", direction: "higher_better", sdr_code: "sdg5_parl" },
        { code: "5.5.5", label: "Gender wage gap (% of male median wage)", unit: "%", direction: "lower_better", sdr_code: "sdg5_paygap" },
      ]},
      { code: "5.6", description: "Ensure universal access to sexual and reproductive health and reproductive rights", indicators: [] },
      { code: "5.a", description: "Give women equal rights to economic resources, land and financial services", indicators: [] },
      { code: "5.b", description: "Enhance use of enabling technology to promote women's empowerment", indicators: [] },
      { code: "5.c", description: "Adopt and strengthen policies for gender equality and empowerment of women", indicators: [] },
    ],
  },
  {
    goal: 6, title: "Clean Water and Sanitation", short: "Clean Water", color: "#26BDE2", icon: "💧",
    description: "Ensure availability and sustainable management of water and sanitation for all. Water is life, yet 2.2 billion people lack safe drinking water and 4.2 billion lack safely managed sanitation. Water scarcity affects 40% of the global population and is projected to worsen under climate change. SDG 6 calls for universal access to safe and affordable drinking water, ending open defecation, protecting water-related ecosystems, and implementing integrated water resource management. Achieving SDG 6 requires cross-border cooperation on shared water systems and massive investment in water infrastructure.",
    targets: [
      { code: "6.1", description: "Achieve universal and equitable access to safe and affordable drinking water for all", indicators: [
        { code: "6.1.1", label: "Population using at least basic drinking water services (%)", unit: "%", direction: "higher_better", sdr_code: "sdg6_water" },
        { code: "6.1.2", label: "Population using safely managed water services (%)", unit: "%", direction: "higher_better", sdr_code: "sdg6_safewat" },
      ]},
      { code: "6.2", description: "Achieve access to adequate and equitable sanitation and hygiene for all, end open defecation", indicators: [
        { code: "6.2.1", label: "Population using at least basic sanitation services (%)", unit: "%", direction: "higher_better", sdr_code: "sdg6_sanita" },
        { code: "6.2.2", label: "Population using safely managed sanitation services (%)", unit: "%", direction: "higher_better", sdr_code: "sdg6_safesan" },
      ]},
      { code: "6.3", description: "Improve water quality by reducing pollution and minimizing hazardous chemicals", indicators: [
        { code: "6.3.1", label: "Anthropogenic wastewater that receives treatment (%)", unit: "%", direction: "higher_better", sdr_code: "sdg6_wastewat" },
      ]},
      { code: "6.4", description: "Substantially increase water-use efficiency and address water scarcity", indicators: [
        { code: "6.4.1", label: "Freshwater withdrawal (% of available freshwater resources)", unit: "%", direction: "lower_better", sdr_code: "sdg6_freshwat" },
        { code: "6.4.2", label: "Scarce water consumption embodied in imports (m³/capita)", unit: "m³/cap", direction: "lower_better", sdr_code: "sdg6_scarcew" },
      ]},
      { code: "6.5", description: "Implement integrated water resources management at all levels", indicators: [] },
      { code: "6.6", description: "Protect and restore water-related ecosystems by 2020", indicators: [] },
      { code: "6.a", description: "Expand international cooperation in water- and sanitation-related activities", indicators: [] },
      { code: "6.b", description: "Support participation of local communities in water and sanitation management", indicators: [] },
    ],
  },
  {
    goal: 7, title: "Affordable and Clean Energy", short: "Clean Energy", color: "#FCC30B", icon: "⚡",
    description: "Ensure access to affordable, reliable, sustainable and modern energy for all. Energy underpins virtually every aspect of development — health, education, food security, climate change, and economic growth. Yet 675 million people still lack electricity and 2.3 billion rely on polluting cooking fuels. SDG 7 targets universal access to modern energy by 2030, doubling the rate of energy efficiency improvement, and substantially increasing the share of renewable energy in the global energy mix. The clean energy transition is also the largest economic opportunity of the 21st century.",
    targets: [
      { code: "7.1", description: "Ensure universal access to affordable, reliable and modern energy services by 2030", indicators: [
        { code: "7.1.1", label: "Population with access to electricity (%)", unit: "%", direction: "higher_better", sdr_code: "sdg7_elecac" },
        { code: "7.1.2", label: "Population with access to clean fuels for cooking (%)", unit: "%", direction: "higher_better", sdr_code: "sdg7_cleanfuel" },
      ]},
      { code: "7.2", description: "Increase substantially the share of renewable energy in the global energy mix by 2030", indicators: [
        { code: "7.2.1", label: "Renewable energy share in total final energy consumption (%)", unit: "%", direction: "higher_better", sdr_code: "sdg7_renewcon" },
        { code: "7.2.2", label: "CO₂ emissions from fuel combustion per electricity output (MtCO₂/TWh)", unit: "MtCO₂/TWh", direction: "lower_better", sdr_code: "sdg7_co2twh" },
      ]},
      { code: "7.3", description: "Double the global rate of improvement in energy efficiency by 2030", indicators: [] },
      { code: "7.a", description: "Enhance international cooperation to facilitate access to clean energy", indicators: [] },
      { code: "7.b", description: "Expand infrastructure for modern and sustainable energy in developing countries", indicators: [] },
    ],
  },
  {
    goal: 8, title: "Decent Work and Economic Growth", short: "Decent Work", color: "#A21942", icon: "💼",
    description: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all. The global economy must create 600 million jobs by 2030 for a growing workforce, while also improving conditions for the 2 billion workers in informal employment. SDG 8 calls for higher productivity, resource efficiency, and technological upgrading; an end to forced labour, modern slavery and child labour; equal pay for work of equal value; and protection of labour rights. It links economic growth explicitly to environmental sustainability — emphasising that growth must be decoupled from ecological degradation.",
    targets: [
      { code: "8.1", description: "Sustain per capita economic growth — at least 7% GDP growth per annum in LDCs", indicators: [
        { code: "8.1.1", label: "Adjusted GDP growth index (0–100)", unit: "index", direction: "higher_better", sdr_code: "sdg8_adjgrowthi" },
      ]},
      { code: "8.2", description: "Achieve higher levels of economic productivity through diversification and innovation", indicators: [] },
      { code: "8.3", description: "Promote development-oriented policies supporting productive activities and decent job creation", indicators: [] },
      { code: "8.4", description: "Improve global resource efficiency in consumption and production", indicators: [] },
      { code: "8.5", description: "Achieve full and productive employment and decent work for all by 2030", indicators: [
        { code: "8.5.1", label: "Unemployment rate (% of total labor force)", unit: "%", direction: "lower_better", sdr_code: "sdg8_unemp" },
        { code: "8.5.2", label: "Employment-to-population ratio (%)", unit: "%", direction: "higher_better", sdr_code: "sdg8_empop" },
        { code: "8.5.3", label: "Youth not in employment, education or training — NEET (% aged 15–29)", unit: "%", direction: "lower_better", sdr_code: "sdg8_yneet" },
      ]},
      { code: "8.6", description: "Substantially reduce the proportion of youth not in employment, education or training by 2020", indicators: [] },
      { code: "8.7", description: "Eradicate forced labour, end modern slavery and human trafficking; end child labour by 2025", indicators: [
        { code: "8.7.1", label: "Victims of modern slavery (per 1,000 population)", unit: "/1k", direction: "lower_better", sdr_code: "sdg8_slavery" },
      ]},
      { code: "8.8", description: "Protect labour rights and promote safe and secure working environments for all workers", indicators: [
        { code: "8.8.1", label: "Fundamental labor rights effectively guaranteed (0–1)", unit: "0–1", direction: "higher_better", sdr_code: "sdg8_rights" },
        { code: "8.8.2", label: "Fatal work accidents embodied in imports (per million population)", unit: "/Mpop", direction: "lower_better", sdr_code: "sdg8_impacc" },
      ]},
      { code: "8.9", description: "Devise and implement policies to promote sustainable tourism that creates jobs", indicators: [] },
      { code: "8.10", description: "Strengthen domestic financial institutions to expand access to banking and financial services", indicators: [
        { code: "8.10.1", label: "Adults with a bank or financial account (%)", unit: "%", direction: "higher_better", sdr_code: "sdg8_accounts" },
      ]},
      { code: "8.a", description: "Increase Aid for Trade support for developing countries", indicators: [] },
      { code: "8.b", description: "Develop and implement a global strategy for youth employment by 2020", indicators: [] },
    ],
  },
  {
    goal: 9, title: "Industry, Innovation and Infrastructure", short: "Industry", color: "#FD6925", icon: "🏭",
    description: "Build resilient infrastructure, promote inclusive and sustainable industrialisation and foster innovation. Lack of infrastructure is a fundamental barrier to development — 1 billion people lack access to reliable electricity, roads, water and telecommunications. SDG 9 calls for investment in resilient and sustainable infrastructure, the upgrading of industries for greater resource-use efficiency, increased access to financial services for small enterprises, and expanded internet connectivity. Innovation and R&D are central: the goal sets targets for research expenditure and researcher density that correlate directly with long-term prosperity.",
    targets: [
      { code: "9.1", description: "Develop quality, reliable, sustainable and resilient infrastructure", indicators: [
        { code: "9.1.1", label: "Rural population with access to all-season roads (%)", unit: "%", direction: "higher_better", sdr_code: "sdg9_roads" },
        { code: "9.1.2", label: "Logistics Performance Index: Infrastructure score (1–5)", unit: "score", direction: "higher_better", sdr_code: "sdg9_lpi" },
      ]},
      { code: "9.2", description: "Promote inclusive and sustainable industrialization — double in LDCs by 2030", indicators: [] },
      { code: "9.3", description: "Increase access of small-scale enterprises to financial services and value chains", indicators: [] },
      { code: "9.4", description: "Upgrade infrastructure and retrofit industries to make them sustainable by 2030", indicators: [] },
      { code: "9.5", description: "Enhance scientific research and upgrade technological capabilities by 2030", indicators: [
        { code: "9.5.1", label: "Articles published in academic journals (per 1,000 population)", unit: "/1k", direction: "higher_better", sdr_code: "sdg9_articles" },
        { code: "9.5.2", label: "Expenditure on R&D (% of GDP)", unit: "%", direction: "higher_better", sdr_code: "sdg9_rdex" },
        { code: "9.5.3", label: "Total patent applications (per million population)", unit: "/Mpop", direction: "higher_better", sdr_code: "sdg9_patents" },
        { code: "9.5.4", label: "Top 3 universities average score (Times Higher Ed)", unit: "score", direction: "higher_better", sdr_code: "sdg9_uni" },
      ]},
      { code: "9.a", description: "Facilitate sustainable infrastructure development in developing countries", indicators: [] },
      { code: "9.b", description: "Support domestic technology development and research in developing countries", indicators: [] },
      { code: "9.c", description: "Significantly increase access to ICT and provide universal internet in LDCs by 2020", indicators: [
        { code: "9.c.1", label: "Population using the internet (%)", unit: "%", direction: "higher_better", sdr_code: "sdg9_intuse" },
        { code: "9.c.2", label: "Mobile broadband subscriptions (per 100 population)", unit: "/100", direction: "higher_better", sdr_code: "sdg9_mobuse" },
      ]},
    ],
  },
  {
    goal: 10, title: "Reduced Inequalities", short: "Inequalities", color: "#DD1367", icon: "🤝",
    description: "Reduce inequality within and among countries. Despite progress on poverty, inequality is rising in many nations, and wealth disparities between the richest and poorest countries remain extreme. SDG 10 addresses income inequality, social inequality (race, gender, disability, migration status), and structural inequalities in global finance and trade. It calls for progressive taxation, social protection floors, safe migration pathways, improved representation of developing countries in international institutions, and regulation of financial markets. Inequality undermines social cohesion and makes all other SDGs harder to achieve.",
    targets: [
      { code: "10.1", description: "By 2030, progressively achieve income growth for the bottom 40% at a higher rate than national average", indicators: [
        { code: "10.1.1", label: "Gini coefficient", unit: "index", direction: "lower_better", sdr_code: "sdg10_gini" },
        { code: "10.1.2", label: "Palma ratio (income of top 10% / bottom 40%)", unit: "ratio", direction: "lower_better", sdr_code: "sdg10_palma" },
        { code: "10.1.3", label: "Elderly poverty rate (% of population aged 66+)", unit: "%", direction: "lower_better", sdr_code: "sdg10_elder" },
      ]},
      { code: "10.2", description: "Reduce inequality within and among countries. Despite progress on poverty, inequality is rising in many nations, and wealth disparities between the richest and poorest countries remain extreme. SDG 10 addresses income inequality, social inequality (race, gender, disability, migration status), and structural inequalities in global finance and trade. It calls for progressive taxation, social protection floors, safe migration pathways, improved representation of developing countries in international institutions, and regulation of financial markets. Inequality undermines social cohesion and makes all other SDGs harder to achieve.", indicators: [] },
      { code: "10.3", description: "Ensure equal opportunity and reduce inequalities of outcome", indicators: [] },
      { code: "10.4", description: "Adopt fiscal, wage and social protection policies for greater equality", indicators: [] },
      { code: "10.5", description: "Improve regulation and monitoring of global financial markets", indicators: [] },
      { code: "10.6", description: "Ensure enhanced representation for developing countries in global institutions", indicators: [] },
      { code: "10.7", description: "Facilitate orderly, safe, regular and responsible migration", indicators: [] },
      { code: "10.a", description: "Implement special and differential treatment for developing countries in WTO agreements", indicators: [] },
      { code: "10.b", description: "Encourage ODA and financial flows to states where the need is greatest", indicators: [] },
      { code: "10.c", description: "Reduce transaction costs of migrant remittances to less than 3% by 2030", indicators: [] },
    ],
  },
  {
    goal: 11, title: "Sustainable Cities and Communities", short: "Sust. Cities", color: "#FD9D24", icon: "🏙️",
    description: "Make cities and human settlements inclusive, safe, resilient and sustainable. Over 4 billion people live in cities today — a number set to reach 5 billion by 2030. Rapid urbanisation brings opportunity but also slums, air pollution, traffic congestion, and climate vulnerability. SDG 11 calls for affordable housing, safe public transport, inclusive urban planning, protection of cultural heritage, and disaster risk reduction. Sustainable cities are compact, low-emission, walkable, and connected — they are laboratories for the broader sustainability transition. Urban policy decisions made today will lock in patterns for decades.",
    targets: [
      { code: "11.1", description: "By 2030, ensure access to adequate, safe and affordable housing and upgrade slums", indicators: [
        { code: "11.1.1", label: "Proportion of urban population living in slums (%)", unit: "%", direction: "lower_better", sdr_code: "sdg11_slums" },
        { code: "11.1.2", label: "Access to improved water source, piped (% of urban population)", unit: "%", direction: "higher_better", sdr_code: "sdg11_pipedwat" },
        { code: "11.1.3", label: "Population with rent overburden (%)", unit: "%", direction: "lower_better", sdr_code: "sdg11_rentover" },
      ]},
      { code: "11.2", description: "Provide access to safe, affordable, accessible and sustainable transport for all by 2030", indicators: [
        { code: "11.2.1", label: "Population with convenient access to public transport in cities (%)", unit: "%", direction: "higher_better", sdr_code: "sdg11_transport" },
        { code: "11.2.2", label: "Urban population with access to points of interest within 15min walk (%)", unit: "%", direction: "higher_better", sdr_code: "sdg11_urbaccess" },
      ]},
      { code: "11.3", description: "Enhance inclusive and sustainable urbanization and participatory human settlement planning", indicators: [] },
      { code: "11.4", description: "Strengthen efforts to protect and safeguard the world's cultural and natural heritage", indicators: [] },
      { code: "11.5", description: "Significantly reduce deaths and economic losses from disasters by 2030", indicators: [] },
      { code: "11.6", description: "Reduce the adverse per capita environmental impact of cities — air quality and waste", indicators: [
        { code: "11.6.1", label: "Annual mean concentration of PM2.5 (μg/m³)", unit: "μg/m³", direction: "lower_better", sdr_code: "sdg11_pm25" },
      ]},
      { code: "11.7", description: "Provide universal access to safe, inclusive and accessible green and public spaces by 2030", indicators: [] },
      { code: "11.a", description: "Support positive economic, social and environmental links between urban and rural areas", indicators: [] },
      { code: "11.b", description: "Substantially increase cities adopting disaster risk reduction policies by 2020", indicators: [] },
      { code: "11.c", description: "Support LDCs in building sustainable and resilient buildings", indicators: [] },
    ],
  },
  {
    goal: 12, title: "Responsible Consumption and Production", short: "Consumption", color: "#BF8B2E", icon: "♻️",
    description: "Ensure sustainable consumption and production patterns. Current consumption patterns are driving planetary overshoot: the global economy uses 1.7 Earths' worth of resources each year. SDG 12 calls for a fundamental shift in how goods and services are produced and consumed: sustainable public procurement, halving per-capita food waste, sound chemicals management, reducing fossil fuel subsidies, and ensuring companies report on sustainability impacts. It also emphasises the role of education and consumer awareness. A circular economy — one that eliminates waste and keeps materials in use — is central to SDG 12's vision.",
    targets: [
      { code: "12.1", description: "Implement the 10-Year Framework of Programmes on Sustainable Consumption and Production", indicators: [] },
      { code: "12.2", description: "Achieve sustainable management and efficient use of natural resources by 2030", indicators: [
        { code: "12.2.1", label: "Municipal solid waste (kg/capita/day)", unit: "kg/cap/day", direction: "lower_better", sdr_code: "sdg12_msw" },
        { code: "12.2.2", label: "Electronic waste not recollected (kg/capita)", unit: "kg/cap", direction: "lower_better", sdr_code: "sdg12_ewaste" },
        { code: "12.2.3", label: "Production-based air pollution (DALYs per 1,000 population)", unit: "DALYs/1k", direction: "lower_better", sdr_code: "sdg12_pollprod" },
        { code: "12.2.4", label: "Production-based nitrogen emissions (kg/capita)", unit: "kg/cap", direction: "lower_better", sdr_code: "sdg12_nprod" },
      ]},
      { code: "12.3", description: "Halve per capita global food waste at retail and consumer levels by 2030", indicators: [] },
      { code: "12.4", description: "Achieve environmentally sound management of chemicals and all wastes by 2020", indicators: [
        { code: "12.4.1", label: "Air pollution associated with imports (DALYs per 1,000 population)", unit: "DALYs/1k", direction: "lower_better", sdr_code: "sdg12_pollimp" },
        { code: "12.4.2", label: "Nitrogen emissions associated with imports (kg/capita)", unit: "kg/cap", direction: "lower_better", sdr_code: "sdg12_nimport" },
        { code: "12.4.3", label: "Exports of plastic waste (kg/capita)", unit: "kg/cap", direction: "lower_better", sdr_code: "sdg12_explastic" },
      ]},
      { code: "12.5", description: "Substantially reduce waste generation through prevention, recycling and reuse", indicators: [
        { code: "12.5.1", label: "Non-recycled municipal solid waste (kg/capita/day)", unit: "kg/cap/day", direction: "lower_better", sdr_code: "sdg12_mswrecycl" },
      ]},
      { code: "12.6", description: "Encourage companies to adopt sustainable practices and integrate sustainability reporting", indicators: [] },
      { code: "12.7", description: "Promote sustainable public procurement practices", indicators: [] },
      { code: "12.8", description: "Ensure people everywhere have information and awareness for sustainable development", indicators: [] },
      { code: "12.a", description: "Support developing countries to strengthen scientific and technological capacity", indicators: [] },
      { code: "12.b", description: "Develop tools to monitor sustainable development impacts for sustainable tourism", indicators: [] },
      { code: "12.c", description: "Rationalize inefficient fossil-fuel subsidies", indicators: [] },
    ],
  },
  {
    goal: 13, title: "Climate Action", short: "Climate", color: "#3F7E44", icon: "🌍",
    description: "Take urgent action to combat climate change and its impacts. The climate crisis is the defining challenge of our time. Global temperatures have already risen 1.2°C above pre-industrial levels; without rapid action, we are on track for catastrophic warming. SDG 13 calls for urgent mitigation — deep cuts in greenhouse gas emissions — and adaptation: strengthening resilience and adaptive capacity in vulnerable communities. It commits developed countries to mobilise $100 billion per year in climate finance for developing nations. SDG 13 is inextricably linked to nearly every other goal: climate change is simultaneously a cause and consequence of poverty, hunger, inequality, and conflict.",
    targets: [
      { code: "13.1", description: "Strengthen resilience and adaptive capacity to climate-related hazards and natural disasters", indicators: [] },
      { code: "13.2", description: "Integrate climate change measures into national policies, strategies and planning", indicators: [
        { code: "13.2.1", label: "CO₂ emissions from fossil fuel combustion and cement (tCO₂/capita)", unit: "tCO₂/cap", direction: "lower_better", sdr_code: "sdg13_co2gcp" },
        { code: "13.2.2", label: "GHG emissions embodied in imports (tCO₂/capita)", unit: "tCO₂/cap", direction: "lower_better", sdr_code: "sdg13_ghgimport" },
        { code: "13.2.3", label: "CO₂ emissions embodied in fossil fuel exports (tonnes/capita)", unit: "t/cap", direction: "lower_better", sdr_code: "sdg13_co2export" },
        { code: "13.2.4", label: "Carbon Pricing Score at EUR60/tCO₂ (%)", unit: "%", direction: "higher_better", sdr_code: "sdg13_ecr" },
      ]},
      { code: "13.3", description: "Improve education, awareness-raising and institutional capacity on climate change", indicators: [] },
      { code: "13.a", description: "Implement commitment by developed countries to mobilize $100 billion annually by 2020", indicators: [] },
      { code: "13.b", description: "Promote mechanisms for effective climate change planning in LDCs and SIDS", indicators: [] },
    ],
  },
  {
    goal: 14, title: "Life Below Water", short: "Life Water", color: "#0A97D9", icon: "🌊",
    description: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development. Oceans cover 71% of the Earth's surface, produce half our oxygen, and support the livelihoods of over 3 billion people. Yet they face unprecedented threats: overfishing, plastic pollution, ocean acidification, and habitat destruction. SDG 14 targets the elimination of illegal, unreported and unregulated fishing; protection of coastal and marine areas; reduction of ocean acidification; and ending harmful subsidies that drive overfishing. Healthy oceans are essential for climate regulation, food security, and the cultures of coastal and island communities worldwide.",
    targets: [
      { code: "14.1", description: "Prevent and significantly reduce marine pollution by 2025", indicators: [] },
      { code: "14.2", description: "Sustainably manage and protect marine and coastal ecosystems by 2020", indicators: [] },
      { code: "14.3", description: "Minimize and address the impacts of ocean acidification", indicators: [] },
      { code: "14.4", description: "Effectively regulate harvesting and end overfishing by 2020", indicators: [
        { code: "14.4.1", label: "Fish caught from overexploited or collapsed stocks (% of total catch)", unit: "%", direction: "lower_better", sdr_code: "sdg14_fishstocks" },
        { code: "14.4.2", label: "Fish caught by trawling or dredging (%)", unit: "%", direction: "lower_better", sdr_code: "sdg14_trawl" },
        { code: "14.4.3", label: "Fish caught that are then discarded (%)", unit: "%", direction: "lower_better", sdr_code: "sdg14_discard" },
      ]},
      { code: "14.5", description: "Conserve at least 10% of coastal and marine areas by 2020", indicators: [
        { code: "14.5.1", label: "Mean area protected in marine sites important to biodiversity (%)", unit: "%", direction: "higher_better", sdr_code: "sdg14_cpma" },
        { code: "14.5.2", label: "Ocean Health Index: Clean Waters score (0–100)", unit: "score", direction: "higher_better", sdr_code: "sdg14_cleanwat" },
      ]},
      { code: "14.6", description: "Prohibit certain forms of fisheries subsidies contributing to overfishing by 2020", indicators: [] },
      { code: "14.7", description: "Increase economic benefits to SIDS and LDCs from sustainable use of marine resources", indicators: [
        { code: "14.7.1", label: "Marine biodiversity threats embodied in imports (per million population)", unit: "/Mpop", direction: "lower_better", sdr_code: "sdg14_biomar" },
      ]},
      { code: "14.a", description: "Increase scientific knowledge and develop research capacity for ocean health", indicators: [] },
      { code: "14.b", description: "Provide access for small-scale artisanal fishers to marine resources and markets", indicators: [] },
      { code: "14.c", description: "Enhance conservation and sustainable use of oceans through international law", indicators: [] },
    ],
  },
  {
    goal: 15, title: "Life on Land", short: "Life Land", color: "#56C02B", icon: "🌳",
    description: "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt biodiversity loss. Forests cover 30% of Earth's surface, host 80% of terrestrial biodiversity, and regulate water cycles and the climate. Yet 13 million hectares of forest are lost annually. SDG 15 calls for halting deforestation, restoring degraded land, combating desertification, ending poaching and trafficking of protected species, and mobilising finance for biodiversity conservation. Biodiversity loss is not a peripheral issue — it is an existential threat to food security, medicine, clean water, and the stability of the biosphere.",
    targets: [
      { code: "15.1", description: "Ensure conservation of terrestrial and inland freshwater ecosystems by 2020", indicators: [
        { code: "15.1.1", label: "Mean area protected in terrestrial sites important to biodiversity (%)", unit: "%", direction: "higher_better", sdr_code: "sdg15_cpta" },
        { code: "15.1.2", label: "Mean area protected in freshwater sites important to biodiversity (%)", unit: "%", direction: "higher_better", sdr_code: "sdg15_cpfa" },
      ]},
      { code: "15.2", description: "Promote sustainable management of all types of forests and halt deforestation by 2020", indicators: [
        { code: "15.2.1", label: "Permanent deforestation (% of forest area, 3-year avg)", unit: "%/yr", direction: "lower_better", sdr_code: "sdg15_forchg" },
        { code: "15.2.2", label: "Imported deforestation (m²/capita)", unit: "m²/cap", direction: "lower_better", sdr_code: "sdg15_impdefor" },
      ]},
      { code: "15.3", description: "Combat desertification and restore degraded land and soil by 2030", indicators: [] },
      { code: "15.4", description: "Ensure conservation of mountain ecosystems by 2030", indicators: [] },
      { code: "15.5", description: "Take urgent action to reduce degradation of natural habitats and halt biodiversity loss", indicators: [
        { code: "15.5.1", label: "Red List Index of species survival (0–1, best=1)", unit: "0–1", direction: "higher_better", sdr_code: "sdg15_redlist" },
      ]},
      { code: "15.6", description: "Promote fair and equitable sharing of benefits from genetic resources", indicators: [] },
      { code: "15.7", description: "Take urgent action to end poaching and trafficking of protected species", indicators: [] },
      { code: "15.8", description: "Prevent the introduction and reduce impacts of invasive alien species by 2020", indicators: [] },
      { code: "15.9", description: "Integrate ecosystem and biodiversity values into national planning by 2020", indicators: [] },
      { code: "15.a", description: "Mobilize financial resources from all sources to conserve biodiversity and ecosystems", indicators: [] },
      { code: "15.b", description: "Mobilize resources for sustainable forest management and conservation", indicators: [] },
      { code: "15.c", description: "Enhance global support to combat poaching and trafficking of protected species", indicators: [] },
    ],
  },
  {
    goal: 16, title: "Peace, Justice and Strong Institutions", short: "Peace & Justice", color: "#00689D", icon: "⚖️",
    description: "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels. Conflict, violence, and weak governance are among the greatest barriers to development. Over 2 billion people live in fragile or conflict-affected states. SDG 16 calls for significant reduction in all forms of violence, end to abuse and trafficking of children, rule of law and equal access to justice, reduction of illicit financial flows and corruption, transparent and accountable institutions, and inclusive decision-making. Peace and justice are not the end-state of development — they are prerequisites for it.",
    targets: [
      { code: "16.1", description: "Significantly reduce all forms of violence and related death rates everywhere", indicators: [
        { code: "16.1.1", label: "Homicides (per 100,000 population)", unit: "/100k", direction: "lower_better", sdr_code: "sdg16_homicides" },
        { code: "16.1.2", label: "Crime is effectively controlled (0–1, best=1)", unit: "0–1", direction: "higher_better", sdr_code: "sdg16_security" },
      ]},
      { code: "16.2", description: "End abuse, exploitation, trafficking and all forms of violence against children", indicators: [] },
      { code: "16.3", description: "Promote the rule of law and ensure equal access to justice for all", indicators: [
        { code: "16.3.1", label: "Unsentenced detainees (% of prison population)", unit: "%", direction: "lower_better", sdr_code: "sdg16_detain" },
        { code: "16.3.2", label: "Access to and affordability of justice (0–1, best=1)", unit: "0–1", direction: "higher_better", sdr_code: "sdg16_justice" },
      ]},
      { code: "16.4", description: "Significantly reduce illicit financial and arms flows and combat organized crime by 2030", indicators: [
        { code: "16.4.1", label: "Exports of major conventional weapons (TIV million USD / 100k pop)", unit: "/100k", direction: "lower_better", sdr_code: "sdg16_weaponsexp" },
      ]},
      { code: "16.5", description: "Substantially reduce corruption and bribery in all their forms", indicators: [
        { code: "16.5.1", label: "Corruption Perceptions Index (0–100, best=100)", unit: "0–100", direction: "higher_better", sdr_code: "sdg16_cpi" },
      ]},
      { code: "16.6", description: "Develop effective, accountable and transparent institutions at all levels", indicators: [
        { code: "16.6.1", label: "Timeliness of administrative proceedings (0–1, best=1)", unit: "0–1", direction: "higher_better", sdr_code: "sdg16_admin" },
        { code: "16.6.2", label: "Expropriations are lawful and compensated (0–1, best=1)", unit: "0–1", direction: "higher_better", sdr_code: "sdg16_exprop" },
        { code: "16.6.3", label: "Persons held in prison (per 100,000 population)", unit: "/100k", direction: "lower_better", sdr_code: "sdg16_prison" },
      ]},
      { code: "16.7", description: "Ensure responsive, inclusive, participatory and representative decision making at all levels", indicators: [] },
      { code: "16.8", description: "Broaden participation of developing countries in global governance institutions", indicators: [] },
      { code: "16.9", description: "Provide legal identity for all, including birth registration, by 2030", indicators: [
        { code: "16.9.1", label: "Birth registrations with civil authority (% of children under 5)", unit: "%", direction: "higher_better", sdr_code: "sdg16_u5reg" },
        { code: "16.9.2", label: "Children involved in child labor (%)", unit: "%", direction: "lower_better", sdr_code: "sdg16_clabor" },
      ]},
      { code: "16.10", description: "Ensure public access to information and protect fundamental freedoms", indicators: [
        { code: "16.10.1", label: "Press Freedom Index (0–100, best=100)", unit: "0–100", direction: "higher_better", sdr_code: "sdg16_rsf" },
      ]},
      { code: "16.a", description: "Strengthen national institutions to prevent violence and combat terrorism", indicators: [] },
      { code: "16.b", description: "Promote and enforce non-discriminatory laws and policies for sustainable development", indicators: [] },
    ],
  },
  {
    goal: 17, title: "Partnerships for the Goals", short: "Partnerships", color: "#19486A", icon: "🌐",
    description: "Strengthen the means of implementation and revitalize the global partnership for sustainable development. The 2030 Agenda cannot be achieved by any country or sector acting alone. SDG 17 is the 'goals' goal — it calls for the system-level changes needed to make the other 16 possible: financing for development, technology transfer, capacity building, trade reform, and systemic issues of global economic governance. It specifically calls for developed countries to meet their official development assistance commitments, reduce developing-country debt, promote an open trading system, and share technology on favourable terms. Multi-stakeholder partnerships are central to SDG 17's implementation framework.",
    targets: [
      { code: "17.1", description: "Strengthen domestic resource mobilization for tax and other revenue collection", indicators: [
        { code: "17.1.1", label: "Government spending on health and education (% of GDP)", unit: "%", direction: "higher_better", sdr_code: "sdg17_govex" },
      ]},
      { code: "17.2", description: "Developed countries to fully implement ODA commitments (0.7% of GNI)", indicators: [
        { code: "17.2.1", label: "International concessional public finance for developing countries (% of GNI)", unit: "%", direction: "higher_better", sdr_code: "sdg17_oda" },
      ]},
      { code: "17.3", description: "Mobilize additional financial resources for developing countries from multiple sources", indicators: [
        { code: "17.3.1", label: "Government revenue excluding grants (% of GDP)", unit: "%", direction: "higher_better", sdr_code: "sdg17_govrev" },
      ]},
      { code: "17.4", description: "Assist developing countries in attaining long-term debt sustainability", indicators: [] },
      { code: "17.5", description: "Adopt investment promotion regimes for LDCs", indicators: [] },
      { code: "17.6", description: "Enhance North-South, South-South cooperation on science, technology and innovation", indicators: [] },
      { code: "17.7", description: "Promote development, transfer and dissemination of environmentally sound technologies", indicators: [] },
      { code: "17.8", description: "Fully operationalize the technology bank and STI capacity-building for LDCs by 2017", indicators: [
        { code: "17.8.1", label: "Statistical Performance Index (0–100)", unit: "0–100", direction: "higher_better", sdr_code: "sdg17_statperf" },
      ]},
      { code: "17.9", description: "Enhance international support for capacity-building in developing countries", indicators: [] },
      { code: "17.10", description: "Promote a universal, rules-based, open multilateral trading system under WTO", indicators: [] },
      { code: "17.11", description: "Significantly increase exports of developing countries, doubling LDC share by 2020", indicators: [] },
      { code: "17.12", description: "Realize duty-free and quota-free market access for all LDCs", indicators: [] },
      { code: "17.13", description: "Enhance global macroeconomic stability through policy coordination", indicators: [] },
      { code: "17.14", description: "Enhance policy coherence for sustainable development", indicators: [] },
      { code: "17.15", description: "Respect each country's policy space to implement policies for poverty eradication", indicators: [] },
      { code: "17.16", description: "Enhance the Global Partnership for Sustainable Development with multi-stakeholder partnerships", indicators: [] },
      { code: "17.17", description: "Encourage and promote effective public-private and civil society partnerships", indicators: [] },
      { code: "17.18", description: "Enhance capacity-building support for high-quality, timely data disaggregation by 2020", indicators: [
        { code: "17.18.1", label: "Index of countries' support to UN-based multilateralism (0–100)", unit: "0–100", direction: "higher_better", sdr_code: "sdg17_multilat" },
      ]},
      { code: "17.19", description: "Build on existing initiatives to develop measurements of progress on sustainable development", indicators: [
        { code: "17.19.1", label: "Corporate Tax Haven Score (0–100, best=0)", unit: "0–100", direction: "lower_better", sdr_code: "sdg17_cohaven" },
        { code: "17.19.2", label: "Financial Secrecy Score (0–100, best=0)", unit: "0–100", direction: "lower_better", sdr_code: "sdg17_secrecy" },
      ]},
    ],
  },
];
