import { redirect } from 'next/navigation'

/** Patient detail currently leads with monitoring, the primary workflow. */
export default function PatientPage({ params }: { params: { id: string } }) {
  redirect(`/patients/${params.id}/monitoring`)
}
