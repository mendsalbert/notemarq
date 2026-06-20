import { ReaderView } from '@/components/app/reader-view';

export default async function AppReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReaderView id={id} />;
}
