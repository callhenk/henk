// Lead list management utilities

/**
 * Ensure a Salesforce sync lead list exists
 * Creates one if it doesn't exist, returns the ID
 * @param supabase Supabase client
 * @param businessId Business ID
 * @param name List name
 * @param description List description
 * @returns Lead list ID
 */
export async function ensureSalesforceList(
  supabase: any,
  businessId: string,
  name: string,
  description: string,
): Promise<string> {
  try {
    // Check if list already exists
    const { data: existing } = await supabase
      .from('lead_lists')
      .select('id')
      .eq('business_id', businessId)
      .eq('name', name)
      .eq('source', 'salesforce_sync')
      .maybeSingle();

    if (existing) {
      console.log(
        `[list-manager] list exists listId=${existing.id} name="${name}"`,
      );
      return existing.id;
    }

    // Create new list
    const newListId = crypto.randomUUID();
    const { data: newList, error } = await supabase
      .from('lead_lists')
      .insert({
        id: newListId,
        business_id: businessId,
        name,
        description,
        color: '#0070f3', // Salesforce blue
        list_type: 'static',
        source: 'salesforce_sync',
        lead_count: 0,
        last_updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error(
        `[list-manager] failed to create list name="${name}"`,
        error.message,
      );
      throw new Error(`Failed to create lead list: ${error.message}`);
    }

    console.log(
      `[list-manager] created list listId=${newList.id} name="${name}"`,
    );

    return newList.id;
  } catch (error) {
    console.error(
      `[list-manager] exception in ensureSalesforceList name="${name}"`,
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

/**
 * Add a lead to a lead list
 * @param supabase Supabase client
 * @param leadListId Lead list ID
 * @param leadId Lead ID
 */
export async function addLeadToList(
  supabase: any,
  leadListId: string,
  leadId: string,
): Promise<void> {
  try {
    const { error } = await supabase.from('lead_list_members').upsert(
      {
        lead_list_id: leadListId,
        lead_id: leadId,
        added_at: new Date().toISOString(),
      },
      {
        onConflict: 'lead_list_id,lead_id',
      },
    );

    if (error) {
      console.log(
        `[list-manager] failed to add lead to list leadListId=${leadListId} leadId=${leadId}`,
        error.message,
      );
    }
  } catch (error) {
    console.log(
      `[list-manager] exception adding lead to list leadListId=${leadListId} leadId=${leadId}`,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}

/**
 * Update lead counts for the specified lists
 * @param supabase Supabase client
 * @param listIds Array of lead list IDs
 */
export async function updateLeadListCounts(
  supabase: any,
  listIds: string[],
): Promise<void> {
  for (const listId of listIds) {
    try {
      // Count members in the list
      const { count, error: countError } = await supabase
        .from('lead_list_members')
        .select('*', { count: 'exact', head: true })
        .eq('lead_list_id', listId);

      if (countError) {
        console.log(
          `[list-manager] failed to count members listId=${listId}`,
          countError.message,
        );
        continue;
      }

      // Update the count
      const { error: updateError } = await supabase
        .from('lead_lists')
        .update({
          lead_count: count || 0,
          last_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', listId);

      if (updateError) {
        console.log(
          `[list-manager] failed to update count listId=${listId}`,
          updateError.message,
        );
      } else {
        console.log(
          `[list-manager] updated count listId=${listId} count=${count || 0}`,
        );
      }
    } catch (error) {
      console.log(
        `[list-manager] exception updating count listId=${listId}`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
