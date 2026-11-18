import type { MetadataRoute } from 'next';
import { buildManifestConfig } from '@/lib/pwa';

export default function manifest(): MetadataRoute.Manifest {
  return buildManifestConfig();
}
