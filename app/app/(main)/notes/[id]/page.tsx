import { NoteDetailView } from '@/components/app/note-detail-view';

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NoteDetailView id={id} />;
}
