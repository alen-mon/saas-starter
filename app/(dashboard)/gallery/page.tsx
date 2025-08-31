export default function GalleryPage() {
  const items = [
    { src: "/gallery/1.jpg", cap: "Dawn briefings." },
    { src: "/gallery/2.jpg", cap: "Forest singletracks." },
    { src: "/gallery/3.jpg", cap: "Ridge push." },
    { src: "/gallery/4.jpg", cap: "River crossing." },
    { src: "/gallery/5.jpg", cap: "Village welcome." },
    { src: "/gallery/6.jpg", cap: "Finishers’ glory." },
  ];
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold">Gallery</h1>
      <p className="mt-2 text-gray-600">A collage of moments from the trail.</p>
      <div className="mt-8 columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        {items.map((it) => (
          <figure
            key={it.src}
            className="break-inside-avoid mb-4 rounded-xl overflow-hidden border bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.src}
              alt={it.cap}
              className="w-full h-auto object-cover"
            />
            {it.cap && (
              <figcaption className="p-3 text-sm text-gray-600">
                {it.cap}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </main>
  );
}
