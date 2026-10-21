import { getImageFile, getImageFiles } from "@/content";

// The image copies made at build time (decision 29). The static export
// writes each one to out/images/; next dev makes them on request.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getImageFiles()).map((file) => ({ file }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const image = await getImageFile(file);
  // Not a 404: the static export writes a 404's body to the file too, so a
  // broken image would ship without an error. In a build this only happens
  // when the content changed between listing and making the copies.
  if (!image) throw new Error(`Image copy ${file} is not in this build's image list; did the content change during the build?`);
  return new Response(image.body, { headers: { "Content-Type": image.contentType } });
}
