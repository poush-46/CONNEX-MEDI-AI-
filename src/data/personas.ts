import type { HcpPersona } from '@/types/clinical'

/** SYNTHETIC DEMO DATA — fictional clinicians. */
export const PERSONAS: HcpPersona[] = [
  {
    id: 'DEMO-HCP-01',
    name: 'Dr. Amara Okonkwo',
    credentials: 'MD, PhD',
    specialty: 'Medical Oncology',
    institution: 'Riverbend Cancer Centre',
    initials: 'AO',
  },
  {
    id: 'DEMO-HCP-02',
    name: 'Dr. Ravi Deshmukh',
    credentials: 'MBBS, MD',
    specialty: 'Haematology',
    institution: 'Riverbend Cancer Centre',
    initials: 'RD',
  },
  {
    id: 'DEMO-HCP-03',
    name: 'Lena Fischer',
    credentials: 'RN, OCN',
    specialty: 'Nurse Navigator',
    institution: 'Riverbend Cancer Centre',
    initials: 'LF',
  },
]

export const DEFAULT_PERSONA_ID = 'DEMO-HCP-01'

export function getPersona(id: string): HcpPersona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0]
}
