export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold">Terms & Conditions</h1>
      <p className="mt-4 text-gray-600">
        By registering and participating in NEA, riders and teams acknowledge
        and accept the following terms.
      </p>

      <div className="mt-8 space-y-6 text-gray-700">
        <section>
          <h2 className="text-lg font-semibold">Assumption of Risk & Waiver</h2>
          <p className="mt-2">
            Participants acknowledge that adventure motorsports carry inherent
            risks (injury, accident, property damage). By entering, you
            voluntarily assume these risks and agree not to hold NEA, its
            partners, or officials liable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Refunds & Cancellations</h2>
          <p className="mt-2">
            Entry fees are refundable only if the event is cancelled before
            flag-off. Once started, no refunds are available. Team substitutions
            are not permitted.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Media Usage Rights</h2>
          <p className="mt-2">
            By participating, you grant NEA and its media partners rights to use
            photos, videos, and other media of your participation for
            promotional purposes without additional compensation.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Privacy & Data Handling</h2>
          <p className="mt-2">
            Rider data will be collected for event management, insurance, and
            safety. Information will be shared only with officials, medical
            teams, and insurance providers as required.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Governing Law & Disputes</h2>
          <p className="mt-2">
            These terms are governed by Indian law. Any disputes shall be
            settled under the jurisdiction of Nagaland courts.
          </p>
        </section>
      </div>
    </main>
  );
}
