import { FolderDetailView } from '@/components/app/folder-detail-view';

export default async function FolderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FolderDetailView id={id} />;
}
