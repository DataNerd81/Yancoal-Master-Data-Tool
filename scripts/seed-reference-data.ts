import { loadEnvConfig } from "@next/env";

// Load .env.local (and other Next.js env files) from project root
loadEnvConfig(process.cwd());

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

interface RefCode {
  code: string;
  description: string;
}

const referenceData: Record<string, RefCode[]> = {
  division: [
    { code: "1000", description: "Coal Operations" },
    { code: "2000", description: "Infrastructure" },
    { code: "3000", description: "Corporate" },
  ],
  business_unit: [
    { code: "1000", description: "Moolarben" },
    { code: "2000", description: "Mount Thorley" },
    { code: "3000", description: "Hunter Valley" },
    { code: "4000", description: "Ashton" },
    { code: "5000", description: "Austar" },
    { code: "6000", description: "Abel" },
    { code: "7000", description: "Stratford" },
    { code: "8000", description: "Duralie" },
  ],
  site_code: [
    { code: "ME", description: "Moolarben East" },
    { code: "MW", description: "Moolarben West" },
    { code: "MT", description: "Mount Thorley" },
    { code: "HV", description: "Hunter Valley" },
    { code: "AS", description: "Ashton" },
    { code: "AU", description: "Austar" },
    { code: "AB", description: "Abel" },
    { code: "ST", description: "Stratford" },
    { code: "DU", description: "Duralie" },
    { code: "LW", description: "Longwall" },
    { code: "IF", description: "Infrastructure" },
  ],
  plant_type: [
    { code: "TR", description: "Truck" },
    { code: "DZ", description: "Dozer" },
    { code: "CV", description: "Conveyor" },
    { code: "EX", description: "Excavator" },
    { code: "DL", description: "Dragline" },
    { code: "LD", description: "Loader" },
    { code: "GR", description: "Grader" },
    { code: "WL", description: "Water Cart/Truck" },
    { code: "CR", description: "Crusher" },
    { code: "SC", description: "Screen" },
    { code: "FD", description: "Feeder" },
    { code: "PP", description: "Pump" },
    { code: "GN", description: "Generator" },
    { code: "CP", description: "Compressor" },
    { code: "LT", description: "Light Vehicle" },
  ],
  component: [
    { code: "ENG", description: "Engine" },
    { code: "HYD", description: "Hydraulic" },
    { code: "ELE", description: "Electrical" },
    { code: "STR", description: "Structural" },
    { code: "TRN", description: "Transmission" },
    { code: "BRK", description: "Brake" },
    { code: "SUS", description: "Suspension" },
    { code: "CAB", description: "Cabin" },
    { code: "TRK", description: "Track" },
    { code: "BKT", description: "Bucket" },
    { code: "BOM", description: "Boom" },
    { code: "STK", description: "Stick" },
  ],
  cost_centre: [
    { code: "CC1001", description: "Moolarben Open Cut" },
    { code: "CC1002", description: "Moolarben Underground" },
    { code: "CC2001", description: "Mount Thorley Open Cut" },
    { code: "CC3001", description: "Hunter Valley Open Cut" },
    { code: "CC4001", description: "Ashton Open Cut" },
    { code: "CC5001", description: "Austar Underground" },
    { code: "CC6001", description: "Abel Underground" },
    { code: "CC7001", description: "Stratford Open Cut" },
    { code: "CC8001", description: "Duralie Open Cut" },
    { code: "CC9001", description: "Corporate Shared" },
  ],
  work_centre: [
    { code: "MECH", description: "Mechanical" },
    { code: "ELEC", description: "Electrical" },
    { code: "INSTR", description: "Instrumentation" },
    { code: "BOIL", description: "Boilermaker" },
    { code: "HVAC", description: "HVAC" },
    { code: "PLMB", description: "Plumbing" },
    { code: "GENL", description: "General" },
  ],
  action_code: [
    { code: "INSP", description: "Inspection" },
    { code: "SRVC", description: "Service" },
    { code: "RPLC", description: "Replace" },
    { code: "REPR", description: "Repair" },
    { code: "OVHL", description: "Overhaul" },
    { code: "TSHT", description: "Troubleshoot" },
    { code: "COND", description: "Condition Monitor" },
    { code: "CALIB", description: "Calibration" },
  ],
  fleet_code: [
    { code: "CAT793", description: "CAT 793D/F Truck" },
    { code: "CAT789", description: "CAT 789D Truck" },
    { code: "HITEX5600", description: "Hitachi EX5600 Excavator" },
    { code: "HITEX3600", description: "Hitachi EX3600 Excavator" },
    { code: "CATD11", description: "CAT D11T Dozer" },
    { code: "CATD10", description: "CAT D10T Dozer" },
    { code: "LT1400", description: "Liebherr T1400 Dragline" },
    { code: "P&H4100", description: "P&H 4100 Dragline" },
  ],
  frequency: [
    { code: "DALY", description: "Daily" },
    { code: "WKLY", description: "Weekly" },
    { code: "MNTH", description: "Monthly" },
    { code: "QRTLY", description: "Quarterly" },
    { code: "SMYR", description: "Semi-Annually" },
    { code: "YRLY", description: "Annually" },
    { code: "HR", description: "Hourly" },
  ],
  location_code: [
    { code: "SHOP", description: "Workshop" },
    { code: "FIELD", description: "Field/Site" },
    { code: "PIT", description: "Open Cut Pit" },
    { code: "UG", description: "Underground" },
    { code: "WASH", description: "Coal Wash Plant" },
    { code: "SURF", description: "Surface Infrastructure" },
    { code: "WHSE", description: "Warehouse" },
  ],
};

async function seed() {
  console.log("Seeding reference data...\n");

  // Ensure unique index exists for idempotent upserts
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS reference_codes_code_type_code_idx
    ON reference_codes (code_type, code)
  `;
  console.log("  Ensured unique index on (code_type, code)\n");

  let totalInserted = 0;

  for (const [codeType, codes] of Object.entries(referenceData)) {
    console.log(`  Inserting ${codeType} (${codes.length} codes)...`);

    for (const { code, description } of codes) {
      await sql`
        INSERT INTO reference_codes (id, code_type, code, description, is_active, created_at, updated_at)
        VALUES (gen_random_uuid(), ${codeType}, ${code}, ${description}, true, now(), now())
        ON CONFLICT (code_type, code)
        DO UPDATE SET description = EXCLUDED.description, is_active = true, updated_at = now()
      `;
      totalInserted++;
    }

    console.log(`  ✓ ${codeType} done`);
  }

  console.log(`\nSeeding complete. ${totalInserted} reference codes upserted.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
