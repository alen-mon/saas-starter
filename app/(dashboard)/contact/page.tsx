export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <div className="mt-6 grid gap-6">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">General</h2>
          <dl className="mt-2 text-gray-700">
            <div className="flex gap-2">
              <dt className="w-28">Email</dt>
              <dd>teamadvenduro@gmail.com</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28">WhatsApp</dt>
              <dd>+91-9435660906</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Social</h2>
          <ul className="mt-2 text-gray-700 space-y-1">
            <li>
              Instagram: <span className="underline">team advenduro</span> /{" "}
              <span className="underline">advenduro</span>
            </li>
            <li>
              Facebook: <span className="underline">advenduro</span> /{" "}
              <span className="underline">teamadvenduro</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">Become a Sponsor</h2>
          <p className="mt-2 text-gray-700">
            Interested in partnering with Advenduro? Drop us a line with your
            brand profile and objectives. We’ll share the season deck and
            opportunities.
          </p>
          <a
            href="mailto:teamadvenduro@gmail.com?subject=Sponsor%20Enquiry%20—%20Advenduro"
            className="mt-3 inline-block rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Email us
          </a>
        </div>
      </div>
    </main>
  );
}
