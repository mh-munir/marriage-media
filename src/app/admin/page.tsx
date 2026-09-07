'use client';

import useSWR from 'swr';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface PendingPhoto {
  userId: string;
  username: string;
  photo: {
    url: string;
    publicId: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

async function handlePhotoAction(
  action: 'approve' | 'reject',
  userId: string,
  publicId: string
) {
  const res = await fetch(`/api/admin/photos/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, publicId }),
  });
  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || `Failed to ${action} photo`);
  }
  return res.json();
}

const PhotoItemSkeleton = () => (
  <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-25" />
        <Skeleton className="h-4 w-37.5" />
        <Skeleton className="h-4 w-25" />
        <Skeleton className="h-4 w-37.5" />
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      <Skeleton className="h-9 w-9" />
      <Skeleton className="h-9 w-9" />
    </div>
  </div>
);

export default function PhotoModerationPage() {
  const {
    data,
    error: photosError,
    mutate: mutatePhotos,
  } = useSWR<{ pendingPhotos: PendingPhoto[] }>('/api/admin/photos/pending', fetcher);

  const onApprove = async (userId: string, publicId: string) => {
    const optimisticData = data
      ? {
          ...data,
          pendingPhotos: data.pendingPhotos.filter(
            (p) => p.photo.publicId !== publicId
          ),
        }
      : undefined;

    mutatePhotos(optimisticData, { revalidate: false });

    try {
      await handlePhotoAction('approve', userId, publicId);
      toast.success('Photo approved!');
    } catch (e: any) {
      toast.error(e.message);
      // On error, revert to the original data and revalidate
      mutatePhotos(data, { revalidate: true });
    }
  };

  const onReject = async (userId: string, publicId: string) => {
    const optimisticData = data
      ? {
          ...data,
          pendingPhotos: data.pendingPhotos.filter(
            (p) => p.photo.publicId !== publicId
          ),
        }
      : undefined;

    mutatePhotos(optimisticData, { revalidate: false });

    try {
      await handlePhotoAction('reject', userId, publicId);
      toast.warning('Photo rejected and deleted.');
    } catch (e: any) {
      toast.error(e.message);
      // On error, revert to the original data and revalidate
      mutatePhotos(data, { revalidate: true });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Photo Moderation</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pending Photo Approvals ({data?.pendingPhotos?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {photosError && <p className="text-destructive">Failed to load photos.</p>}
          {!data && !photosError && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <PhotoItemSkeleton key={i} />
              ))}
            </div>
          )}
          {data && data.pendingPhotos.length === 0 && (
            <p>No photos are currently pending approval.</p>
          )}
          <div className="space-y-4">
            {data?.pendingPhotos?.map(({ userId, username, photo }) => (
              <div key={photo.publicId} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={photo.url} alt={`Photo by ${username}`} />
                    <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{username}</p>
                    <p className="text-sm text-muted-foreground">ID: {userId}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => onApprove(userId, photo.publicId)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onReject(userId, photo.publicId)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}