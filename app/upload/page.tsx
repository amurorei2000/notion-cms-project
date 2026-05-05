import { UploadForm } from '@/components/features/UploadForm';

export default function UploadPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">글 등록</h1>
      <UploadForm />
    </div>
  );
}
