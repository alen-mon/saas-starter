"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100"
      >
        <span className="font-semibold">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {open && (
        <div className="px-5 py-4 text-gray-700 space-y-3">{children}</div>
      )}
    </div>
  );
}

export default function RulesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold">Official Event Rules</h1>
      <p className="mt-4 text-gray-600">
        This page outlines the official regulations of the North East Advenduro
        (NEA), covering eligibility, motorcycle requirements, checkpoints,
        safety, and disqualifications.
      </p>

      <div className="mt-8 space-y-6">
        <Section title="General Rules" defaultOpen>
          <ol className="list-decimal pl-6 space-y-2">
            <li>NEA is strictly a team event (3–5 members only).</li>
            <li>
              No track reading will be provided; navigation is via checkpoint
              coordinates.
            </li>
            <li>Duration: 3–5 days and 2–4 nights.</li>
            <li>Start: 6 AM Day 1 · End: 12 Midnight Day 3–5.</li>
            <li>
              Riders assessed on perseverance, problem-solving, navigation, and
              riding.
            </li>
            <li>
              Bring your own camping, rations, first-aid, and survival gear.
            </li>
            <li>
              Max speed in towns/villages: 35 kph. Violations or accidents = no
              further coordinates.
            </li>
            <li>No alcohol during the adventure.</li>
          </ol>
        </Section>

        <Section title="Motorcycle Rules">
          <ol className="list-decimal pl-6 space-y-2">
            <li>Only ADV/offroad bikes ≥200cc (no modified dirt bikes).</li>
            <li>Dual-sport/off-road tyres required.</li>
            <li>
              Participants must repair their own bikes (no unregistered team
              mechanics).
            </li>
            <li>Inspection: one day before start + at finish line.</li>
            <li>Exhaust noise must meet legal limits.</li>
            <li>All docs up to date: RC, Insurance, PUCC.</li>
          </ol>
        </Section>

        <Section title="Checkpoints & Coordinates">
          <ul className="list-disc pl-6 space-y-2">
            <li>First coordinates at start line, next at each checkpoint.</li>
            <li>
              Teams must submit group photo (without helmets) via official
              WhatsApp/Insta group.
            </li>
            <li>No photo or missed checkpoint = no further coordinates.</li>
          </ul>
        </Section>

        <Section title="Travel Period Cut-Offs">
          <ul className="list-disc pl-6 space-y-2">
            <li>Day 1: 5 AM – 8 PM</li>
            <li>Day 2: 5 AM – 8 PM</li>
            <li>Day 3: 5 AM – 12 Midnight</li>
            <li>
              No extensions; riding after cutoff prohibited, esp. in
              tribal/inner roads.
            </li>
          </ul>
        </Section>

        <Section title="GPS Tracking">
          <ul className="list-disc pl-6 space-y-2">
            <li>All teams monitored via GPS Fleet devices + mobile app.</li>
            <li>Each team: 2 bikes with GPS devices wired to battery.</li>
            <li>All riders must enable GPS tracking on phones throughout.</li>
          </ul>
        </Section>

        <Section title="Disqualifications">
          <ul className="list-disc pl-6 space-y-2">
            <li>No claiming “winner” or “first to arrive” online.</li>
            <li>Disrespect to local communities = ban.</li>
            <li>More than 2 members unable to continue = team out.</li>
            <li>Accidents = no continuation.</li>
            <li>No merging teams, no support vehicles (emergency only).</li>
            <li>No bike/rider swaps; no mechanics/pillions allowed.</li>
            <li>Exceeding travel cutoff = DQ.</li>
            <li>GPS tampering/disabling = DQ.</li>
            <li>
              Disqualified riders may continue unofficially (no recognition).
            </li>
          </ul>
        </Section>

        <Section title="Motorcycle Rescue & Recovery">
          <p>
            NEA does not provide hauling services. Rescue is the responsibility
            of the team’s support/rescue vehicle. Ambulances are on standby and
            sweep the route.
          </p>
        </Section>

        <Section title="Event Registration Rules">
          <ul className="list-disc pl-6 space-y-2">
            <li>Teams: exactly 5 members, online registration only.</li>
            <li>
              No slot reservations; limited slots (incl. demo-bike sponsors).
            </li>
            <li>
              Docs: License, RC, Pollution/Green Tax, Medical clearance (60+
              riders).
            </li>
            <li>All riders must have valid accident/health insurance.</li>
          </ul>
        </Section>

        <Section title="Rights & Obligations of Organisers">
          <p className="text-gray-700 leading-relaxed">
            Advenduro reserves the right to amend, postpone, cancel, or alter
            rules and routes due to unforeseen circumstances or force majeure.
            Entries may be refused with sufficient reason. Entry fees refunded
            fully if the event does not flag off.
          </p>
        </Section>
      </div>
    </main>
  );
}
