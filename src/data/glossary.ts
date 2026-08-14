/** SYNTHETIC DEMO DATA — plain-language definitions for the assistant. */
export interface GlossaryEntry {
  term: string
  definition: string
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Hematocrit',
    definition:
      'The proportion of blood volume made up of red blood cells, expressed as a percentage.',
  },
  {
    term: 'Hemoglobin',
    definition:
      'The oxygen-carrying protein inside red blood cells. Low values indicate anaemia.',
  },
  {
    term: 'Platelet',
    definition:
      'Cell fragments that enable clotting. Low counts are described as thrombocytopenia.',
  },
  {
    term: 'WBC',
    definition:
      'White blood cell count — the immune cells that fight infection. Low counts are called leukopenia.',
  },
  {
    term: 'RBC',
    definition: 'Red blood cell count — the cells that transport oxygen around the body.',
  },
  {
    term: 'Neutropenia',
    definition:
      'An abnormally low neutrophil count, raising infection risk. A common effect of chemotherapy.',
  },
  {
    term: 'Pancytopenia',
    definition: 'A reduction across all three blood cell lines: red cells, white cells and platelets.',
  },
  {
    term: 'Nadir',
    definition:
      'The point in a treatment cycle when blood counts reach their lowest level, typically 7–14 days after administration.',
  },
  {
    term: 'Reference range',
    definition:
      'The span of values expected in a healthy population. Results outside it are flagged for review.',
  },
  {
    term: 'Cycle',
    definition:
      'One round of a treatment regimen, followed by a recovery period before the next round begins.',
  },
]
