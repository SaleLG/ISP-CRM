"use server";

import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import {
  parseSpreadsheet,
  autoMapColumns,
  mapRow,
  validateMappedRow,
} from "@/lib/import";
import { normalizePhone } from "@/lib/phone";
import { revalidatePath } from "next/cache";

export async function previewImport(formData: FormData) {
  await requireRole(["admin", "manager"]);

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const buffer = await file.arrayBuffer();
  const { headers, rows } = parseSpreadsheet(buffer);
  const autoMapping = autoMapColumns(headers);

  return {
    headers,
    autoMapping,
    previewRows: rows.slice(0, 20).map((raw, i) => ({
      rowNumber: i + 2,
      mapped: mapRow(raw, autoMapping),
    })),
    rows,
    totalRows: rows.length,
    fileName: file.name,
  };
}

async function findExistingCustomer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ispId: string,
  mapped: Record<string, string | null>
) {
  if (mapped.account_number) {
    const { data } = await supabase
      .from("customers")
      .select("id")
      .eq("isp_id", ispId)
      .eq("account_number", mapped.account_number)
      .maybeSingle();
    if (data) return data.id;
  }

  const normalized = mapped.normalized_phone || normalizePhone(mapped.phone);
  if (normalized) {
    const { data } = await supabase
      .from("customers")
      .select("id")
      .eq("isp_id", ispId)
      .eq("normalized_phone", normalized)
      .maybeSingle();
    if (data) return data.id;
  }

  if (mapped.full_name && mapped.address) {
    const { data } = await supabase
      .from("customers")
      .select("id")
      .eq("isp_id", ispId)
      .eq("full_name", mapped.full_name)
      .eq("address", mapped.address)
      .maybeSingle();
    if (data) return data.id;
  }

  return null;
}

export async function confirmImport(params: {
  ispId: string;
  fileName: string;
  columnMapping: Record<string, string>;
  rows: Record<string, string | null>[];
}) {
  const profile = await requireRole(["admin", "manager"]);
  const supabase = await createClient();
  const defaultTeam = "Senior Sales Team";

  const { data: importRecord, error: importError } = await supabase
    .from("imports")
    .insert({
      isp_id: params.ispId,
      file_name: params.fileName,
      uploaded_by: profile.id,
      default_assigned_team: defaultTeam,
      total_rows: params.rows.length,
    })
    .select()
    .single();

  if (importError) throw new Error(importError.message);

  let newCustomers = 0;
  let updatedCustomers = 0;
  let skippedRows = 0;
  let errorRows = 0;

  for (let i = 0; i < params.rows.length; i++) {
    const raw = params.rows[i];
    const mapped = mapRow(raw, params.columnMapping);
    const validationError = validateMappedRow(mapped);

    if (validationError) {
      errorRows++;
      await supabase.from("import_rows").insert({
        import_id: importRecord.id,
        row_number: i + 2,
        raw_data: raw as Record<string, unknown>,
        status: "error",
        error_message: validationError,
      });
      continue;
    }

    try {
      const existingId = await findExistingCustomer(
        supabase,
        params.ispId,
        mapped
      );

      const customerData = {
        isp_id: params.ispId,
        account_number: mapped.account_number,
        isp_status: mapped.isp_status,
        full_name: mapped.full_name,
        phone: mapped.phone,
        normalized_phone: mapped.normalized_phone || normalizePhone(mapped.phone),
        address: mapped.address,
        product: mapped.product,
        term: mapped.term,
        order_date: mapped.order_date,
        install_date: mapped.install_date,
        install_complete: mapped.install_complete,
        sales_rep_id: mapped.sales_rep_id,
        isp_notes: mapped.isp_notes,
        source_import_id: importRecord.id,
      };

      let customerId: string;

      if (existingId) {
        const { data, error } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", existingId)
          .select("id")
          .single();

        if (error) throw error;
        customerId = data.id;
        updatedCustomers++;

        await supabase.from("import_rows").insert({
          import_id: importRecord.id,
          row_number: i + 2,
          raw_data: raw,
          status: "updated",
          customer_id: customerId,
        });
      } else {
        const { data, error } = await supabase
          .from("customers")
          .insert({
            ...customerData,
            assigned_team: defaultTeam,
            workflow_stage: "New",
            call_attempt_number: 0,
          })
          .select("id")
          .single();

        if (error) throw error;
        customerId = data.id;
        newCustomers++;

        await supabase.from("import_rows").insert({
          import_id: importRecord.id,
          row_number: i + 2,
          raw_data: raw,
          status: "new",
          customer_id: customerId,
        });

        await supabase.from("activities").insert({
          customer_id: customerId,
          user_id: profile.id,
          activity_type: "import",
          description: `Imported from ${params.fileName}`,
        });
      }
    } catch (err) {
      errorRows++;
      await supabase.from("import_rows").insert({
        import_id: importRecord.id,
        row_number: i + 2,
        raw_data: raw,
        status: "error",
        error_message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  await supabase
    .from("imports")
    .update({
      new_customers: newCustomers,
      updated_customers: updatedCustomers,
      skipped_rows: skippedRows,
      error_rows: errorRows,
    })
    .eq("id", importRecord.id);

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  revalidatePath("/senior-sales");
  revalidatePath("/import");

  return {
    total_rows: params.rows.length,
    new_customers: newCustomers,
    updated_customers: updatedCustomers,
    skipped_rows: skippedRows,
    error_rows: errorRows,
  };
}
