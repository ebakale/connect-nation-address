import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BackupRequest {
  tables?: string[]
  format?: 'json' | 'csv'
  includeAuditLogs?: boolean
  compressionLevel?: number
}

interface BackupResponse {
  backupId: string
  downloadUrl?: string
  metadata: {
    timestamp: string
    tablesIncluded: string[]
    recordCounts: Record<string, number>
    sizeBytes: number
    format: string
  }
  status: 'completed' | 'failed' | 'processing'
  error?: string
}

const BACKUP_TABLES = [
  'addresses',
  'address_requests', 
  'coverage_analytics',
  'quality_metrics',
  'provinces',
  'user_roles',
  'profiles',
  'emergency_incidents',
  'emergency_units',
  'emergency_unit_members'
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      // Create backup
      const { 
        tables = BACKUP_TABLES, 
        format = 'json', 
        includeAuditLogs = true 
      }: BackupRequest = await req.json()

      console.log('Creating backup for tables:', tables)

      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const timestamp = new Date().toISOString()
      const backupData: Record<string, any[]> = {}
      const recordCounts: Record<string, number> = {}

      // Include audit logs if requested
      const tablesToBackup = includeAuditLogs 
        ? [...tables, 'address_audit_log']
        : tables.filter(t => t !== 'address_audit_log')

      // Fetch data from each table
      for (const table of tablesToBackup) {
        try {
          const { data, error } = await supabaseClient
            .from(table)
            .select('*')
            .order('created_at', { ascending: false })

          if (error) {
            console.error(`Error backing up table ${table}:`, error)
            recordCounts[table] = 0
            backupData[table] = []
          } else {
            recordCounts[table] = data?.length || 0
            backupData[table] = data || []
          }
        } catch (tableError) {
          console.error(`Error accessing table ${table}:`, tableError)
          recordCounts[table] = 0
          backupData[table] = []
        }
      }

      // Calculate backup size
      const backupJson = JSON.stringify(backupData)
      const sizeBytes = new TextEncoder().encode(backupJson).length

      // Store backup metadata
      const { error: metadataError } = await supabaseClient
        .from('backup_metadata')
        .insert({
          backup_id: backupId,
          timestamp,
          tables_included: tablesToBackup,
          record_counts: recordCounts,
          size_bytes: sizeBytes,
          format,
          status: 'completed'
        })
        .single()

      if (metadataError) {
        console.error('Error storing backup metadata:', metadataError)
        // Continue anyway as backup data is still generated
      }

      const response: BackupResponse = {
        backupId,
        metadata: {
          timestamp,
          tablesIncluded: tablesToBackup,
          recordCounts,
          sizeBytes,
          format
        },
        status: 'completed'
      }

      // For small backups, return data directly
      if (sizeBytes < 5 * 1024 * 1024) { // 5MB limit
        return new Response(
          JSON.stringify({
            ...response,
            data: backupData
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Content-Disposition': `attachment; filename="${backupId}.json"`
            },
            status: 200
          }
        )
      } else {
        return new Response(
          JSON.stringify(response),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        )
      }

    } else if (req.method === 'GET') {
      // List recent backups
      const { data: backups, error } = await supabaseClient
        .from('backup_metadata')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20)

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ backups: backups || [] }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } else {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Error in backup system:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})